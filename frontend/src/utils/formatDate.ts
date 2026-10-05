// Lo que acepta `new Date(...)`: una fecha, una marca de tiempo o un ISO.
export type DateLike = Date | string | number

const shortDateFormatter = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' })

// "14 sep"
export function formatShortDate(date: DateLike): string {
  return shortDateFormatter.format(new Date(date)).replace('.', '')
}
