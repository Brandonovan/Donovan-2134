// `as const` fija los valores como literales: una ruta mal escrita en un <Link>
// deja de compilar en vez de llevar a un 404.
export const ROUTES = {
  ROOT: '/',
  REGISTER: '/register',
  LOGIN: '/login',
  LOBBY: '/lobby',
  SNAILPAY: '/snailpay',
} as const

export type Route = (typeof ROUTES)[keyof typeof ROUTES]
