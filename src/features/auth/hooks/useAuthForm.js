import { useState } from 'react'

const identity = (values) => values

export function useAuthForm({ initialValues, sanitize = identity, validate, onSubmit }) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(event) {
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
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return { values, errors, submitError, isSubmitting, handleChange, handleSubmit }
}
