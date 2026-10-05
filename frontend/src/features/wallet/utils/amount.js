import { formatCurrency } from '@/utils/formatCurrency'

export const AMOUNT_LIMITS = { min: 50, maxDeposit: 10000 }

// Deja solo dígitos y un punto decimal con máximo 2 decimales ("1,000.505" → "1000.50").
export function sanitizeAmount(value) {
  const [integer, ...decimals] = value.replace(/[^\d.]/g, '').split('.')
  return decimals.length > 0 ? `${integer}.${decimals.join('').slice(0, 2)}` : integer
}

export function parseAmount(value) {
  return value === '' || value === '.' ? 0 : Number(value)
}

export function validateAmount(amount, mode, balance) {
  if (!amount) return 'Escribe un monto'
  if (amount < AMOUNT_LIMITS.min) return `El monto mínimo es ${formatCurrency(AMOUNT_LIMITS.min)}`
  if (mode === 'deposit' && amount > AMOUNT_LIMITS.maxDeposit) {
    return `Puedes recargar hasta ${formatCurrency(AMOUNT_LIMITS.maxDeposit)} por operación`
  }
  if (mode === 'withdrawal' && amount > balance) {
    return `Solo tienes ${formatCurrency(balance)} disponibles`
  }
  return undefined
}
