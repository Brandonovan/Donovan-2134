import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../shared/AppError.js'

// Exige un token Bearer y lo deja en req.token.
//
// LÍMITE IMPORTANTE: este servicio no emite los tokens ni guarda sesiones, así
// que no puede verificar nada. Comprueba que venga uno y que tenga la forma que
// emite el front (64 caracteres hexadecimales), nada más. No prueba que alguien
// se haya autenticado: cualquiera puede inventarse una cadena válida.
//
// Es suficiente mientras el front es el dueño de la sesión. El día que este
// servicio emita los tokens, aquí se verifica la firma y el middleware pasa a
// ser una frontera de verdad.
const TOKEN_FORMAT = /^[0-9a-f]{64}$/

declare global {
  namespace Express {
    interface Request {
      token?: string
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.get('authorization')

  if (!header?.startsWith('Bearer ')) {
    throw AppError.unauthorized('Falta el token de sesión')
  }

  const token = header.slice('Bearer '.length).trim()

  if (!TOKEN_FORMAT.test(token)) {
    throw AppError.unauthorized('El token de sesión no es válido')
  }

  req.token = token
  next()
}
