import styles from './MethodRow.module.css'

// Opción seleccionable de un método guardado (tarjeta o cuenta), con eliminación en dos pasos.
// chipClassName permite teñir el chip (p. ej. con el color de la marca).
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
}) {
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
