import { useState } from 'react'
import styles from './DonutChart.module.css'

const SIZE = 200
const RADIUS = 80
const STROKE = 26
const GAP = 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function toPercent(value, total) {
  return total === 0 ? 0 : Math.round((value / total) * 100)
}

// segments: [{ id, label, value, color, icon }]
// El centro muestra el primer segmento; al pasar el cursor o enfocar, muestra el activo.
// totalLabel (opcional) agrega una fila con el total al final de la leyenda.
export function DonutChart({ segments, ariaLabel, totalLabel }) {
  const [activeId, setActiveId] = useState(null)
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  const active = segments.find((segment) => segment.id === activeId) ?? segments[0]

  // Cada arco empieza donde terminó el anterior; el GAP deja 2px de separación entre ellos.
  const arcs = segments.reduce((acc, segment) => {
    const length = total === 0 ? 0 : (segment.value / total) * CIRCUMFERENCE
    const offset = acc.length > 0 ? acc.at(-1).offset + acc.at(-1).length : 0
    return [...acc, { ...segment, length, offset, dash: Math.max(length - GAP, 0) }]
  }, [])

  return (
    <div className={styles.chart}>
      <div className={styles.ringWrapper}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={styles.ring} role="img" aria-label={ariaLabel}>
          {arcs.map((arc) => (
            <circle
              key={arc.id}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={arc.color}
              strokeWidth={STROKE}
              strokeDasharray={`${arc.dash} ${CIRCUMFERENCE - arc.dash}`}
              strokeDashoffset={-arc.offset}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              className={`${styles.arc} ${activeId && activeId !== arc.id ? styles.dimmed : ''}`}
              onMouseEnter={() => setActiveId(arc.id)}
              onMouseLeave={() => setActiveId(null)}
            />
          ))}
        </svg>
        <div className={styles.center} aria-hidden="true">
          <span className={styles.percent}>{toPercent(active.value, total)}%</span>
          <span className={styles.centerLabel}>{active.label}</span>
        </div>
      </div>

      <ul className={styles.legend}>
        {segments.map((segment) => (
          <li key={segment.id}>
            <button
              type="button"
              className={`${styles.legendItem} ${activeId === segment.id ? styles.legendActive : ''}`}
              onMouseEnter={() => setActiveId(segment.id)}
              onMouseLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(segment.id)}
              onBlur={() => setActiveId(null)}
            >
              <span className={styles.swatch} style={{ backgroundColor: segment.color }} aria-hidden="true">
                {segment.icon}
              </span>
              <span className={styles.legendLabel}>{segment.label}</span>
              <span className={styles.legendPercent}>{toPercent(segment.value, total)}%</span>
              <span className={styles.legendValue}>{segment.value}</span>
            </button>
          </li>
        ))}
        {totalLabel && (
          <li className={styles.total}>
            <span className={styles.totalLabel}>{totalLabel}</span>
            <span className={styles.totalValue}>{total}</span>
          </li>
        )}
      </ul>
    </div>
  )
}
