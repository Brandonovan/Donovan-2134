import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate.js'
import { requireOperational } from '../../middlewares/requireOperational.js'
import { validateBody } from '../../middlewares/validate.js'
import * as controller from './payouts.controller.js'
import { payoutSchema } from './payouts.schema.js'

export const payoutRoutes = Router()

// Mismo orden que en cobros: si la pasarela está caída, la petición muere antes
// de autenticar y antes de que los datos de la cuenta se lleguen a mirar.
payoutRoutes.post(
  '/',
  requireOperational,
  authenticate,
  validateBody(payoutSchema),
  controller.createPayout,
)
