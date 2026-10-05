import type { BankAccount } from '../types'

export const MAX_ACCOUNTS = 3

const CLABE_LENGTH = 18
const WEIGHTS = [3, 7, 1]

// Catálogo parcial de bancos por los 3 primeros dígitos de la CLABE.
// Un código que no esté aquí no invalida la cuenta: el dígito verificador sí.
const BANKS: Record<string, string> = {
  '002': 'Banamex',
  '012': 'BBVA México',
  '014': 'Santander',
  '021': 'HSBC',
  '030': 'BanBajío',
  '036': 'Inbursa',
  '042': 'Mifel',
  '044': 'Scotiabank',
  '058': 'Banregio',
  '062': 'Afirme',
  '072': 'Banorte',
  '127': 'Banco Azteca',
  '137': 'BanCoppel',
  '638': 'Nu México',
  '646': 'STP',
  '722': 'Mercado Pago',
}

const onlyDigits = (value: string): string => value.replace(/\D/g, '')

export function bankName(code: string): string {
  return BANKS[code] ?? 'Otro banco'
}

// "012180012345678906" → "012 180 01234567890 6" (banco, plaza, cuenta, verificador).
export function formatClabe(value: string): string {
  const digits = onlyDigits(value).slice(0, CLABE_LENGTH)
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 17), digits.slice(17)]
    .filter(Boolean)
    .join(' ')
}

// Dígito verificador: suma de (dígito × peso 3, 7, 1…) módulo 10 de los primeros 17.
function controlDigit(digits: string): number {
  const sum = [...digits.slice(0, 17)].reduce(
    (total, digit, index) => total + ((Number(digit) * (WEIGHTS[index % 3] ?? 1)) % 10),
    0,
  )
  return (10 - (sum % 10)) % 10
}

export function sanitizeClabe(value: string): string {
  return onlyDigits(value)
}

// Recibe la CLABE ya limpia (solo dígitos).
export function validateClabe(clabe: string): string | undefined {
  if (!clabe) return 'Ingresa tu CLABE interbancaria'
  if (clabe.length !== CLABE_LENGTH) return `La CLABE tiene ${CLABE_LENGTH} dígitos`
  if (controlDigit(clabe) !== Number(clabe[17])) return 'Revisa la CLABE, uno de los dígitos no coincide'
  return undefined
}

// "BBVA México •••• 7890"
export function accountLabel({ bankCode, last4 }: Pick<BankAccount, 'bankCode' | 'last4'>): string {
  return `${bankName(bankCode)} •••• ${last4}`
}
