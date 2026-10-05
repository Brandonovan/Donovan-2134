import { useCallback, useRef, useState } from 'react'

type WidthRef = (element: HTMLElement | null) => void

// Devuelve [ref, width]: el ancho del elemento se actualiza cuando cambia su tamaño.
export function useElementWidth(): [WidthRef, number] {
  const [width, setWidth] = useState(0)
  const observer = useRef<ResizeObserver | null>(null)

  const ref = useCallback<WidthRef>((element) => {
    observer.current?.disconnect()
    if (!element) return

    observer.current = new ResizeObserver(([entry]) => {
      // ResizeObserver siempre entrega al menos una entrada, pero el tipo no lo
      // garantiza y leer `.contentRect` de undefined rompería en silencio.
      if (entry) setWidth(entry.contentRect.width)
    })
    observer.current.observe(element)
  }, [])

  return [ref, width]
}
