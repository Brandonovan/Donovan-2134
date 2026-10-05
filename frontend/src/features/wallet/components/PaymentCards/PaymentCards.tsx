import { useState } from 'react'
import type { Card } from '../../types'
import type { CardFormValues } from '../../utils/card'
import { ChartCard } from '@/components/charts/ChartCard/ChartCard'
import { Button } from '@/components/ui/Button/Button'
import { brandInfo, cardLabel, formatCardExpiry, isExpired, MAX_CARDS } from '../../utils/card'
import { AddCardForm } from '../AddCardForm/AddCardForm'
import { MethodRow } from '../MethodRow/MethodRow'
import styles from './PaymentCards.module.css'

type Props = {
  cards: Card[]
  selectedId: string | undefined
  onSelect: (id: string) => void
  onAdd: (values: CardFormValues) => Card
  onRemove: (id: string) => void
}

export function PaymentCards({ cards, selectedId, onSelect, onAdd, onRemove }: Props) {
  const [adding, setAdding] = useState(false)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  function handleAdd(data: CardFormValues) {
    const card = onAdd(data)
    setAdding(false)
    setMessage(`Agregaste tu ${cardLabel(card)}.`)
  }

  function handleRemove(card: Card) {
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
                chipClassName={card.brand ? styles[card.brand] : ''}
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
