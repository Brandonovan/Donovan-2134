import { useState } from 'react'
import type { FormEvent } from 'react'
import type { CardFormErrors, CardFormValues } from '../../utils/card'
import { Button } from '@/components/ui/Button/Button'
import { Input } from '@/components/ui/Input/Input'
import { SegmentedControl } from '@/components/ui/SegmentedControl/SegmentedControl'
import {
  brandInfo,
  CARD_TYPES,
  detectBrand,
  formatCardNumber,
  formatExpiry,
  onlyDigits,
  sanitizeCardForm,
  validateCardForm,
} from '../../utils/card'
import styles from './AddCardForm.module.css'

const INITIAL_VALUES: CardFormValues = { number: '', holder: '', expiry: '', type: 'debit' }

// Solo dos campos se reformatean mientras se escribe; el resto pasa tal cual.
const FORMATTERS: Partial<Record<keyof CardFormValues, (value: string) => string>> = {
  number: formatCardNumber,
  expiry: formatExpiry,
}

type Props = {
  // No se usa lo que devuelva: el formulario solo lo llama y atiende si lanza.
  onAdd: (values: CardFormValues) => void
  onCancel: () => void
}

export function AddCardForm({ onAdd, onCancel }: Props) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState<CardFormErrors>({})
  const [submitError, setSubmitError] = useState('')

  const brand = detectBrand(onlyDigits(values.number))

  function setField(name: keyof CardFormValues, value: string) {
    setValues((current) => ({ ...current, [name]: FORMATTERS[name]?.(value) ?? value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setSubmitError('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const clean = sanitizeCardForm(values)
    const validationErrors = validateCardForm(clean)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    try {
      onAdd(clean)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No pudimos guardar la tarjeta')
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate aria-label="Agregar tarjeta">
      <SegmentedControl
        label="Tipo de tarjeta"
        options={CARD_TYPES}
        value={values.type}
        onChange={(type) => setField('type', type)}
      />
      <Input
        label="Número de tarjeta"
        name="number"
        // El formulario se abre por acción del usuario: llevarlo directo al primer campo.
        autoFocus
        inputMode="numeric"
        autoComplete="cc-number"
        placeholder="0000 0000 0000 0000"
        value={values.number}
        onChange={(event) => setField('number', event.target.value)}
        error={errors.number}
        hint={brand ? brandInfo(brand).name : 'Visa, Mastercard o American Express'}
      />
      <Input
        label="Nombre del titular"
        name="holder"
        autoComplete="cc-name"
        placeholder="Como aparece en la tarjeta"
        maxLength={60}
        value={values.holder}
        onChange={(event) => setField('holder', event.target.value)}
        error={errors.holder}
      />
      <div className={styles.row}>
        <Input
          label="Vencimiento"
          name="expiry"
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="MM/AA"
          value={values.expiry}
          onChange={(event) => setField('expiry', event.target.value)}
          error={errors.expiry}
        />
      </div>
      <p className={styles.note}>
        No guardamos el número completo ni el CVV. Te pediremos el CVV cada vez que recargues.
      </p>
      {submitError && (
        <p className={styles.error} role="alert">
          {submitError}
        </p>
      )}
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar tarjeta</Button>
      </div>
    </form>
  )
}
