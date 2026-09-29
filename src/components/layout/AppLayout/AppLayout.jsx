import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/Button/Button'
import { Logo } from '@/components/ui/Logo/Logo'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/auth'
import { WalletWidget } from '@/features/wallet'
import styles from './AppLayout.module.css'

export function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <NavLink to={ROUTES.LOBBY} className={styles.brand} aria-label="SnailWin, ir al lobby">
          <Logo variant="icon" decorative />
          {/* Mismo trazo que el logo: "Snail" en negrita y "Win" en peso normal */}
          <span className={styles.wordmark} aria-hidden="true">
            <span className={styles.wordmarkBold}>Snail</span>
            <span className={styles.wordmarkLight}>Win</span>
          </span>
        </NavLink>
        <div className={styles.user}>
          <WalletWidget balance={user.balance} />
          <Button variant="secondary" onClick={logout}>
            Salir
          </Button>
        </div>
      </header>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
