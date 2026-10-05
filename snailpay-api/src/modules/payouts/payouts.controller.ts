import type { Request, Response } from 'express'
import * as service from './payouts.service.js'
import type { PayoutRequest } from './payouts.schema.js'

export async function createPayout(req: Request, res: Response) {
  res.status(201).json(await service.createPayout(req.body as PayoutRequest))
}
