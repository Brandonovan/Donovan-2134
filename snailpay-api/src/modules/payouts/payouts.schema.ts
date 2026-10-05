import { z } from 'zod'
import { isValidClabe } from '../../shared/clabe.js'
import type { PayoutRejectedDetail } from './payouts.outcomes.js'

// Mismo tope que los cobros, por el mismo razonamiento: queda por debajo del
// umbral de identificación de la LFPIORPI para juegos con apuesta. Son reglas
// de negocio distintas que hoy coinciden, por eso se declaran aparte.
export const AMOUNT_LIMITS = { min: 50, max: 10_000 } as const
export const CURRENCY = 'MXN' as const

const HOLDER_REGEX = /^[\p{L}\p{M}]+(?:[ '.-][\p{L}\p{M}]+)*\.?$/u

const accountSchema = z.object({
  clabe: z
    .string()
    .transform((value) => value.replace(/\D/g, ''))
    .refine(isValidClabe, { message: 'Revisa la CLABE, uno de los dígitos no coincide' }),
  account_holder: z
    .string()
    .transform((value) => value.trim())
    .pipe(
      z
        .string()
        .min(2, 'Escribe el nombre del titular')
        .max(100, 'El nombre del titular es demasiado largo')
        .regex(HOLDER_REGEX, 'El nombre del titular contiene caracteres no permitidos'),
    ),
})

export const payoutSchema = z.object({
  transaction_amount: z
    .number()
    .positive('El monto debe ser mayor que cero')
    .min(AMOUNT_LIMITS.min, `El monto mínimo es ${AMOUNT_LIMITS.min}`)
    .max(AMOUNT_LIMITS.max, `El monto máximo por operación es ${AMOUNT_LIMITS.max}`)
    .multipleOf(0.01, 'El monto admite como máximo dos decimales'),

  currency_id: z.literal(CURRENCY, `Este servicio solo liquida en ${CURRENCY}`),

  reference: z
    .string()
    .transform((value) => value.trim())
    .pipe(z.string().min(1, 'La referencia es obligatoria').max(64, 'La referencia es demasiado larga')),

  // En un retiro la contraparte RECIBE el dinero, así que es payee y no payer.
  payee_email: z
    .string()
    .transform((value) => value.trim().toLowerCase())
    .pipe(z.email('El correo del beneficiario no es válido')),

  account: accountSchema,
})

export type PayoutRequest = z.infer<typeof payoutSchema>

// Lo que sale de la cuenta: banco y últimos cuatro. El número de cuenta de 11
// dígitos que va en medio no sale nunca.
export type MaskedAccount = {
  bank_code: string
  bank_name: string
  last_four_digits: string
}

type PayoutBase = {
  id: string
  transaction_amount: number
  currency_id: typeof CURRENCY
  date_created: string
  reference: string
  payee_id: string
  payee_email: string
  account: MaskedAccount
}

// Unión discriminada, igual que en los cobros: si no se envió nada, no hay nada
// que rastrear, así que un retiro rechazado no puede llevar clave de rastreo.
export type Payout = PayoutBase &
  (
    | { status: 'approved'; status_detail: 'accredited'; tracking_key: string }
    | { status: 'rejected'; status_detail: PayoutRejectedDetail; tracking_key: null }
  )
