import request from 'supertest'
import { afterEach, describe, expect, it } from 'vitest'
import { app, bearer, payment, payout } from './helpers.js'

const estado = (status: 'operational' | 'major_outage') =>
  request(app).put('/admin/status').send({ status })

const apagar = () => estado('major_outage')
const encender = () => estado('operational')

// El estado vive en memoria y lo comparten todas las pruebas de este archivo.
afterEach(async () => {
  await encender()
})

describe('GET /status', () => {
  it('informa que acepta cobros', async () => {
    const { status, body } = await request(app).get('/status')

    expect(status).toBe(200)
    expect(body).toMatchObject({ status: 'operational', payments_enabled: true })
    expect(Date.parse(body.checked_at)).not.toBeNaN()
  })

  it('responde 200 también estando caída', async () => {
    await apagar()
    const { status, body } = await request(app).get('/status')

    // Si devolviera 503, el cliente no podría distinguir "está caída" de "no la
    // alcanzo". El estado va en el cuerpo, no en el código HTTP.
    expect(status).toBe(200)
    expect(body).toMatchObject({ status: 'major_outage', payments_enabled: false })
  })
})

describe('GET /health', () => {
  it('sigue sano con la pasarela apagada', async () => {
    await apagar()

    // El apagado es deliberado, no una caída: si /health fallara, un orquestador
    // reiniciaría el contenedor en bucle.
    expect((await request(app).get('/health')).status).toBe(200)
  })
})

describe('PUT /admin/status', () => {
  it('apaga y enciende', async () => {
    expect((await apagar()).body.payments_enabled).toBe(false)
    expect((await encender()).body.payments_enabled).toBe(true)
  })

  it('rechaza un estado que no existe', async () => {
    const { status } = await request(app).put('/admin/status').send({ status: 'inventado' })
    expect(status).toBe(400)
  })

  it('dice qué falta cuando no llega cuerpo', async () => {
    const { status, body } = await request(app).put('/admin/status')

    expect(status).toBe(400)
    // Sin la cabecera de tipo, Express no parsea y zod solo sabría decir
    // "esperaba un objeto", que no apunta a la causa.
    expect(body.message).toMatch(/Content-Type/)
  })
})

describe('con la pasarela caída', () => {
  it('un cobro responde 503 con Retry-After', async () => {
    await apagar()
    const { status, headers } = await request(app)
      .post('/payments')
      .set('Authorization', bearer())
      .send(payment())

    expect(status).toBe(503)
    expect(headers['retry-after']).toBe('30')
  })

  it('un retiro también', async () => {
    await apagar()
    const { status } = await request(app)
      .post('/payouts')
      .set('Authorization', bearer())
      .send(payout())

    expect(status).toBe(503)
  })

  it('corta antes de validar el cuerpo', async () => {
    await apagar()
    const { status } = await request(app).post('/payments').set('Authorization', bearer()).send({})

    // Con datos basura daría 400 si la validación corriera primero.
    expect(status).toBe(503)
  })

  it('corta antes de autenticar', async () => {
    await apagar()
    const { status } = await request(app).post('/payments').send(payment())

    // Sin token daría 401 si la autenticación corriera primero. Que los dos
    // casos den 503 es lo que demuestra que el corte es lo primero: no se gasta
    // trabajo en revisar una tarjeta cuyo cobro no se va a intentar.
    expect(status).toBe(503)
  })

  it('vuelve a cobrar al restaurar', async () => {
    await apagar()
    await encender()
    const { status } = await request(app)
      .post('/payments')
      .set('Authorization', bearer())
      .send(payment())

    expect(status).toBe(201)
  })
})
