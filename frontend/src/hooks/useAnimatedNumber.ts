import { useEffect, useRef, useState } from 'react'

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Devuelve `target`, pero al cambiar recorre los valores intermedios durante
// `duration` ms (con desaceleración al final). Sin animación si el usuario la redujo.
//
// Antes comprobaba además que `target` no fuera null. Al exigir `number` esa
// rama pasó a ser inalcanzable: quien no tenga el dato todavía pasa un valor
// por defecto (`balance ?? 0`), que es más claro que animar hacia la nada.
export function useAnimatedNumber(target: number, duration = 900): number {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)

  useEffect(() => {
    const from = fromRef.current
    fromRef.current = target
    if (from === target || prefersReducedMotion()) {
      setValue(target)
      return
    }

    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setValue(from + (target - from) * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}
