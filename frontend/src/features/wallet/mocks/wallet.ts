// Mock de GET /wallet: estado inicial de la billetera de cada usuario.
// Todos empiezan en cero; el saldo solo se mueve con recargas y retiros hechos
// desde SnailPay. El saldo vive aquí y en ningún otro sitio: el registro del
// usuario no lo guarda, para que no haya dos versiones que puedan discrepar.
import type { Transaction, Wallet } from '../types'

export const WALLET: Wallet = {
  balance: 0,
}

// Mock de GET /wallet/transactions: recargas y retiros, del más reciente al más
// antiguo. Vacío por lo mismo: una cuenta recién creada no tiene movimientos.
export const TRANSACTIONS: Transaction[] = []
