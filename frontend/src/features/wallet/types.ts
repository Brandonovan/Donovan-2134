// Formas del dominio de la billetera, compartidas por servicios, hooks y
// componentes. Viven juntas porque ninguna capa es su dueña: la tarjeta la
// produce un hook, la guarda la bóveda y la pinta un componente.

export type CardBrand = 'amex' | 'visa' | 'mastercard'
export type CardType = 'debit' | 'credit'

// 'withdrawal' y no 'withdraw' porque es lo que viaja en el historial y lo que
// espera la API.
export type OperationMode = 'deposit' | 'withdrawal'

// La tarjeta tal y como la ve la interfaz: sin el número completo. Ese vive
// solo en merchant/vault.
export type Card = {
  id: string
  brand: CardBrand | null
  type: CardType
  last4: string
  holder: string
  expMonth: number
  expYear: number
  createdAt: string
}

export type BankAccount = {
  id: string
  bankCode: string
  last4: string
  holder: string
  createdAt: string
}

export type Transaction = {
  id: string
  type: OperationMode
  amount: number
  method: string
  createdAt: string
}

export type Wallet = {
  balance: number
}

// Lo que devuelve un depósito o un retiro: el saldo ya asentado y el
// movimiento, para que la interfaz pueda resaltarlo sin volver a pedirlo.
export type MovementResult = {
  balance: number
  transaction: Transaction
}
