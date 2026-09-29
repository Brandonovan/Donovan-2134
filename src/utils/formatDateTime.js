// "18 de septiembre, 15:00"
const formatter = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

export function formatDateTime(date) {
  return formatter.format(new Date(date))
}
