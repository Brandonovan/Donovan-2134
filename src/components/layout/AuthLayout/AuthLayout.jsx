import { Outlet } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo/Logo'
import styles from './AuthLayout.module.css'

export function AuthLayout() {
  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <Logo className={styles.logo} />
        <p className={styles.subtitle}>Apuesta por el caracol más rápido</p>
        <Outlet />
      </section>
    </div>
  )
}
