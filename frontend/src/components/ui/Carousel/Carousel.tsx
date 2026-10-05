import type { KeyboardEvent, ReactNode } from 'react'
import { useRef, useState } from 'react'
import styles from './Carousel.module.css'

type Props<T> = {
  items: T[]
  renderItem: (item: T) => ReactNode
  getKey: (item: T) => string | number
  label: string
  itemLabel?: string
}

export function Carousel<T>({
  items,
  renderItem,
  getKey,
  label,
  itemLabel = 'Elemento',
}: Props<T>) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const lastIndex = items.length - 1

  function goTo(index: number) {
    const track = trackRef.current
    if (!track) return

    const target = Math.max(0, Math.min(index, lastIndex))
    track.scrollTo({ left: target * track.clientWidth })
  }

  // El índice activo sale del scroll, así funciona igual con flechas, puntos o deslizando.
  function handleScroll() {
    const track = trackRef.current
    if (!track) return

    setActiveIndex(Math.round(track.scrollLeft / track.clientWidth))
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goTo(activeIndex + 1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goTo(activeIndex - 1)
    }
  }

  if (items.length === 0) return null

  return (
    <section
      className={styles.carousel}
      aria-roledescription="carrusel"
      aria-label={label}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.viewport}>
        <button
          type="button"
          className={`${styles.arrow} ${styles.prev}`}
          onClick={() => goTo(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label="Anterior"
        >
          ‹
        </button>

        <div ref={trackRef} className={styles.track} onScroll={handleScroll} tabIndex={0}>
          {items.map((item, index) => (
            <div
              key={getKey(item)}
              className={styles.slide}
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${index + 1} de ${items.length}`}
              aria-hidden={index !== activeIndex}
              inert={index !== activeIndex}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>

        <button
          type="button"
          className={`${styles.arrow} ${styles.next}`}
          onClick={() => goTo(activeIndex + 1)}
          disabled={activeIndex === lastIndex}
          aria-label="Siguiente"
        >
          ›
        </button>
      </div>

      <div className={styles.dots}>
        {items.map((item, index) => (
          <button
            key={getKey(item)}
            type="button"
            className={`${styles.dot} ${index === activeIndex ? styles.activeDot : ''}`}
            onClick={() => goTo(index)}
            aria-label={`${itemLabel} ${index + 1}`}
            aria-current={index === activeIndex}
          />
        ))}
      </div>
    </section>
  )
}
