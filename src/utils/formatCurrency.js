const formatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})

export function formatCurrency(amount) {
  return formatter.format(amount)
}
