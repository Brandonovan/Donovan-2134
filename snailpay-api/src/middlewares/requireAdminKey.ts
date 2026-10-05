import { createHash, timingSafeEqual } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { env } from '../config/env.js'
import { AppError } from '../shared/AppError.js'

// Comparación en tiempo constante sobre los hashes, no sobre las claves.
//
// Hashear primero resuelve dos cosas a la vez: timingSafeEqual exige que ambos
// lados midan igual —y comparar longitudes antes delataría la de la clave—, y
// salir en la primera diferencia revelaría cuántos caracteres se acertaron.
function matches(provided: string, expected: string): boolean {
  const a = createHash('sha256').update(provided).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

export function requireAdminKey(req: Request, _res: Response, next: NextFunction) {
  if (!matches(req.get('x-admin-key') ?? '', env.ADMIN_KEY)) {
    throw AppError.unauthorized('Clave de administración inválida')
  }

  next()
}
