import { useState } from 'react'
import type { FormEvent } from 'react'
import type { BankAccount, Card, MovementResult, OperationMode, Transaction } from '../../types'
import { ChartCard } from '@/components/charts/ChartCard/ChartCard'
import { Button } from '@/components/ui/Button/Button'
import { Input } from '@/components/ui/Input/Input'
import { SegmentedControl } from '@/components/ui/SegmentedControl/SegmentedControl'
import { formatCurrency, formatSignedCurrency } from '@/utils/formatCurrency'
import { useWallet } from '../../hooks/useWallet'
import { AMOUNT_LIMITS, parseAmount, sanitizeAmount, validateAmount } from '../../utils/amount'
import { OperationDialog } from '../OperationDialog/OperationDialog'
import styles from './WalletOperation.module.css'

// `satisfies` fija los valores como literales sin perder el tipo del array:
// así SegmentedControl deduce que onChange entrega un OperationMode.
const MODES = [
  { value: 'deposit', label: 'Recargar' },
  { value: 'withdrawal', label: 'Retirar' },
] satisfies { value: OperationMode; label: string }[]

const QUICK_AMOUNTS = [100, 200, 500, 1000]

const COPY = {
  deposit: {
    sign: 1,
    question: '¿Cuánto quieres recargar?',
    hint: `Mínimo ${formatCurrency(AMOUNT_LIMITS.min)} · máximo ${formatCurrency(AMOUNT_LIMITS.max)}`,
    concept: 'Recarga',
    action: 'Recargar',
  },
  withdrawal: {
    sign: -1,
    question: '¿Cuánto quieres retirar?',
    hint: `Mínimo ${formatCurrency(AMOUNT_LIMITS.min)} · máximo ${formatCurrency(AMOUNT_LIMITS.max)}`,
    concept: 'Retiro',
    action: 'Retirar',
  },
}

// La operación es controlada: el modo y el método (tarjeta o cuenta) se eligen
// en la tarjeta de métodos y llegan aquí ya resueltos. Este formulario solo arma
// el monto: la confirmación, el CVV y el comprobante viven en OperationDialog.
type Props = {
  mode: OperationMode
  onModeChange: (mode: OperationMode) => void
  card: Card | undefined
  account: BankAccount | undefined
  payerEmail: string
  onComplete?: (transaction: Transaction) => void
}

export function WalletOperation({
  mode,
  onModeChange,
  card,
  account,
  payerEmail,
  onComplete,
}: Props) {
  const { wallet, loading, error, retry, deposit, withdraw, updateBalance } = useWallet()
  const [value, setValue] = useState('')
  const [fieldError, setFieldError] = useState<string | undefined>()
  const [confirming, setConfirming] = useState(false)

  const copy = COPY[mode]
  const balance = wallet?.balance ?? 0
  const amount = parseAmount(value)
  // Si el monto pasa el límite (saldo al retirar, tope al recargar) no se calcula nada:
  // el resumen queda en ceros y el error se muestra de inmediato, sin esperar al envío.
  // Al retirar mandan los dos límites: el saldo y el tope por operación.
  const maxAmount =
    mode === 'withdrawal' ? Math.min(balance, AMOUNT_LIMITS.max) : AMOUNT_LIMITS.max
  const overLimit = amount > maxAmount
  const operationAmount = overLimit ? 0 : amount
  const balanceAfter = overLimit ? 0 : balance + copy.sign * amount
  const amountError = fieldError ?? (overLimit ? validateAmount(amount, mode, balance) : undefined)

  const needsMethod = mode === 'deposit' ? !card : !account
  const canSubmit = amount >= AMOUNT_LIMITS.min && !overLimit && !needsMethod

  function changeAmount(next: string) {
    setValue(next)
    setFieldError(undefined)
  }

  function changeMode(next: OperationMode) {
    onModeChange(next)
    changeAmount('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (needsMethod) return

    const validationError = validateAmount(amount, mode, balance)
    setFieldError(validationError)
    if (!validationError) setConfirming(true)
  }

  // Lo llama el diálogo; si falla, el error se queda en el diálogo.
  //
  // Las comprobaciones son redundantes —`canSubmit` ya exige un método y el CVV
  // se pide en el paso anterior— pero antes esa garantía vivía repartida entre
  // dos componentes. Escribirla aquí la hace comprobable.
  function confirm(cvv?: string) {
    if (mode === 'deposit') {
      if (!card || cvv === undefined) throw new Error('Selecciona una tarjeta y escribe el CVV')
      return deposit(amount, { card, cvv, payerEmail })
    }
    if (!account) throw new Error('Selecciona una cuenta de destino')
    return withdraw(amount, { account, payerEmail })
  }

  // result = { balance, transaction } si la operación se completó, null si se canceló.
  // El saldo y el historial se actualizan aquí, al cerrar el comprobante, para que
  // el usuario vea el cambio en vez de que ocurra detrás del diálogo.
  function closeDialog(result: MovementResult | null) {
    setConfirming(false)
    if (!result) return
    updateBalance(result.balance)
    onComplete?.(result.transaction)
    setValue('')
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
          error={amountError}
          hint={copy.hint}
        />

        <div className={styles.quick} role="group" aria-label="Montos rápidos">
          {QUICK_AMOUNTS.map((quick) => (
            <button
              key={quick}
              type="button"
              className={styles.chip}
              aria-pressed={amount === quick}
              onClick={() => changeAmount(String(quick))}
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
              disabled={balance === 0}
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
            <dd>{formatSignedCurrency(copy.sign * operationAmount)}</dd>
          </div>
          <div className={styles.total}>
            <dt>Saldo final</dt>
            <dd>{formatCurrency(balanceAfter)}</dd>
          </div>
        </dl>

        <Button type="submit" className={styles.submit} disabled={!canSubmit}>
          {`${copy.action}${operationAmount > 0 ? ` ${formatCurrency(operationAmount)}` : ''}`}
        </Button>
      </form>

      <OperationDialog
        open={confirming}
        mode={mode}
        method={mode === 'deposit' ? card : account}
        amount={amount}
        balanceAfter={balanceAfter}
        onConfirm={confirm}
        onClose={closeDialog}
      />
    </ChartCard>
  )
}
