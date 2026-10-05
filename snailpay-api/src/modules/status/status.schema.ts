import { z } from 'zod'

// Vocabulario de las páginas de estado públicas (Stripe, GitHub y compañía).
// Aquí solo hay dos valores porque el interruptor es binario; si algún día el
// servicio puede estar a medias, `degraded_performance` entra sin romper nada.
export const statusSchema = z.object({
  status: z.enum(['operational', 'major_outage']),
})

export type StatusRequest = z.infer<typeof statusSchema>
