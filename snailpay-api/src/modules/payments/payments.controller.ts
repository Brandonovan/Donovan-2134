import type { Request, Response } from 'express'
import * as service from './payments.service.js'
import type { PaymentRequest } from './payments.schema.js'

// Solo traduce HTTP: el cuerpo ya viene validado por el middleware y ninguna
// regla de negocio vive aquí.
export function createPayment(req: Request, res: Response) {
  res.status(201).json(service.createPayment(req.body as PaymentRequest))
}
