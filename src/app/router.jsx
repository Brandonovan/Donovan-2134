import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout/AppLayout'
import { ROUTES } from '@/constants/routes'
import { LobbyPage } from '@/pages/LobbyPage/LobbyPage'
import { LoginPage } from '@/pages/LoginPage/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage/NotFoundPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { PublicRoute } from '@/routes/PublicRoute'

export const router = createBrowserRouter([
  { path: ROUTES.ROOT, element: <Navigate to={ROUTES.LOBBY} replace /> },
  {
    element: <PublicRoute />,
    children: [{ path: ROUTES.LOGIN, element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [{ path: ROUTES.LOBBY, element: <LobbyPage /> }],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
