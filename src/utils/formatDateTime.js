const formatter = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatDateTime(date) {
  return formatter.format(new Date(date))
}
