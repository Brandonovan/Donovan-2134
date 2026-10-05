const shortDateFormatter = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' })

// "14 sep"
export function formatShortDate(date) {
  return shortDateFormatter.format(new Date(date)).replace('.', '')
}
