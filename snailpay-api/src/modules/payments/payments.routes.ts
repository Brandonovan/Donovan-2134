import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate.js'
import { validateBody } from '../../middlewares/validate.js'
import * as controller from './payments.controller.js'
import { paymentSchema } from './payments.schema.js'

export const paymentRoutes = Router()

// Se autentica al usuario, no al comercio: quien llama es el navegador, y una
// clave de comercio ahí viajaría dentro del bundle y no sería secreta.
paymentRoutes.post('/', authenticate, validateBody(paymentSchema), controller.createPayment)
