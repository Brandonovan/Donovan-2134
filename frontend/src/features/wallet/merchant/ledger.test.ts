import { beforeEach, describe, expect, it } from 'vitest'
import { startSession } from '@/services/session'
import { post, readWallet } from './ledger'
import type { Transaction } from '../types'

const movimiento = (cambios: Partial<Transaction> = {}): Transaction => ({
  id: 'pay_0000000001',
  type: 'deposit',
  amount: 500,
  method: 'Visa débito •••• 4242',
  createdAt: new Date().toISOString(),
  ...cambios,
})

beforeEach(() => {
  startSession('usuario-ada')
})

describe('billetera nueva', () => {
  it('empieza en cero y sin movimientos', () => {
    const { balance, transactions } = readWallet()

    expect(balance).toBe(0)
    expect(transactions).toEqual([])
  })
})

describe('depósitos', () => {
  it('suman al saldo', () => {
    expect(post(movimiento({ amount: 500 }))).toBe(500)
    expect(post(movimiento({ id: 'pay_2', amount: 250 }))).toBe(750)
  })

  it('dejan el movimiento en el historial', () => {
    post(movimiento())

    expect(readWallet().transactions).toHaveLength(1)
    expect(readWallet().transactions[0]).toMatchObject({ id: 'pay_0000000001', amount: 500 })
  })

  it('ponen el más reciente primero', () => {
    post(movimiento({ id: 'primero' }))
    post(movimiento({ id: 'segundo' }))

    expect(readWallet().transactions.map((t) => t.id)).toEqual(['segundo', 'primero'])
  })
})

describe('retiros', () => {
  it('restan del saldo', () => {
    post(movimiento({ amount: 1_000 }))

    expect(post(movimiento({ id: 'pyo_1', type: 'withdrawal', amount: 400 }))).toBe(600)
  })

  it('quedan en el historial como retiros', () => {
    post(movimiento({ id: 'pyo_1', type: 'withdrawal', amount: 400 }))

    expect(readWallet().transactions[0]?.type).toBe('withdrawal')
  })

  it('el libro no comprueba el saldo: esa regla vive antes', () => {
    // El ledger solo asienta lo ya autorizado. Quien decide si alcanza es
    // validateAmount, porque la pasarela no conoce el saldo.
    expect(post(movimiento({ type: 'withdrawal', amount: 400 }))).toBe(-400)
  })
})

describe('aritmética del saldo', () => {
  it('no acumula error de coma flotante', () => {
    // 0.1 + 0.2 no es 0.3 en binario. Sin redondear a centavos, el saldo se
    // desviaría de la suma de sus movimientos poco a poco.
    post(movimiento({ id: 'a', amount: 0.1 }))
    post(movimiento({ id: 'b', amount: 0.2 }))

    expect(readWallet().balance).toBe(0.3)
  })

  it('aguanta muchas operaciones seguidas', () => {
    for (let i = 0; i < 50; i += 1) post(movimiento({ id: `m${i}`, amount: 0.07 }))

    expect(readWallet().balance).toBe(3.5)
  })
})

describe('aislamiento por usuario', () => {
  it('cada usuario tiene su propia billetera', () => {
    post(movimiento({ amount: 500 }))

    startSession('usuario-bea')
    expect(readWallet().balance).toBe(0)

    startSession('usuario-ada')
    expect(readWallet().balance).toBe(500)
  })

  it('el saldo sobrevive a un nuevo inicio de sesión', () => {
    post(movimiento({ amount: 500 }))

    // El token cambia en cada login; la billetera se indexa por usuario para
    // que no se pierda con él.
    startSession('usuario-ada')
    expect(readWallet().balance).toBe(500)
  })
})
