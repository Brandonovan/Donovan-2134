import type { NextFunction, Request, Response } from 'express'
import { env } from '../config/env.js'
import { AppError } from '../shared/AppError.js'

// Único punto donde un error se convierte en respuesta HTTP. Todo lo demás
// lanza y se olvida; Express 5 encamina aquí también los errores de los
// handlers asíncronos, sin necesidad de envolver cada uno en try/catch.
//
// El front lee `message` y lo muestra tal cual, así que los mensajes salen
// redactados para una persona, no para un log.
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    res.status(error.status).json({ message: error.message, details: error.details })
    return
  }

  // Lo que llegue aquí es un fallo no previsto: se registra entero, pero hacia
  // fuera solo sale un mensaje genérico para no filtrar detalles internos.
  console.error(error)

  res.status(500).json({
    message: 'Error interno del servicio',
    ...(env.NODE_ENV === 'development' && { detail: String(error) }),
  })
}
