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
