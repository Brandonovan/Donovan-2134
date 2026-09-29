import { useCallback, useRef, useState } from 'react'

// Devuelve [ref, width]: el ancho del elemento se actualiza cuando cambia su tamaño.
export function useElementWidth() {
  const [width, setWidth] = useState(0)
  const observer = useRef(null)

  const ref = useCallback((element) => {
    observer.current?.disconnect()
    if (!element) return
    observer.current = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.current.observe(element)
  }, [])

  return [ref, width]
}
