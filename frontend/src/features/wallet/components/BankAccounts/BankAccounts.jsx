import { useState } from 'react'
import { ChartCard } from '@/components/charts/ChartCard/ChartCard'
import { Button } from '@/components/ui/Button/Button'
import { accountLabel, MAX_ACCOUNTS } from '../../utils/clabe'
import { AddBankAccountForm } from '../AddBankAccountForm/AddBankAccountForm'
import { MethodRow } from '../MethodRow/MethodRow'
import styles from '../PaymentCards/PaymentCards.module.css'

export function BankAccounts({ accounts, selectedId, onSelect, holder, onAdd, onRemove }) {
  const [adding, setAdding] = useState(false)
  const [confirmingId, setConfirmingId] = useState(null)
  const [message, setMessage] = useState('')

  function handleAdd(data) {
    const account = onAdd(data)
    setAdding(false)
    setMessage(`Agregaste tu cuenta ${accountLabel(account)}.`)
  }

  function handleRemove(account) {
    onRemove(account.id)
    setConfirmingId(null)
    setMessage(`Eliminaste tu cuenta ${accountLabel(account)}.`)
  }

  return (
    <ChartCard title="Cuentas para retiro" description="Elige a cuál te depositamos por SPEI">
      <div className={styles.content}>
        {accounts.length === 0 && !adding && (
          <p className={styles.empty}>Aún no tienes cuentas registradas.</p>
        )}
        {accounts.length > 0 && (
          <fieldset className={styles.list}>
            <legend className={styles.srOnly}>Cuenta para retirar</legend>
            {accounts.map((account) => (
              <MethodRow
                key={account.id}
                name="payout-account"
                selected={account.id === selectedId}
                onSelect={() => onSelect(account.id)}
                chip="CLABE"
                label={accountLabel(account)}
                meta={account.holder}
                confirming={confirmingId === account.id}
                onAskRemove={() => setConfirmingId(account.id)}
                onCancelRemove={() => setConfirmingId(null)}
                onRemove={() => handleRemove(account)}
              />
            ))}
          </fieldset>
        )}

        <p className={styles.message} role="status">
          {message}
        </p>

        {adding ? (
          <AddBankAccountForm holder={holder} onAdd={handleAdd} onCancel={() => setAdding(false)} />
        ) : (
          accounts.length < MAX_ACCOUNTS && (
            <Button
              variant="secondary"
              className={styles.add}
              onClick={() => {
                setMessage('')
                setAdding(true)
              }}
            >
              + Agregar cuenta CLABE
            </Button>
          )
        )}
      </div>
    </ChartCard>
  )
}
