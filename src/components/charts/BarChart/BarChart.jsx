import { useLayoutEffect, useRef } from 'react'
import styles from './BarChart.module.css'

const REORDER_MS = 450

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Anima las filas cuando cambian de posición (técnica FLIP) y hace aparecer las nuevas.
function useRowAnimations() {
  const rows = useRef(new Map())
  const previousTops = useRef(new Map())
  const hasRendered = useRef(false)

  useLayoutEffect(() => {
    const animate = !prefersReducedMotion()

    rows.current.forEach((element, id) => {
      const top = element.offsetTop
      const previousTop = previousTops.current.get(id)

      if (animate && previousTop === undefined && hasRendered.current) {
        element.animate(
          [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }],
          { duration: 300, easing: 'ease-out' },
        )
      } else if (animate && previousTop !== undefined && previousTop !== top) {
        element.animate(
          [{ transform: `translateY(${previousTop - top}px)` }, { transform: 'none' }],
          { duration: REORDER_MS, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
        )
      }
      previousTops.current.set(id, top)
    })

    previousTops.current.forEach((_, id) => {
      if (!rows.current.has(id)) previousTops.current.delete(id)
    })
    hasRendered.current = true
  })

  return (id) => (element) => {
    if (element) rows.current.set(id, element)
    else rows.current.delete(id)
  }
}

// Barras horizontales de una sola serie: los nombres largos se leen sin rotar.
// data: [{ id, label, fullLabel?, value, details? }] ya ordenado.
// `fullLabel` es el nombre completo cuando `label` viene recortado; se muestra en el tooltip.
export function BarChart({ data, formatValue = String, ariaLabel }) {
  const registerRow = useRowAnimations()
  const max = Math.max(...data.map((item) => item.value), 1)

  return (
    <ol className={styles.chart} aria-label={ariaLabel}>
      {data.map((item, index) => (
        <li key={item.id} ref={registerRow(item.id)} className={styles.row} tabIndex={0}>
          <span className={styles.rank}>{index + 1}</span>
          <span className={styles.label} title={item.fullLabel}>
            {item.label}
          </span>
          <span className={styles.track}>
            <span className={styles.bar} style={{ width: `${(item.value / max) * 100}%` }}>
              <span className={styles.value}>{formatValue(item.value)}</span>
            </span>
          </span>
          {item.details && (
            <span className={styles.tooltip} role="tooltip">
              <strong>{item.fullLabel ?? item.label}</strong>
              {item.details}
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}
