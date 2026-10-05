const STEP_MULTIPLIERS = [1, 2, 2.5, 5, 10]

// Marcas "redondas" para un eje: niceTicks(-968, 2760) → [-1000, 0, 1000, 2000, 3000]
export function niceTicks(min: number, max: number, targetCount = 4): number[] {
  // Al exigir el tipo, TypeScript sacó a la luz que un rango invertido o no
  // finito dejaba `step` en undefined y el bucle no terminaba nunca. Se
  // descarta antes de entrar.
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return [min]

  const roughStep = (max - min) / targetCount
  const magnitude = 10 ** Math.floor(Math.log10(roughStep))
  const step = STEP_MULTIPLIERS.map((multiplier) => multiplier * magnitude).find(
    (candidate) => candidate >= roughStep,
  )
  if (step === undefined) return [min]

  const start = Math.floor(min / step) * step
  const end = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let value = start; value <= end + step / 2; value += step) {
    ticks.push(Math.round(value * 1e6) / 1e6)
  }
  return ticks
}
