import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate.js'
import { requireOperational } from '../../middlewares/requireOperational.js'
import { validateBody } from '../../middlewares/validate.js'
import * as controller from './payments.controller.js'
import { paymentSchema } from './payments.schema.js'

export const paymentRoutes = Router()

// Se autentica al usuario, no al comercio: quien llama es el navegador, y una
// clave de comercio ahí viajaría dentro del bundle y no sería secreta.
// requireOperational va el PRIMERO: si la pasarela está caída, la petición
// muere sin autenticar, sin validar y sin que los datos de la tarjeta se lleguen
// a mirar.
paymentRoutes.post(
  '/',
  requireOperational,
  authenticate,
  validateBody(paymentSchema),
  controller.createPayment,
)
