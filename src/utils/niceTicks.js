// Marcas "redondas" para un eje: niceTicks(-968, 2760) → [-1000, 0, 1000, 2000, 3000]
export function niceTicks(min, max, targetCount = 4) {
  if (min === max) return [min]
  const roughStep = (max - min) / targetCount
  const magnitude = 10 ** Math.floor(Math.log10(roughStep))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= roughStep)
  const start = Math.floor(min / step) * step
  const end = Math.ceil(max / step) * step
  const ticks = []
  for (let value = start; value <= end + step / 2; value += step) {
    ticks.push(Math.round(value * 1e6) / 1e6)
  }
  return ticks
}
