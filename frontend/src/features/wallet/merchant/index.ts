// --- Backend del comercio, simulado -------------------------------------
//
// Todo lo que hay en esta carpeta es trabajo que haría un servidor: llevar el
// libro de cuentas, guardar los medios de pago y hablar con la pasarela. El
// navegador lo hace aquí porque ese servidor todavía no existe.
//
// Cuando exista, esta carpeta se borra entera y `walletService` pasa a llamarlo
// por HTTP. Los componentes no se enteran, porque solo conocen la fachada.
import { mockRequest } from '@/services/mockRequest'
import type {
  BankAccount,
  Card,
  MovementResult,
  OperationMode,
  Transaction,
  Wallet,
} from '../types'
import { validateAmount } from '../utils/amount'
import { cardLabel } from '../utils/card'
import { accountLabel } from '../utils/clabe'
import * as gateway from './gateway'
import { post, readWallet } from './ledger'
import * as vault from './vault'

// CVV que simula un rechazo del banco cuando no hay pasarela conectada.
const FAKE_DECLINED_CVV = '000'

// El saldo es del comercio, no de la pasarela: ella autoriza el cobro y
// devuelve un comprobante, pero no sabe cuánto tienes. Por eso esta
// comprobación vive aquí y no se puede delegar.
function checkAmount(type: OperationMode, amount: number): void {
  const error = validateAmount(amount, type, readWallet().balance)
  if (error) throw new Error(error)
}

// El historial guarda el id que asignó la pasarela, no uno inventado: así cada
// movimiento del comercio es rastreable hasta la operación que lo originó.
function toTransaction({ id, type, amount, method, createdAt }: Transaction): Transaction {
  return { id, type, amount, method, createdAt }
}

function settle(transaction: Transaction): MovementResult {
  return { balance: post(transaction), transaction }
}

type Options = {
  card?: Card
  cvv?: string
  account?: BankAccount
  payerEmail: string
}

async function throughGateway(
  type: OperationMode,
  amount: number,
  { card, cvv, account, payerEmail }: Options,
): Promise<MovementResult> {
  const reference = crypto.randomUUID()

  if (type === 'deposit') {
    // card y cvv llegan juntos o no llegan: lo garantiza quien llama.
    if (!card || cvv === undefined) throw new Error('Falta el método de pago')
    const stored = vault.cards.read(card.id)
    if (!stored) throw new Error('No encontramos los datos de esa tarjeta. Vuelve a registrarla.')

    const payment = await gateway.charge({ amount, reference, payerEmail, vaultCard: stored, cvv })
    return settle(
      toTransaction({
        id: payment.id,
        type,
        amount: payment.transaction_amount,
        method: cardLabel(card),
        createdAt: payment.date_created,
      }),
    )
  }

  if (!account) throw new Error('Falta la cuenta de destino')
  const stored = vault.accounts.read(account.id)
  if (!stored) throw new Error('No encontramos los datos de esa cuenta. Vuelve a registrarla.')

  const result = await gateway.payout({ amount, reference, payeeEmail: payerEmail, vaultAccount: stored })
  return settle(
    toTransaction({
      id: result.id,
      type,
      amount: result.transaction_amount,
      method: `CLABE ${accountLabel(account)}`,
      createdAt: result.date_created,
    }),
  )
}

// Sin pasarela conectada el comercio simula también el cobro, para que el front
// funcione solo. Es el camino que usa el despliegue público.
function locally(type: OperationMode, amount: number, { card, cvv, account }: Options) {
  return () => {
    if (type === 'deposit' && cvv === FAKE_DECLINED_CVV) {
      throw new Error('Tu banco rechazó el cobro. Revisa los datos o usa otra tarjeta.')
    }

    return settle(
      toTransaction({
        id: crypto.randomUUID(),
        type,
        amount,
        method:
          type === 'deposit' && card
            ? cardLabel(card)
            : `CLABE ${accountLabel(account as BankAccount)}`,
        createdAt: new Date().toISOString(),
      }),
    )
  }
}

function movement(type: OperationMode, amount: number, options: Options): Promise<MovementResult> {
  checkAmount(type, amount)

  return gateway.isConfigured()
    ? throughGateway(type, amount, options)
    : mockRequest(locally(type, amount, options), { delay: 1200 })
}

export function getWallet(): Promise<Wallet> {
  return mockRequest(() => {
    const { transactions: _transactions, ...wallet } = readWallet()
    return wallet
  })
}

export function getTransactions(): Promise<Transaction[]> {
  return mockRequest(() => readWallet().transactions)
}

export function deposit(
  amount: number,
  { card, cvv, payerEmail }: { card: Card; cvv: string; payerEmail: string },
): Promise<MovementResult> {
  return movement('deposit', amount, { card, cvv, payerEmail })
}

export function withdraw(
  amount: number,
  { account, payerEmail }: { account: BankAccount; payerEmail: string },
): Promise<MovementResult> {
  return movement('withdrawal', amount, { account, payerEmail })
}
