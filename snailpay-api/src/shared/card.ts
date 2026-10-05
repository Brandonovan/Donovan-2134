// Reglas de tarjeta: marca, Luhn y vencimiento.
//
// Ninguna de estas funciones registra ni conserva lo que recibe: trabajan sobre
// el número en memoria y devuelven un veredicto o un dato ya enmascarado.

export type Brand = 'amex' | 'visa' | 'mastercard'

type BrandInfo = { name: string; cvvLength: number }

const BRANDS: Record<Brand, BrandInfo> = {
  amex: { name: 'American Express', cvvLength: 4 },
  visa: { name: 'Visa', cvvLength: 3 },
  mastercard: { name: 'Mastercard', cvvLength: 3 },
}

export const onlyDigits = (value: string) => value.replace(/\D/g, '')

// Por los primeros dígitos (BIN). Mastercard: 51–55 y 2221–2720.
export function detectBrand(digits: string): Brand | null {
  if (/^3[47]/.test(digits)) return 'amex'
  if (/^4/.test(digits)) return 'visa'
  if (/^5[1-5]/.test(digits)) return 'mastercard'

  const prefix = Number(digits.slice(0, 4))
  if (digits.length >= 4 && prefix >= 2221 && prefix <= 2720) return 'mastercard'

  return null
}

export function brandInfo(brand: Brand): BrandInfo {
  return BRANDS[brand]
}

// Algoritmo de Luhn: detecta erratas de tecleo, no que la tarjeta exista.
export function passesLuhn(digits: string): boolean {
  let sum = 0

  ;[...digits].reverse().forEach((char, index) => {
    let digit = Number(char)
    if (index % 2 === 1) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  })

  return digits.length > 0 && sum % 10 === 0
}

// Una tarjeta vale hasta el último instante de su mes de vencimiento.
export function isExpired(month: number, year: number, now = new Date()): boolean {
  if (!Number.isInteger(month) || month < 1 || month > 12) return true

  // Día 1 del mes siguiente: vence cuando ese instante ya pasó. Para diciembre,
  // el mes 12 equivale a enero del año siguiente y Date lo resuelve solo.
  return new Date(year, month, 1) <= now
}

// Lo ÚNICO del número que puede salir de este servicio.
//
// Los primeros seis dígitos son el BIN: identifican al emisor y PCI permite
// mostrarlos junto a los últimos cuatro. Con el resto por medio oculto, no se
// puede reconstruir la tarjeta ni cobrar con ella.
export function firstSix(digits: string): string {
  return digits.slice(0, 6)
}

export function lastFour(digits: string): string {
  return digits.slice(-4)
}
