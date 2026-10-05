// Versiones claras del logo, para el tema oscuro.
import logoIcon from '@/assets/brand/logo-icon-dark.png'
import logoFull from '@/assets/brand/logo-dark.png'
import snailpayIcon from '@/assets/brand/snailpay-icon.png'
import snailpayFull from '@/assets/brand/snailpay.png'
import styles from './Logo.module.css'

const BRANDS = {
  snailwin: { name: 'SnailWin', full: logoFull, icon: logoIcon },
  snailpay: { name: 'Snailpay', full: snailpayFull, icon: snailpayIcon },
}

type Props = {
  brand?: 'snailwin' | 'snailpay'
  variant?: 'full' | 'icon'
  className?: string
  decorative?: boolean
}

export function Logo({
  brand = 'snailwin',
  variant = 'full',
  className = '',
  decorative = false,
}: Props) {
  const { name, [variant]: src } = BRANDS[brand]

  return (
    <img
      src={src}
      alt={decorative ? '' : name}
      className={`${styles[variant]} ${className}`}
    />
  )
}
