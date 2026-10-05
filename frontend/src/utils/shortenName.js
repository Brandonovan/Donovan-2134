const DEFAULT_MAX_LENGTH = 12

// "Babosín Aguilar Treviño" → "Babosín". Los nombres cortos se dejan igual.
export function shortenName(name, maxLength = DEFAULT_MAX_LENGTH) {
  const trimmed = name.trim()
  if (trimmed.length <= maxLength) return trimmed
  return trimmed.split(/\s+/)[0]
}
