import { formatCurrency } from '@/utils/formatCurrency'
import type { OperationMode } from '../types'

// El tope aplica a las DOS operaciones. Sale del umbral de identificación de
// la LFPIORPI para juegos con apuesta, que no distingue entrada de salida: por
// encima de el, identificar al cliente deja de ser opcional.
//
// Tiene que coincidir con AMOUNT_LIMITS de snailpay-api. Son dos repositorios,
// así que mantenerlo en línea es manual; el test de contrato lo vigila.
export const AMOUNT_LIMITS = { min: 50, max: 10_000 }

// Deja solo dígitos y un punto decimal con máximo 2 decimales ("1,000.505" → "1000.50").
export function sanitizeAmount(value: string): string {
  const [integer = '', ...decimals] = value.replace(/[^\d.]/g, '').split('.')
  return decimals.length > 0 ? `${integer}.${decimals.join('').slice(0, 2)}` : integer
}

export function parseAmount(value: string): number {
  return value === '' || value === '.' ? 0 : Number(value)
}

export function validateAmount(
  amount: number,
  mode: OperationMode,
  balance: number,
): string | undefined {
  if (!amount) return 'Escribe un monto'
  if (amount < AMOUNT_LIMITS.min) return `El monto mínimo es ${formatCurrency(AMOUNT_LIMITS.min)}`
  // El saldo se comprueba antes que el tope: a quien pide más de lo que tiene
  // le sirve más saber cuánto tiene que cuál es el máximo por operación.
  if (mode === 'withdrawal' && amount > balance) {
    return `Solo tienes ${formatCurrency(balance)} disponibles`
  }
  if (amount > AMOUNT_LIMITS.max) {
    return `El monto máximo por operación es ${formatCurrency(AMOUNT_LIMITS.max)}`
  }
  return undefined
}
