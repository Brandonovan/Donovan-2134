import { LoginForm } from '@/features/auth'
import styles from './LoginPage.module.css'

export function LoginPage() {
  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>🐌 SnailWin</h1>
        <p className={styles.subtitle}>Apuesta por el caracol más rápido</p>
        <LoginForm />
      </section>
    </div>
  )
}
