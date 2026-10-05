import { sanitizeText } from '@/utils/sanitize'
import type { Card, CardBrand, CardType } from '../types'

type BrandInfo = {
  name: string
  short: string
  lengths: number[]
  // gaps = posiciones donde va un espacio al formatear el número.
  gaps: number[]
  cvv: number
}

export type CardFormValues = {
  number: string
  holder: string
  expiry: string
  type: CardType
}

export type CardFormErrors = Partial<Record<'number' | 'holder' | 'expiry', string>>

export const MAX_CARDS = 5

export const CARD_TYPES: { value: CardType; label: string }[] = [
  { value: 'debit', label: 'Débito' },
  { value: 'credit', label: 'Crédito' },
]

const TYPE_LABELS = Object.fromEntries(CARD_TYPES.map(({ value, label }) => [value, label])) as Record<
  CardType,
  string
>

const BRANDS: Record<CardBrand, BrandInfo> = {
  amex: { name: 'American Express', short: 'Amex', lengths: [15], gaps: [4, 10], cvv: 4 },
  visa: { name: 'Visa', short: 'Visa', lengths: [13, 16, 19], gaps: [4, 8, 12], cvv: 3 },
  mastercard: { name: 'Mastercard', short: 'Mastercard', lengths: [16], gaps: [4, 8, 12], cvv: 3 },
}

const UNKNOWN_BRAND: BrandInfo = { name: 'Tarjeta', short: 'Tarjeta', lengths: [16], gaps: [4, 8, 12], cvv: 3 }

// Por los primeros dígitos (BIN). Mastercard: 51–55 y 2221–2720.
export function detectBrand(digits: string): CardBrand | null {
  if (/^3[47]/.test(digits)) return 'amex'
  if (/^4/.test(digits)) return 'visa'
  if (/^5[1-5]/.test(digits)) return 'mastercard'
  const prefix = Number(digits.slice(0, 4))
  if (digits.length >= 4 && prefix >= 2221 && prefix <= 2720) return 'mastercard'
  return null
}

// Acepta null para que quien aún no sabe la marca reciba valores razonables
// en vez de tener que comprobarlo en cada sitio.
export function brandInfo(brand: CardBrand | null): BrandInfo {
  return brand ? BRANDS[brand] : UNKNOWN_BRAND
}

export const onlyDigits = (value: string): string => value.replace(/\D/g, '')

// "4242424242424242" → "4242 4242 4242 4242"; Amex: "3782 822463 10005".
export function formatCardNumber(value: string): string {
  const digits = onlyDigits(value)
  const { lengths, gaps } = brandInfo(detectBrand(digits))
  const trimmed = digits.slice(0, Math.max(...lengths))
  return [...trimmed].map((digit, index) => (gaps.includes(index) ? ` ${digit}` : digit)).join('')
}

// "1228" → "12/28". Se agrega la diagonal en cuanto hay mes completo.
export function formatExpiry(value: string): string {
  const digits = onlyDigits(value).slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

function passesLuhn(digits: string): boolean {
  let sum = 0
  ;[...digits].reverse().forEach((char, index) => {
    let digit = Number(char)
    if (index % 2 === 1) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  })
  return sum % 10 === 0
}

export function isExpired(
  { expMonth, expYear }: Pick<Card, 'expMonth' | 'expYear'>,
  now = new Date(),
): boolean {
  // La tarjeta es válida hasta el último día de su mes de vencimiento.
  return new Date(expYear, expMonth, 1) <= now
}

const HOLDER_REGEX = /^[\p{L}\p{M}]+(?:[ '.-][\p{L}\p{M}]+)*\.?$/u

export function sanitizeCardForm({ number, holder, expiry, type }: CardFormValues): CardFormValues {
  return { number: onlyDigits(number), holder: sanitizeText(holder).toUpperCase(), expiry, type }
}

// Recibe valores ya limpios. Devuelve { campo: mensaje } solo con los campos inválidos.
export function validateCardForm(
  { number, holder, expiry }: CardFormValues,
  now = new Date(),
): CardFormErrors {
  const errors: CardFormErrors = {}
  const brand = detectBrand(number)

  if (!number) errors.number = 'Ingresa el número de la tarjeta'
  else if (!brand) errors.number = 'Solo aceptamos Visa, Mastercard y American Express'
  else if (!brandInfo(brand).lengths.includes(number.length) || !passesLuhn(number)) {
    errors.number = 'Revisa el número de la tarjeta'
  }

  if (!holder) errors.holder = 'Ingresa el nombre como aparece en la tarjeta'
  else if (holder.length < 3) errors.holder = 'Escribe el nombre completo'
  else if (holder.length > 60 || !HOLDER_REGEX.test(holder)) errors.holder = 'Usa solo letras y espacios'

  // Con noUncheckedIndexedAccess estos pueden faltar; el formato se comprueba
  // justo debajo, así que un NaN aquí acaba en el mensaje correcto.
  const [month = NaN, year = NaN] = expiry.split('/').map(Number)
  if (!expiry) errors.expiry = 'Ingresa la fecha de vencimiento'
  else if (!/^\d{2}\/\d{2}$/.test(expiry) || month < 1 || month > 12) errors.expiry = 'Usa el formato MM/AA'
  else if (isExpired({ expMonth: month, expYear: 2000 + year }, now)) errors.expiry = 'Esta tarjeta ya venció'

  return errors
}

export function validateCvv(cvv: string, brand: CardBrand | null): string | undefined {
  const { cvv: length } = brandInfo(brand)
  if (!cvv) return 'Ingresa el CVV'
  if (cvv.length !== length) return `El CVV tiene ${length} dígitos`
  return undefined
}

// "Visa débito •••• 4242"
export function cardLabel({ brand, type, last4 }: Pick<Card, 'brand' | 'type' | 'last4'>): string {
  return `${brandInfo(brand).short} ${TYPE_LABELS[type].toLowerCase()} •••• ${last4}`
}

export function formatCardExpiry({ expMonth, expYear }: Pick<Card, 'expMonth' | 'expYear'>): string {
  return `${String(expMonth).padStart(2, '0')}/${String(expYear).slice(-2)}`
}
