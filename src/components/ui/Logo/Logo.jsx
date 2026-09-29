import logoIcon from '@/assets/brand/logo-icon.png'
import logoFull from '@/assets/brand/logo.png'
import styles from './Logo.module.css'

const VARIANTS = {
  full: { src: logoFull, className: styles.full },
  icon: { src: logoIcon, className: styles.icon },
}

export function Logo({ variant = 'full', className = '' }) {
  const { src, className: variantClass } = VARIANTS[variant]

  return <img src={src} alt="SnailWin" className={`${variantClass} ${className}`} />
}
