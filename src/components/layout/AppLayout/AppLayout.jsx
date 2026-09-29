import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/Button/Button'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/auth'
import { formatCurrency } from '@/utils/formatCurrency'
import styles from './AppLayout.module.css'

export function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <NavLink to={ROUTES.LOBBY} className={styles.brand}>
          🐌 SnailWin
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
          <span className={styles.balance}>{formatCurrency(user.balance)}</span>
          <span>{user.name}</span>
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
