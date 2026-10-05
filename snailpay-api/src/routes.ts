import { Router } from 'express'
import { paymentRoutes } from './modules/payments/payments.routes.js'
import { payoutRoutes } from './modules/payouts/payouts.routes.js'
import { statusRoutes } from './modules/status/status.routes.js'

export const routes = Router()

routes.use(statusRoutes)
routes.use('/payments', paymentRoutes)
routes.use('/payouts', payoutRoutes)
