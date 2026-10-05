import { describe, expect, it } from 'vitest'
import { dummyVerify, hashPassword, verifyPassword } from './passwordHash'

const CONTRASENA = 'Contrasena1!'

describe('hashPassword', () => {
  it('nunca devuelve la contraseña', async () => {
    const hash = await hashPassword(CONTRASENA)

    expect(hash).not.toContain(CONTRASENA)
  })

  it('usa el formato autodescriptivo, con sus parámetros dentro', async () => {
    const [algoritmo, iteraciones, salt, derivado] = (await hashPassword(CONTRASENA)).split('$')

    // Guardar algoritmo e iteraciones junto al hash permite subirlas mañana sin
    // invalidar las contraseñas ya registradas.
    expect(algoritmo).toBe('pbkdf2-sha256')
    expect(iteraciones).toBe('600000')
    expect(Buffer.from(salt!, 'base64')).toHaveLength(16)
    expect(Buffer.from(derivado!, 'base64')).toHaveLength(32)
  })

  it('da un salt distinto a cada usuario', async () => {
    const [a, b] = await Promise.all([hashPassword(CONTRASENA), hashPassword(CONTRASENA)])

    // La misma contraseña no puede producir el mismo hash: sin salt por usuario,
    // una tabla precomputada serviría contra todos a la vez.
    expect(a).not.toBe(b)
    expect(a.split('$')[2]).not.toBe(b.split('$')[2])
  })
})

describe('verifyPassword', () => {
  it('acepta la contraseña correcta', async () => {
    const hash = await hashPassword(CONTRASENA)

    expect(await verifyPassword(CONTRASENA, hash)).toBe(true)
  })

  it('verifica contra hashes distintos de la misma contraseña', async () => {
    const [a, b] = await Promise.all([hashPassword(CONTRASENA), hashPassword(CONTRASENA)])

    expect(await verifyPassword(CONTRASENA, a)).toBe(true)
    expect(await verifyPassword(CONTRASENA, b)).toBe(true)
  })

  it('rechaza cualquier otra', async () => {
    const hash = await hashPassword(CONTRASENA)

    for (const intento of [CONTRASENA + ' ', CONTRASENA.toUpperCase(), 'Contrasena1', '']) {
      expect(await verifyPassword(intento, hash), intento).toBe(false)
    }
  })

  it('conserva los caracteres no ASCII', async () => {
    // El hash se deriva sobre los bytes UTF-8: una ñ o un acento no pueden
    // perderse por el camino o el usuario quedaría fuera de su cuenta.
    const hash = await hashPassword('Contraseñá1!€')

    expect(await verifyPassword('Contraseñá1!€', hash)).toBe(true)
    expect(await verifyPassword('Contrasena1!€', hash)).toBe(false)
  })

  it('no revienta con un hash corrupto, inventado o ausente', async () => {
    const corruptos = [
      '',
      'no-es-un-hash',
      'pbkdf2-sha256$600000$solo-tres-campos',
      'pbkdf2-sha256$abc$AAAA$AAAA',
      'otro-algoritmo$600000$AAAA$AAAA',
      undefined,
      null,
      42,
    ]

    for (const valor of corruptos) {
      expect(await verifyPassword(CONTRASENA, valor), String(valor)).toBe(false)
    }
  })
})

describe('dummyVerify', () => {
  it('siempre falla', async () => {
    expect(await dummyVerify(CONTRASENA)).toBe(false)
  })

  it('cuesta un tiempo comparable a verificar de verdad', async () => {
    // Existe para que un correo inexistente no falle al instante: si lo hiciera,
    // el tiempo de respuesta delataría qué cuentas están registradas.
    const hash = await hashPassword(CONTRASENA)

    const inicio = performance.now()
    await verifyPassword(CONTRASENA, hash)
    const real = performance.now() - inicio

    const inicioFalso = performance.now()
    await dummyVerify(CONTRASENA)
    const falso = performance.now() - inicioFalso

    // Holgado a propósito: la máquina que ejecuta esto no es estable. Lo que se
    // comprueba es el orden de magnitud, no una cifra.
    expect(falso).toBeGreaterThan(real * 0.3)
  })
})
