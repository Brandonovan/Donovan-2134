import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

// Las variantes se restringen a las que existen en el CSS: pedir una inventada
// deja de compilar en vez de renderizar un botón sin estilo.
export type ButtonVariant = 'primary' | 'secondary'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  return <button className={`${styles.button} ${styles[variant]} ${className}`} {...props} />
}
