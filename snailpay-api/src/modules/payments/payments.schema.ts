import { z } from 'zod'
import { brandInfo, detectBrand, isExpired, onlyDigits, passesLuhn } from '../../shared/card.js'
import type { RejectedDetail } from './payments.outcomes.js'

export const AMOUNT_LIMITS = { min: 50, max: 10_000 } as const
export const CURRENCY = 'MXN' as const

// Letras de cualquier idioma separadas por espacio, apóstrofo, punto o guion.
const CARDHOLDER_REGEX = /^[\p{L}\p{M}]+(?:[ '.-][\p{L}\p{M}]+)*\.?$/u

const cardSchema = z
  .object({
    number: z
      .string()
      .transform(onlyDigits)
      .refine((digits) => digits.length >= 13 && digits.length <= 19, {
        message: 'El número de tarjeta no es válido',
      })
      .refine(passesLuhn, { message: 'El número de tarjeta no es válido' })
      .refine((digits) => detectBrand(digits) !== null, {
        message: 'No reconocemos la marca de esa tarjeta',
      }),
    expiration_month: z.number().int().min(1).max(12),
    expiration_year: z.number().int().min(2000).max(2099),
    security_code: z.string().regex(/^\d{3,4}$/, 'El código de seguridad no es válido'),
    cardholder_name: z
      .string()
      .transform((value) => value.trim())
      .pipe(
        z
          .string()
          .min(2, 'Escribe el nombre del titular')
          .max(100, 'El nombre del titular es demasiado largo')
          .regex(CARDHOLDER_REGEX, 'El nombre del titular contiene caracteres no permitidos'),
      ),
  })
  // Dos reglas que necesitan ver varios campos a la vez, así que no caben en
  // la validación de un campo suelto.
  .superRefine((card, ctx) => {
    if (isExpired(card.expiration_month, card.expiration_year)) {
      ctx.addIssue({
        code: 'custom',
        path: ['expiration_year'],
        message: 'La tarjeta está vencida',
      })
    }

    // Amex pide cuatro dígitos; el resto, tres. La longitud correcta depende
    // de la marca, y la marca sale del número.
    const brand = detectBrand(card.number)
    if (brand) {
      const { name, cvvLength } = brandInfo(brand)
      if (card.security_code.length !== cvvLength) {
        ctx.addIssue({
          code: 'custom',
          path: ['security_code'],
          message: `El código de seguridad de ${name} tiene ${cvvLength} dígitos`,
        })
      }
    }
  })

export const paymentSchema = z.object({
  transaction_amount: z
    .number()
    .positive('El monto debe ser mayor que cero')
    .min(AMOUNT_LIMITS.min, `El monto mínimo es ${AMOUNT_LIMITS.min}`)
    .max(AMOUNT_LIMITS.max, `El monto máximo por operación es ${AMOUNT_LIMITS.max}`)
    .multipleOf(0.01, 'El monto admite como máximo dos decimales'),

  // Sin moneda, un monto no significa nada: cobrar 500 USD en vez de 500 MXN
  // no daría error en ninguna parte. Este servicio solo liquida en pesos, así
  // que decirlo y rechazar el resto es más honesto que asumirlo.
  currency_id: z.literal(CURRENCY, `Este servicio solo liquida en ${CURRENCY}`),

  // Identificador de la operación en el comercio. Se devuelve tal cual para
  // que el comercio pueda conciliar qué pago corresponde a qué operación suya.
  reference: z
    .string()
    .transform((value) => value.trim())
    .pipe(z.string().min(1, 'La referencia es obligatoria').max(64, 'La referencia es demasiado larga')),

  payer_email: z
    .string()
    .transform((value) => value.trim().toLowerCase())
    .pipe(z.email('El correo del pagador no es válido')),

  card: cardSchema,
})

export type PaymentRequest = z.infer<typeof paymentSchema>

type PaymentBase = {
  id: string
  transaction_amount: number
  currency_id: typeof CURRENCY
  date_created: string
  reference: string
  payer_id: string
  payer_email: string
}

// Unión discriminada por `status` a propósito: el código de autorización lo
// emite el banco AL APROBAR, así que un pago rechazado no puede tener uno.
// Modelarlo así hace que ese estado imposible no se pueda ni escribir.
export type Payment = PaymentBase &
  (
    | { status: 'approved'; status_detail: 'accredited'; authorization_code: string }
    | { status: 'rejected'; status_detail: RejectedDetail; authorization_code: null }
  )
