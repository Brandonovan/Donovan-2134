import { Router } from 'express'
import { validateBody } from '../../middlewares/validate.js'
import * as controller from './status.controller.js'
import { statusSchema } from './status.schema.js'

export const statusRoutes = Router()

// Público: cualquiera puede preguntar si la pasarela acepta cobros.
statusRoutes.get('/status', controller.readStatus)

// El interruptor, deliberadamente abierto: existe para poder demostrar la caída
// desde cualquier sitio sin configurar nada.
//
// En un servicio real esto iría tras una superficie de administración de verdad.
// Tal cual está, cualquiera que descubra la ruta puede desactivar los cobros.
statusRoutes.put('/admin/status', validateBody(statusSchema), controller.updateStatus)
