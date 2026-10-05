// CLABE: Clave Bancaria Estandarizada, 18 dígitos.
//
//   012  180  00000000100  1
//   └┬┘  └┬┘  └────┬────┘  └ dígito verificador
//    │    │        └ número de cuenta (11)
//    │    └ plaza (3)
//    └ institución (3)
//
// Como con las tarjetas, nada de esto se guarda ni se registra: se valida en
// memoria y se descarta.

export const CLABE_LENGTH = 18

const WEIGHTS = [3, 7, 1]

// Suma de (dígito × peso 3,7,1…) módulo 10 sobre los primeros 17. Detecta
// erratas de tecleo, no que la cuenta exista.
export function controlDigit(digits: string): number {
  const sum = [...digits.slice(0, 17)].reduce(
    (total, digit, index) => total + ((Number(digit) * (WEIGHTS[index % 3] ?? 1)) % 10),
    0,
  )
  return (10 - (sum % 10)) % 10
}

export function isValidClabe(clabe: string): boolean {
  if (!/^\d{18}$/.test(clabe)) return false
  return controlDigit(clabe) === Number(clabe[17])
}

// Catálogo parcial por los tres primeros dígitos. Un código que no esté aquí no
// invalida la cuenta: para eso está el dígito verificador.
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

export function bankCode(clabe: string): string {
  return clabe.slice(0, 3)
}

export function bankName(code: string): string {
  return BANKS[code] ?? 'Otro banco'
}

// Lo único de la cuenta que sale del servicio. El resto —incluido el número de
// cuenta de 11 dígitos— se queda dentro.
export function lastFour(clabe: string): string {
  return clabe.slice(-4)
}
