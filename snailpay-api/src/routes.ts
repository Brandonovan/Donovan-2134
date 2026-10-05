import { Router } from 'express'
import { paymentRoutes } from './modules/payments/payments.routes.js'

export const routes = Router()

routes.use('/payments', paymentRoutes)
