import styles from './MethodRow.module.css'
import type { ReactNode } from 'react'

// Opción seleccionable de un método guardado (tarjeta o cuenta), con eliminación en dos pasos.
// chipClassName permite teñir el chip (p. ej. con el color de la marca).
type Props = {
  name: string
  selected: boolean
  disabled?: boolean
  onSelect: () => void
  chip: ReactNode
  chipClassName?: string
  label: ReactNode
  badge?: ReactNode
  meta?: ReactNode
  confirming: boolean
  onAskRemove: () => void
  onCancelRemove: () => void
  onRemove: () => void
}

export function MethodRow({
  name,
  selected,
  disabled,
  onSelect,
  chip,
  chipClassName = '',
  label,
  badge,
  meta,
  confirming,
  onAskRemove,
  onCancelRemove,
  onRemove,
}: Props) {
  return (
    <div className={`${styles.row} ${selected ? styles.selected : ''} ${disabled ? styles.disabled : ''}`}>
      <div className={styles.main}>
        <label className={styles.option}>
          <input
            type="radio"
            className={styles.radio}
            name={name}
            checked={selected}
            disabled={disabled}
            onChange={onSelect}
          />
          <span className={`${styles.chip} ${chipClassName}`} aria-hidden="true">
            {chip}
          </span>
          <span className={styles.info}>
            <span className={styles.label}>
              {label}
              {badge && <span className={styles.badge}>{badge}</span>}
            </span>
            <span className={styles.meta}>{meta}</span>
          </span>
        </label>
        {confirming ? (
          <div className={styles.confirm} role="group" aria-label={`¿Eliminar ${label}?`}>
            <span className={styles.confirmText}>¿Eliminar?</span>
            <button type="button" className={`${styles.link} ${styles.danger}`} onClick={onRemove}>
              Sí
            </button>
            <button type="button" className={styles.link} onClick={onCancelRemove}>
              No
            </button>
          </div>
        ) : (
          <button type="button" className={styles.link} onClick={onAskRemove} aria-label={`Eliminar ${label}`}>
            Eliminar
          </button>
        )}
      </div>
    </div>
  )
}
