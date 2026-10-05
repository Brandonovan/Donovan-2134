import { useState } from 'react'
import { Button } from '@/components/ui/Button/Button'
import { Input } from '@/components/ui/Input/Input'
import { bankName, formatClabe, sanitizeClabe, validateClabe } from '../../utils/clabe'
import styles from '../AddCardForm/AddCardForm.module.css'

// holder = nombre del usuario: la cuenta debe estar a su nombre, así que no se edita.
export function AddBankAccountForm({ holder, onAdd, onCancel }) {
  const [clabe, setClabe] = useState('')
  const [error, setError] = useState()
  const [submitError, setSubmitError] = useState('')

  const digits = sanitizeClabe(clabe)
  const hint = digits.length >= 3 ? bankName(digits.slice(0, 3)) : '18 dígitos, la encuentras en tu app bancaria'

  function handleSubmit(event) {
    event.preventDefault()
    const validationError = validateClabe(digits)
    setError(validationError)
    if (validationError) return

    try {
      onAdd({ clabe: digits, holder })
    } catch (addError) {
      setSubmitError(addError.message)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate aria-label="Agregar cuenta CLABE">
      <Input
        label="CLABE interbancaria"
        name="clabe"
        // El formulario se abre por acción del usuario: llevarlo directo al primer campo.
        autoFocus
        inputMode="numeric"
        autoComplete="off"
        placeholder="000 000 00000000000 0"
        value={clabe}
        onChange={(event) => {
          setClabe(formatClabe(event.target.value))
          setError(undefined)
          setSubmitError('')
        }}
        error={error}
        hint={hint}
      />
      <Input label="Titular" name="holder" value={holder} readOnly hint="La cuenta debe estar a tu nombre" />
      <p className={styles.note}>No guardamos la CLABE completa en este dispositivo.</p>
      {submitError && (
        <p className={styles.error} role="alert">
          {submitError}
        </p>
      )}
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar cuenta</Button>
      </div>
    </form>
  )
}
