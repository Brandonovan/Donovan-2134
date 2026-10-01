import { useState } from 'react'
import { ChartCard } from '@/components/charts/ChartCard/ChartCard'
import { Button } from '@/components/ui/Button/Button'
import { Input } from '@/components/ui/Input/Input'
import { SegmentedControl } from '@/components/ui/SegmentedControl/SegmentedControl'
import { formatCurrency, formatSignedCurrency } from '@/utils/formatCurrency'
import { useWallet } from '../../hooks/useWallet'
import { AMOUNT_LIMITS, parseAmount, sanitizeAmount, validateAmount } from '../../utils/amount'
import styles from './WalletOperation.module.css'

const MODES = [
  { value: 'deposit', label: 'Recargar' },
  { value: 'withdrawal', label: 'Retirar' },
]

const QUICK_AMOUNTS = [100, 200, 500, 1000]

const COPY = {
  deposit: {
    sign: 1,
    question: '¿Cuánto quieres recargar?',
    hint: `Mínimo ${formatCurrency(AMOUNT_LIMITS.min)} · máximo ${formatCurrency(AMOUNT_LIMITS.maxDeposit)}`,
    concept: 'Recarga',
    action: 'Recargar',
    pending: 'Procesando recarga…',
    destination: (wallet) => `Se cobrará a tu ${wallet.paymentMethod}`,
    done: (amount, balance) => `Recargaste ${amount}. Tu nuevo saldo es ${balance}.`,
  },
  withdrawal: {
    sign: -1,
    question: '¿Cuánto quieres retirar?',
    hint: `Mínimo ${formatCurrency(AMOUNT_LIMITS.min)}`,
    concept: 'Retiro',
    action: 'Retirar',
    pending: 'Procesando retiro…',
    destination: (wallet) => `Se depositará en tu ${wallet.payoutAccount}`,
    done: (amount, balance) => `Retiraste ${amount}. Tu nuevo saldo es ${balance}.`,
  },
}

export function WalletOperation({ onComplete }) {
  const { wallet, loading, error, retry, deposit, withdraw } = useWallet()
  const [mode, setMode] = useState('deposit')
  const [value, setValue] = useState('')
  const [fieldError, setFieldError] = useState()
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const copy = COPY[mode]
  const balance = wallet?.balance ?? 0
  const amount = parseAmount(value)
  const balanceAfter = balance + copy.sign * amount

  function changeAmount(next) {
    setValue(next)
    setFieldError(undefined)
    setSubmitError('')
    setSuccess('')
  }

  function changeMode(next) {
    setMode(next)
    changeAmount('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validateAmount(amount, mode, balance)
    setFieldError(validationError)
    if (validationError) return

    setIsSubmitting(true)
    setSubmitError('')
    try {
      const transaction = await (mode === 'deposit' ? deposit : withdraw)(amount)
      onComplete?.(transaction)
      setValue('')
      setSuccess(copy.done(formatCurrency(amount), formatCurrency(balanceAfter)))
    } catch (requestError) {
      setSubmitError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ChartCard title="Mover saldo" loading={loading} error={error} onRetry={retry}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <SegmentedControl label="Tipo de operación" options={MODES} value={mode} onChange={changeMode} />

        <Input
          label={copy.question}
          name="amount"
          inputMode="decimal"
          placeholder="0.00"
          autoComplete="off"
          value={value}
          onChange={(event) => changeAmount(sanitizeAmount(event.target.value))}
          error={fieldError}
          hint={copy.hint}
          disabled={isSubmitting}
        />

        <div className={styles.quick} role="group" aria-label="Montos rápidos">
          {QUICK_AMOUNTS.map((quick) => (
            <button
              key={quick}
              type="button"
              className={styles.chip}
              aria-pressed={amount === quick}
              onClick={() => changeAmount(String(quick))}
              disabled={isSubmitting}
            >
              {formatCurrency(quick).replace(/\.00$/, '')}
            </button>
          ))}
          {mode === 'withdrawal' && (
            <button
              type="button"
              className={styles.chip}
              aria-pressed={amount > 0 && amount === balance}
              onClick={() => changeAmount(String(balance))}
              disabled={isSubmitting || balance === 0}
            >
              Todo
            </button>
          )}
        </div>

        <dl className={styles.summary}>
          <div>
            <dt>Saldo actual</dt>
            <dd>{formatCurrency(balance)}</dd>
          </div>
          <div>
            <dt>{copy.concept}</dt>
            <dd>{formatSignedCurrency(copy.sign * amount)}</dd>
          </div>
          <div className={styles.total}>
            <dt>Saldo final</dt>
            <dd className={balanceAfter < 0 ? styles.negative : undefined}>{formatCurrency(balanceAfter)}</dd>
          </div>
        </dl>

        {wallet && <p className={styles.destination}>{copy.destination(wallet)}</p>}

        {submitError && (
          <p className={styles.error} role="alert">
            {submitError}
          </p>
        )}
        <p className={styles.success} role="status">
          {success}
        </p>

        <Button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? copy.pending : `${copy.action}${amount > 0 ? ` ${formatCurrency(amount)}` : ''}`}
        </Button>
      </form>
    </ChartCard>
  )
}
