import type { DateLike } from './formatDate'

// "18 de septiembre, 15:00"
// Fecha y hora se formatean por separado: si se hace junto, cada navegador
// decide el conector ("a las", ",", …) y el resultado no es consistente.
const dateFormatter = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long' })
const timeFormatter = new Intl.DateTimeFormat('es-MX', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

export function formatDateTime(date: DateLike): string {
  const value = new Date(date)
  return `${dateFormatter.format(value)}, ${timeFormatter.format(value)}`
}
