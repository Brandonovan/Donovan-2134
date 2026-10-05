import type { Request, Response } from 'express'
import { getStatus, isOperational, setStatus } from './status.state.js'
import type { StatusRequest } from './status.schema.js'

function body() {
  return {
    status: getStatus(),
    payments_enabled: isOperational(),
    checked_at: new Date().toISOString(),
  }
}

// Responde 200 SIEMPRE, también cuando la pasarela está caída.
//
// Si devolviera 503 en modo error, el cliente no podría distinguir "la pasarela
// está caída" de "no pude alcanzar la pasarela" — dos situaciones distintas que
// merecen mensajes distintos. El estado va en el cuerpo, no en el código HTTP.
export function readStatus(_req: Request, res: Response) {
  res.json(body())
}

export function updateStatus(req: Request, res: Response) {
  setStatus((req.body as StatusRequest).status)
  console.log(`[admin] estado cambiado a: ${getStatus()}`)
  res.json(body())
}
