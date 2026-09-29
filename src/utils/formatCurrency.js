const formatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})

const signedFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  signDisplay: 'exceptZero',
})

export function formatCurrency(amount) {
  return formatter.format(amount)
}

// "+$1,619.50" / "-$968.00"
export function formatSignedCurrency(amount) {
  return signedFormatter.format(amount)
}

// Para ejes: "$2.5k", "-$1k", "$800". (El compacto de Intl en es-MX da "2.5 k$".)
export function formatCompactCurrency(amount) {
  const sign = amount < 0 ? '-' : ''
  const abs = Math.abs(amount)
  if (abs < 1000) return `${sign}$${Math.round(abs)}`
  const thousands = Math.round((abs / 1000) * 10) / 10
  return `${sign}$${thousands}k`
}
