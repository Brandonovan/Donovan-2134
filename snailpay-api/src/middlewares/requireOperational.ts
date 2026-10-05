import type { NextFunction, Request, Response } from 'express'
import { isOperational } from '../modules/status/status.state.js'

// Segundos que el cliente debería esperar antes de reintentar.
const RETRY_AFTER_SECONDS = 30

// Corta la petición ANTES de autenticar y de validar el cuerpo. Si la pasarela
// no acepta cobros, no tiene sentido gastar trabajo en comprobar una tarjeta
// cuyo pago no se va a intentar — ni tocar los datos sensibles que trae.
//
// Responde directamente en vez de lanzar un AppError porque necesita fijar la
// cabecera Retry-After, y AppError solo modela cuerpo y status.
export function requireOperational(_req: Request, res: Response, next: NextFunction) {
  if (isOperational()) {
    next()
    return
  }

  res.setHeader('Retry-After', String(RETRY_AFTER_SECONDS))
  res.status(503).json({
    message: 'El servicio de pagos no está disponible en este momento. Inténtalo de nuevo en unos minutos.',
  })
}
