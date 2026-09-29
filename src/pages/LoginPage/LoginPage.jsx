import { Logo } from '@/components/ui/Logo/Logo'
import { LoginForm } from '@/features/auth'
import styles from './LoginPage.module.css'

export function LoginPage() {
  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <Logo className={styles.logo} />
        <p className={styles.subtitle}>Apuesta por el caracol más rápido</p>
        <LoginForm />
      </section>
    </div>
  )
}
