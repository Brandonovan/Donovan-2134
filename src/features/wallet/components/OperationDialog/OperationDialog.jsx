import { useId, useState } from 'react'
import { Button } from '@/components/ui/Button/Button'
import { Dialog } from '@/components/ui/Dialog/Dialog'
import { Input } from '@/components/ui/Input/Input'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDateTime } from '@/utils/formatDateTime'
import { brandInfo, cardLabel, onlyDigits, validateCvv } from '../../utils/card'
import { accountLabel } from '../../utils/clabe'
import styles from './OperationDialog.module.css'

const COPY = {
  deposit: {
    confirmTitle: 'Confirma tu recarga',
    methodLabel: 'Tarjeta',
    balanceLabel: 'Saldo después de recargar',
    action: 'Pagar',
    processing: 'Procesando tu recarga…',
    successTitle: '¡Recarga exitosa!',
    successNote: 'Tu saldo ya está disponible para apostar.',
  },
  withdrawal: {
    confirmTitle: 'Confirma tu retiro',
    methodLabel: 'Cuenta',
    balanceLabel: 'Saldo después de retirar',
    action: 'Retirar',
    processing: 'Enviando tu retiro…',
    successTitle: '¡Retiro enviado!',
    successNote: 'Te lo enviamos por SPEI; normalmente llega en unos minutos.',
  },
}

// Folio corto y legible a partir del id de la transacción.
const folio = (id) => id.replace(/-/g, '').slice(0, 10).toUpperCase()

function CheckIcon() {
  return (
    <svg className={styles.check} viewBox="0 0 52 52" aria-hidden="true">
      <circle className={styles.checkCircle} cx="26" cy="26" r="24" />
      <path className={styles.checkMark} d="M15 27 l7 7 l15 -16" />
    </svg>
  )
}

function ConfirmStep({ titleId, copy, mode, method, amount, balanceAfter, error, onCancel, onConfirm }) {
  const [cvv, setCvv] = useState('')
  const [cvvError, setCvvError] = useState()
  const needsCvv = mode === 'deposit'
  const { cvv: cvvLength } = brandInfo(method.brand)
  const cvvHint =
    method.brand === 'amex' ? 'Los 4 dígitos al frente de tu tarjeta' : 'Los 3 dígitos al reverso de tu tarjeta'

  function handleSubmit(event) {
    event.preventDefault()
    if (needsCvv) {
      const validationError = validateCvv(cvv, method.brand)
      setCvvError(validationError)
      if (validationError) return
    }
    onConfirm(needsCvv ? cvv : undefined)
  }

  return (
    <form className={styles.step} onSubmit={handleSubmit} noValidate>
      <h2 id={titleId} className={styles.title}>
        {copy.confirmTitle}
      </h2>
      <p className={styles.amount}>{formatCurrency(amount)}</p>

      <dl className={styles.details}>
        <div>
          <dt>{copy.methodLabel}</dt>
          <dd>{mode === 'deposit' ? cardLabel(method) : accountLabel(method)}</dd>
        </div>
        {mode === 'withdrawal' && (
          <div>
            <dt>Titular</dt>
            <dd>{method.holder}</dd>
          </div>
        )}
        <div>
          <dt>{copy.balanceLabel}</dt>
          <dd>{formatCurrency(balanceAfter)}</dd>
        </div>
      </dl>

      {needsCvv && (
        <>
          <div className={styles.cvv}>
            <Input
              label="CVV"
              name="cvv"
              // Se abre por acción del usuario y es el único dato que falta.
              autoFocus
              type="password"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder={'•'.repeat(cvvLength)}
              maxLength={cvvLength}
              value={cvv}
              onChange={(event) => {
                setCvv(onlyDigits(event.target.value).slice(0, cvvLength))
                setCvvError(undefined)
              }}
              error={cvvError}
              hint={cvvHint}
            />
          </div>
          <p className={styles.note}>No guardamos tu CVV: te lo pedimos en cada recarga.</p>
        </>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        {/* Sin CVV que capturar, el foco va directo a la acción principal. */}
        <Button type="submit" autoFocus={!needsCvv}>
          {copy.action} {formatCurrency(amount)}
        </Button>
      </div>
    </form>
  )
}

function ProcessingStep({ titleId, copy }) {
  return (
    <div className={`${styles.step} ${styles.centered}`} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <h2 id={titleId} className={styles.title}>
        {copy.processing}
      </h2>
      <p className={styles.note}>No cierres esta ventana.</p>
    </div>
  )
}

function SuccessStep({ titleId, copy, mode, method, result, onDone }) {
  const { balance, transaction } = result

  return (
    <div className={`${styles.step} ${styles.centered}`}>
      <CheckIcon />
      <h2 id={titleId} className={styles.title} role="status">
        {copy.successTitle}
      </h2>
      <p className={styles.amount}>{formatCurrency(transaction.amount)}</p>
      <p className={styles.note}>{copy.successNote}</p>

      <dl className={`${styles.details} ${styles.receipt}`}>
        <div>
          <dt>{copy.methodLabel}</dt>
          <dd>{mode === 'deposit' ? cardLabel(method) : accountLabel(method)}</dd>
        </div>
        <div>
          <dt>Nuevo saldo</dt>
          <dd>{formatCurrency(balance)}</dd>
        </div>
        <div>
          <dt>Fecha</dt>
          <dd>{formatDateTime(transaction.createdAt)}</dd>
        </div>
        <div>
          <dt>Folio</dt>
          <dd className={styles.folio}>{folio(transaction.id)}</dd>
        </div>
      </dl>

      <Button className={styles.done} onClick={onDone} autoFocus>
        Listo
      </Button>
    </div>
  )
}

// Flujo de una operación en tres pasos: confirmar → procesando → comprobante.
// onConfirm(cvv) hace la operación y devuelve { balance, transaction }; si falla,
// se regresa a confirmar con el error. onClose(result) recibe el resultado si la
// operación se completó (o null si se canceló).
function OperationFlow({ titleId, mode, method, amount, balanceAfter, onConfirm, onClose, onDismissibleChange }) {
  const [step, setStep] = useState('confirm')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const copy = COPY[mode]

  async function confirm(cvv) {
    setStep('processing')
    setError('')
    onDismissibleChange(false)
    try {
      setResult(await onConfirm(cvv))
      setStep('success')
    } catch (operationError) {
      setError(operationError.message)
      setStep('confirm')
    } finally {
      onDismissibleChange(true)
    }
  }

  if (step === 'processing') return <ProcessingStep titleId={titleId} copy={copy} />
  if (step === 'success') {
    return (
      <SuccessStep
        titleId={titleId}
        copy={copy}
        mode={mode}
        method={method}
        result={result}
        onDone={() => onClose(result)}
      />
    )
  }
  return (
    <ConfirmStep
      titleId={titleId}
      copy={copy}
      mode={mode}
      method={method}
      amount={amount}
      balanceAfter={balanceAfter}
      error={error}
      onCancel={() => onClose(null)}
      onConfirm={confirm}
    />
  )
}

export function OperationDialog({ open, mode, method, amount, balanceAfter, onConfirm, onClose }) {
  // Cada paso pone su propio título con este id.
  const titleId = useId()
  // Mientras se procesa no se puede cerrar; al terminar, cerrar (Esc, clic fuera)
  // equivale a "Listo" o "Cancelar" según el paso.
  const [dismissible, setDismissible] = useState(true)
  const [lastResult, setLastResult] = useState(null)

  return (
    <Dialog
      open={open}
      labelledBy={titleId}
      dismissible={dismissible}
      onClose={() => {
        onClose(lastResult)
        setLastResult(null)
      }}
    >
      {method && (
        <OperationFlow
          titleId={titleId}
          mode={mode}
          method={method}
          amount={amount}
          balanceAfter={balanceAfter}
          onConfirm={async (cvv) => {
            const result = await onConfirm(cvv)
            setLastResult(result)
            return result
          }}
          onClose={(result) => {
            onClose(result)
            setLastResult(null)
          }}
          onDismissibleChange={setDismissible}
        />
      )}
    </Dialog>
  )
}
