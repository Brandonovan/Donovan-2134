import { useEffect, useRef } from 'react'
import styles from './Dialog.module.css'

// Modal sobre <dialog> nativo: el navegador atrapa el foco, cierra con Esc y
// regresa el foco al elemento que lo abrió. El contenido se monta solo mientras
// está abierto, así cada apertura empieza con su estado limpio.
// labelledBy = id del título, que pone el contenido (puede cambiar entre pasos).
// dismissible = false bloquea Esc y el clic fuera (p. ej. mientras se procesa un cobro).
export function Dialog({ open, onClose, labelledBy, dismissible = true, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={labelledBy}
      onCancel={(event) => {
        event.preventDefault()
        if (dismissible) onClose()
      }}
      // Clic en el fondo: el evento llega al <dialog> mismo, no a su contenido.
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose()
      }}
    >
      {open && <div className={styles.content}>{children}</div>}
    </dialog>
  )
}
