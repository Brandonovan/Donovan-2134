import { Router } from 'express'
import { requireAdminKey } from '../../middlewares/requireAdminKey.js'
import { validateBody } from '../../middlewares/validate.js'
import * as controller from './status.controller.js'
import { statusSchema } from './status.schema.js'

export const statusRoutes = Router()

// Público: cualquiera puede preguntar si la pasarela acepta cobros.
statusRoutes.get('/status', controller.readStatus)

// El interruptor. Va con clave porque un endpoint abierto que desactiva los
// cobros es un botón de denegación de servicio para quien lo descubra.
statusRoutes.put('/admin/status', requireAdminKey, validateBody(statusSchema), controller.updateStatus)
