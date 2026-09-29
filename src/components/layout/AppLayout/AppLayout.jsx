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
        <NavLink to={ROUTES.LOBBY} className={styles.brand} aria-label="Ir al lobby">
          <Logo variant="icon" />
        </NavLink>
        <nav className={styles.nav}>
          <NavLink
            to={ROUTES.LOBBY}
            className={({ isActive }) => (isActive ? styles.active : undefined)}
          >
            Lobby
          </NavLink>
        </nav>
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
