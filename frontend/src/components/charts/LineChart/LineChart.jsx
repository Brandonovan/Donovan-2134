import { useId, useState } from 'react'
import { useElementWidth } from '@/hooks/useElementWidth'
import { niceTicks } from '@/utils/niceTicks'
import styles from './LineChart.module.css'

const MARGIN = { top: 16, right: 16, bottom: 28, left: 52 }
const X_TICKS = 4

// Línea de una serie con línea base en 0: arriba se pinta con `positiveColor`, abajo con `negativeColor`.
// data: [{ date: Date, value: number }]
// renderTooltip(point) devuelve el contenido del tooltip del punto activo.
export function LineChart({
  data,
  height = 240,
  formatValue = String,
  formatAxisValue = formatValue,
  formatDate,
  renderTooltip,
  positiveColor,
  negativeColor,
  ariaLabel,
}) {
  const [containerRef, width] = useElementWidth()
  const [activeIndex, setActiveIndex] = useState(null)
  const gradientId = useId()

  const innerWidth = Math.max(width - MARGIN.left - MARGIN.right, 0)
  const innerHeight = height - MARGIN.top - MARGIN.bottom

  const values = data.map((point) => point.value)
  const yTicks = niceTicks(Math.min(0, ...values), Math.max(0, ...values), 4)
  const [yMin, yMax] = [yTicks[0], yTicks.at(-1)]
  const [tMin, tMax] = [data[0].date.getTime(), data.at(-1).date.getTime()]

  const x = (date) => (tMax === tMin ? innerWidth / 2 : ((date.getTime() - tMin) / (tMax - tMin)) * innerWidth)
  const y = (value) => innerHeight - ((value - yMin) / (yMax - yMin || 1)) * innerHeight

  const zeroY = y(0)
  const zeroOffset = innerHeight === 0 ? 0 : zeroY / innerHeight
  const linePath = data.map((point, i) => `${i === 0 ? 'M' : 'L'}${x(point.date)},${y(point.value)}`).join(' ')
  const areaPath = `${linePath} L${x(data.at(-1).date)},${zeroY} L${x(data[0].date)},${zeroY} Z`

  const xTicks = Array.from({ length: X_TICKS }, (_, i) => new Date(tMin + ((tMax - tMin) * i) / (X_TICKS - 1)))
  const last = data.at(-1)
  const active = activeIndex == null ? null : data[activeIndex]

  function nearestIndex(pointerX) {
    let best = 0
    data.forEach((point, i) => {
      if (Math.abs(x(point.date) - pointerX) < Math.abs(x(data[best].date) - pointerX)) best = i
    })
    return best
  }

  function handlePointerMove(event) {
    const bounds = event.currentTarget.getBoundingClientRect()
    setActiveIndex(nearestIndex(event.clientX - bounds.left - MARGIN.left))
  }

  function handleKeyDown(event) {
    const current = activeIndex ?? data.length - 1
    if (event.key === 'ArrowRight') setActiveIndex(Math.min(current + 1, data.length - 1))
    else if (event.key === 'ArrowLeft') setActiveIndex(Math.max(current - 1, 0))
    else if (event.key === 'Home') setActiveIndex(0)
    else if (event.key === 'End') setActiveIndex(data.length - 1)
    else return
    event.preventDefault()
  }

  const tooltipLeft = active ? Math.min(Math.max(MARGIN.left + x(active.date), 90), width - 90) : 0

  return (
    <div ref={containerRef} className={styles.container} style={{ height }}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          className={styles.svg}
          role="img"
          aria-label={ariaLabel}
          tabIndex={0}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setActiveIndex(null)}
          onFocus={() => setActiveIndex(data.length - 1)}
          onBlur={() => setActiveIndex(null)}
          onKeyDown={handleKeyDown}
        >
          <defs>
            <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={innerHeight}>
              <stop offset={zeroOffset} stopColor={positiveColor} />
              <stop offset={zeroOffset} stopColor={negativeColor} />
            </linearGradient>
          </defs>

          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            {yTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={0}
                  x2={innerWidth}
                  y1={y(tick)}
                  y2={y(tick)}
                  className={tick === 0 ? styles.baseline : styles.grid}
                />
                <text x={-8} y={y(tick)} className={styles.yLabel}>
                  {formatAxisValue(tick)}
                </text>
              </g>
            ))}

            {xTicks.map((date, i) => (
              <text
                key={date.getTime()}
                x={x(date)}
                y={innerHeight + 20}
                className={styles.xLabel}
                textAnchor={i === 0 ? 'start' : i === X_TICKS - 1 ? 'end' : 'middle'}
              >
                {formatDate(date)}
              </text>
            ))}

            <path d={areaPath} fill={`url(#${gradientId})`} className={styles.area} />
            <path d={linePath} stroke={`url(#${gradientId})`} className={styles.line} />

            {active && (
              <>
                <line x1={x(active.date)} x2={x(active.date)} y1={0} y2={innerHeight} className={styles.crosshair} />
                <circle
                  cx={x(active.date)}
                  cy={y(active.value)}
                  r={5}
                  fill={active.value >= 0 ? positiveColor : negativeColor}
                  className={styles.dot}
                />
              </>
            )}

            {!active && (
              <circle
                cx={x(last.date)}
                cy={y(last.value)}
                r={4}
                fill={last.value >= 0 ? positiveColor : negativeColor}
                className={styles.dot}
              />
            )}
          </g>
        </svg>
      )}

      {active && renderTooltip && (
        <div
          className={styles.tooltip}
          style={{ left: tooltipLeft, top: MARGIN.top + y(active.value) }}
          role="status"
        >
          {renderTooltip(active)}
        </div>
      )}
    </div>
  )
}
