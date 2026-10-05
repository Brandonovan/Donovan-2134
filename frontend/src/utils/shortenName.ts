const DEFAULT_MAX_LENGTH = 12

// "Babosín Aguilar Treviño" → "Babosín". Los nombres cortos se dejan igual.
export function shortenName(name: string, maxLength = DEFAULT_MAX_LENGTH): string {
  const trimmed = name.trim()
  if (trimmed.length <= maxLength) return trimmed

  // `split` siempre devuelve al menos un elemento, pero el tipo no lo sabe:
  // el respaldo cubre el caso imposible sin cambiar el comportamiento.
  return trimmed.split(/\s+/)[0] ?? trimmed
}
