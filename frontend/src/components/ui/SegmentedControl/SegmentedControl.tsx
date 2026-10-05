import styles from './SegmentedControl.module.css'

export type SegmentedOption<T extends string> = {
  value: T
  label: string
}

type Props<T extends string> = {
  options: readonly SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  label: string
}

// Genérico sobre el valor: quien lo use con un modo de operación recibe
// 'deposit' | 'withdrawal' en onChange, no un string cualquiera.
export function SegmentedControl<T extends string>({ options, value, onChange, label }: Props<T>) {
  return (
    <div className={styles.control} role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          className={`${styles.option} ${option.value === value ? styles.selected : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
