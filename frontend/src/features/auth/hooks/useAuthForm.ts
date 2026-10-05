import { useState, type ChangeEvent, type FormEvent } from 'react'
import type { FieldErrors } from '../utils/validation'

// Los formularios de auth son todos de campos de texto, así que T se restringe
// a eso: permite teclear `values.email` con confianza y que un campo inventado
// deje de compilar.
type FormValues = Record<string, string>

type Options<T extends FormValues> = {
  initialValues: T
  sanitize?: (values: T) => T
  validate: (values: T) => FieldErrors<T>
  onSubmit: (values: T) => Promise<unknown>
}

const identity = <T,>(values: T): T => values

export function useAuthForm<T extends FormValues>({
  initialValues,
  sanitize = identity,
  validate,
  onSubmit,
}: Options<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FieldErrors<T>>({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError('')

    // Se limpia al enviar (no en cada tecla) para no pelear con lo que el usuario escribe.
    const cleanValues = sanitize(values)
    const validationErrors = validate(cleanValues)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await onSubmit(cleanValues)
    } catch (error) {
      // Lo que lanza un servicio puede ser cualquier cosa; el formulario pinta
      // un texto, así que aquí se garantiza que lo haya.
      setSubmitError(error instanceof Error ? error.message : 'No pudimos completar la operación')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { values, errors, submitError, isSubmitting, handleChange, handleSubmit }
}
