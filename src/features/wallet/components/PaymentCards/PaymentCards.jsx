import { useState } from 'react'
import { ChartCard } from '@/components/charts/ChartCard/ChartCard'
import { Button } from '@/components/ui/Button/Button'
import { brandInfo, cardLabel, formatCardExpiry, isExpired, MAX_CARDS } from '../../utils/card'
import { AddCardForm } from '../AddCardForm/AddCardForm'
import { MethodRow } from '../MethodRow/MethodRow'
import styles from './PaymentCards.module.css'

export function PaymentCards({ cards, selectedId, onSelect, onAdd, onRemove }) {
  const [adding, setAdding] = useState(false)
  const [confirmingId, setConfirmingId] = useState(null)
  const [message, setMessage] = useState('')

  function handleAdd(data) {
    const card = onAdd(data)
    setAdding(false)
    setMessage(`Agregaste tu ${cardLabel(card)}.`)
  }

  function handleRemove(card) {
    onRemove(card.id)
    setConfirmingId(null)
    setMessage(`Eliminaste tu ${cardLabel(card)}.`)
  }

  return (
    <ChartCard title="Tus tarjetas" description="Elige con cuál recargar">
      <div className={styles.content}>
        {cards.length === 0 && !adding && (
          <p className={styles.empty}>Aún no tienes tarjetas guardadas.</p>
        )}
        {cards.length > 0 && (
          <fieldset className={styles.list}>
            <legend className={styles.srOnly}>Tarjeta para recargar</legend>
            {cards.map((card) => (
              <MethodRow
                key={card.id}
                name="payment-card"
                selected={card.id === selectedId}
                disabled={isExpired(card)}
                onSelect={() => onSelect(card.id)}
                chip={brandInfo(card.brand).short}
                chipClassName={styles[card.brand]}
                label={cardLabel(card)}
                badge={isExpired(card) && 'Vencida'}
                meta={`${card.holder} · Vence ${formatCardExpiry(card)}`}
                confirming={confirmingId === card.id}
                onAskRemove={() => setConfirmingId(card.id)}
                onCancelRemove={() => setConfirmingId(null)}
                onRemove={() => handleRemove(card)}
              />
            ))}
          </fieldset>
        )}

        <p className={styles.message} role="status">
          {message}
        </p>

        {adding ? (
          <AddCardForm onAdd={handleAdd} onCancel={() => setAdding(false)} />
        ) : (
          cards.length < MAX_CARDS && (
            <Button
              variant="secondary"
              className={styles.add}
              onClick={() => {
                setMessage('')
                setAdding(true)
              }}
            >
              + Agregar tarjeta
            </Button>
          )
        )}
      </div>
    </ChartCard>
  )
}
