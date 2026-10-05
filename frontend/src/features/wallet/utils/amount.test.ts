import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { AMOUNT_LIMITS, parseAmount, sanitizeAmount, validateAmount } from './amount'

const SALDO = 5_000

describe('validateAmount · depósito', () => {
  const recargar = (amount: number) => validateAmount(amount, 'deposit', SALDO)

  it('acepta un monto normal', () => {
    expect(recargar(500)).toBeUndefined()
  })

  it('acepta los extremos exactos', () => {
    expect(recargar(AMOUNT_LIMITS.min)).toBeUndefined()
    expect(recargar(AMOUNT_LIMITS.max)).toBeUndefined()
  })

  it('rechaza por debajo del mínimo', () => {
    expect(recargar(AMOUNT_LIMITS.min - 1)).toMatch(/mínimo/)
  })

  it('rechaza por encima del tope', () => {
    expect(recargar(AMOUNT_LIMITS.max + 1)).toMatch(/máximo/)
  })

  it('rechaza cero y negativos', () => {
    expect(recargar(0)).toBeDefined()
    expect(recargar(-500)).toBeDefined()
  })

  it('no depende del saldo: se puede recargar con la cuenta vacía', () => {
    expect(validateAmount(500, 'deposit', 0)).toBeUndefined()
  })
})

describe('validateAmount · retiro', () => {
  const retirar = (amount: number, balance = SALDO) => validateAmount(amount, 'withdrawal', balance)

  it('acepta un monto dentro del saldo', () => {
    expect(retirar(500)).toBeUndefined()
  })

  it('rechaza más de lo que hay', () => {
    expect(retirar(SALDO + 1)).toMatch(/Solo tienes/)
  })

  it('acepta el saldo entero', () => {
    expect(retirar(SALDO)).toBeUndefined()
  })

  it('con saldo cero no se puede retirar nada', () => {
    expect(retirar(AMOUNT_LIMITS.min, 0)).toBeDefined()
  })

  it('también aplica el tope por operación, aunque haya saldo de sobra', () => {
    // La pasarela rechaza un retiro por encima del tope. Si el formulario lo
    // dejara pasar, el usuario se enteraría del límite después de confirmar.
    expect(retirar(AMOUNT_LIMITS.max + 1, 100_000)).toMatch(/máximo/)
  })

  it('avisa del saldo antes que del tope cuando faltan las dos cosas', () => {
    // A quien pide más de lo que tiene le sirve más saber cuánto tiene.
    expect(retirar(AMOUNT_LIMITS.max + 1, 100)).toMatch(/Solo tienes/)
  })
})

describe('contrato de límites con la pasarela', () => {
  it('coincide con AMOUNT_LIMITS de snailpay-api', () => {
    // Las constantes están escritas en dos repositorios y nada avisa si
    // divergen. Esto es lo que avisa: ya ocurrió una vez, cuando el cliente
    // topaba las recargas pero no los retiros.
    const fuente = readFileSync(
      new URL('../../../../../snailpay-api/src/modules/payments/payments.schema.ts', import.meta.url),
      'utf8',
    )
    // Se parsea partiendo por comas y dos puntos en vez de con un patrón por
    // campo: menos ingenioso, pero no se rompe con un cambio de formato.
    const cuerpo = fuente.match(/AMOUNT_LIMITS = \{([^}]*)\}/)?.[1] ?? ''
    const limites = Object.fromEntries(
      cuerpo.split(',').map((par: string) => {
        const [campo = '', valor = ''] = par.split(':')
        return [campo.trim(), Number(valor.replace(/_/g, '').trim())]
      }),
    )

    expect(limites['min']).toBe(AMOUNT_LIMITS.min)
    expect(limites['max']).toBe(AMOUNT_LIMITS.max)
  })
})

describe('sanitizeAmount', () => {
  it('deja solo dígitos y un punto', () => {
    expect(sanitizeAmount('1,000.50')).toBe('1000.50')
    expect(sanitizeAmount('$1 000')).toBe('1000')
  })

  it('recorta a dos decimales', () => {
    expect(sanitizeAmount('1000.505')).toBe('1000.50')
  })

  it('colapsa varios puntos en uno', () => {
    expect(sanitizeAmount('1.0.0')).toBe('1.00')
  })
})

describe('parseAmount', () => {
  it('trata vacío y punto suelto como cero', () => {
    expect(parseAmount('')).toBe(0)
    expect(parseAmount('.')).toBe(0)
  })

  it('convierte lo demás', () => {
    expect(parseAmount('1000.50')).toBe(1000.5)
  })
})
