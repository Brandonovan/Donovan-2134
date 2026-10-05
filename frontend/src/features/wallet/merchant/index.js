// --- Backend del comercio, simulado -------------------------------------
//
// Todo lo que hay en esta carpeta es trabajo que haría un servidor: llevar el
// libro de cuentas, guardar los medios de pago y hablar con la pasarela. El
// navegador lo hace aquí porque ese servidor todavía no existe.
//
// Cuando exista, esta carpeta se borra entera y `walletService` pasa a llamarlo
// por HTTP. Los componentes no se enteran, porque solo conocen la fachada.
import { mockRequest } from '@/services/mockRequest'
import { validateAmount } from '../utils/amount'
import { cardLabel } from '../utils/card'
import { accountLabel } from '../utils/clabe'
import { post, readWallet } from './ledger.js'

// CVV para probar un cobro rechazado por el banco.
const FAKE_DECLINED_CVV = '000'

function movement(type, amount, { card, cvv, account }) {
  return () => {
    const wallet = readWallet()

    // Se revalida el monto aunque el formulario ya lo hiciera: las reglas del
    // cliente son UX y cualquiera puede saltárselas llamando al servicio.
    const amountError = validateAmount(amount, type, wallet.balance)
    if (amountError) throw new Error(amountError)

    // El CVV solo se usa para autorizar este cobro; no se guarda en ningún lado.
    if (type === 'deposit' && cvv === FAKE_DECLINED_CVV) {
      throw new Error('Tu banco rechazó el cobro. Revisa los datos o usa otra tarjeta.')
    }

    const transaction = {
      id: crypto.randomUUID(),
      type,
      amount,
      method: type === 'deposit' ? cardLabel(card) : `CLABE ${accountLabel(account)}`,
      createdAt: new Date().toISOString(),
    }

    return { balance: post(transaction), transaction }
  }
}

export function getWallet() {
  return mockRequest(() => {
    const { transactions: _transactions, ...wallet } = readWallet()
    return wallet
  })
}

export function getTransactions() {
  return mockRequest(() => readWallet().transactions)
}

export function deposit(amount, { card, cvv }) {
  return mockRequest(movement('deposit', amount, { card, cvv }), { delay: 1200 })
}

export function withdraw(amount, { account }) {
  return mockRequest(movement('withdrawal', amount, { account }), { delay: 1200 })
}
