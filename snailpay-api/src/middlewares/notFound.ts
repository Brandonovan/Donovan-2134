import type { Request, Response } from 'express'

export function notFound(req: Request, res: Response) {
  res.status(404).json({ message: `No existe ${req.method} ${req.path}` })
}
