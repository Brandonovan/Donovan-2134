import type { NextFunction, Request, Response } from 'express'
import type { ZodType } from 'zod'
import { AppError } from '../shared/AppError.js'

// Valida el cuerpo de la petición contra el esquema del módulo y lo reemplaza
// por el resultado ya parseado, de modo que el controlador reciba datos con el
// tipo correcto y nunca tenga que comprobarlos.
//
// Repite a propósito reglas que el formulario ya valida: las del cliente son
// UX y cualquiera puede saltárselas llamando a la API directamente.
export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    // express.json() no parsea nada sin la cabecera de tipo, así que el cuerpo
    // llega undefined y zod solo sabe decir "esperaba un objeto". Nombrar la
    // causa probable ahorra el rato que se tarda en dar con ella.
    if (req.body === undefined) {
      throw AppError.badRequest(
        'Falta el cuerpo de la petición. Comprueba que envías Content-Type: application/json',
      )
    }

    const result = schema.safeParse(req.body)

    if (!result.success) {
      throw AppError.badRequest('Datos inválidos', result.error.issues)
    }

    req.body = result.data
    next()
  }
}
