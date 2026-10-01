// Mock de GET /wallet: estado inicial de la billetera de cada usuario.
export const WALLET = {
  balance: 1000,
}

// Mock de GET /wallet/transactions: recargas y retiros, del más reciente al más antiguo.
export const TRANSACTIONS = [
  { id: 't12', type: 'deposit', amount: 500, method: 'Tarjeta •••• 4242', createdAt: '2026-09-26T19:42:00' },
  { id: 't11', type: 'withdrawal', amount: 800, method: 'CLABE BBVA México •••• 7890', createdAt: '2026-09-19T12:05:00' },
  { id: 't10', type: 'deposit', amount: 300, method: 'Tarjeta •••• 4242', createdAt: '2026-09-12T09:31:00' },
  { id: 't9', type: 'deposit', amount: 1000, method: 'Tarjeta •••• 4242', createdAt: '2026-09-02T21:14:00' },
  { id: 't8', type: 'withdrawal', amount: 1200, method: 'CLABE BBVA México •••• 7890', createdAt: '2026-08-28T16:48:00' },
  { id: 't7', type: 'deposit', amount: 200, method: 'Tarjeta •••• 4242', createdAt: '2026-08-15T08:12:00' },
  { id: 't6', type: 'deposit', amount: 500, method: 'Tarjeta •••• 4242', createdAt: '2026-08-03T18:27:00' },
  { id: 't5', type: 'withdrawal', amount: 450, method: 'CLABE BBVA México •••• 7890', createdAt: '2026-07-27T13:40:00' },
  { id: 't4', type: 'deposit', amount: 1000, method: 'Tarjeta •••• 4242', createdAt: '2026-07-11T10:03:00' },
  { id: 't3', type: 'deposit', amount: 250, method: 'Tarjeta •••• 4242', createdAt: '2026-07-01T20:55:00' },
  { id: 't2', type: 'withdrawal', amount: 300, method: 'CLABE BBVA México •••• 7890', createdAt: '2026-06-24T15:16:00' },
  { id: 't1', type: 'deposit', amount: 1000, method: 'Tarjeta •••• 4242', createdAt: '2026-06-15T11:20:00' },
]
