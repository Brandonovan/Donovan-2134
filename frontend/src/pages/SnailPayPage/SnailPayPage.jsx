import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import snailpayLogo from '@/assets/brand/snailpay.png'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/auth'
import {
  BalanceCard,
  BankAccounts,
  getTransactions,
  PaymentCards,
  SnailPayLoader,
  TransactionHistory,
  usePaymentMethods,
  useWallet,
  WalletOperation,
} from '@/features/wallet'
import { useRequest } from '@/hooks/useRequest'
import styles from './SnailPayPage.module.css'

export function SnailPayPage() {
  const { user } = useAuth()
  const { wallet, loading, error, retry } = useWallet()
  const transactions = useRequest(getTransactions)
  const { setData: setTransactions } = transactions
  const payment = usePaymentMethods()
  const [lastTransactionId, setLastTransactionId] = useState(null)

  // El movimiento recién hecho se agrega arriba del historial (sin volver a pedirlo) y se resalta.
  const addTransaction = useCallback(
    (transaction) => {
      setTransactions((list) => list && [transaction, ...list])
      setLastTransactionId(transaction.id)
    },
    [setTransactions],
  )

  // La pantalla de carga solo cubre la carga inicial. Después (reintentos,
  // operaciones), cada tarjeta muestra su propio estado y no se oculta lo que ya cargó.
  const [hasLoaded, setHasLoaded] = useState(false)
  if (!hasLoaded && !loading && !transactions.loading) setHasLoaded(true)

  if (!hasLoaded) return <SnailPayLoader />

  return (
    <div className={styles.page}>
      <Link to={ROUTES.LOBBY} className={styles.back}>
        <span aria-hidden="true">←</span> Volver al lobby
      </Link>

      <header className={styles.header}>
        {/* El logotipo se usa como máscara para teñirlo con el dorado de la marca. */}
        <span
          className={styles.logo}
          style={{ maskImage: `url(${snailpayLogo})`, WebkitMaskImage: `url(${snailpayLogo})` }}
          role="img"
          aria-label="SnailPay"
        />
        <div>
          <h1 className={styles.title}>Tu billetera</h1>
          <p className={styles.subtitle}>Recarga, retira y revisa tus movimientos.</p>
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.column}>
          <BalanceCard
            balance={wallet?.balance}
            transactions={transactions.data}
            loading={loading}
            error={error}
            onRetry={retry}
          />
          {/* Los métodos cambian con la operación: tarjetas para recargar, cuentas para retirar. */}
          {payment.mode === 'deposit' ? (
            <PaymentCards
              cards={payment.cards}
              selectedId={payment.selectedCard?.id}
              onSelect={payment.selectCard}
              onAdd={payment.addCard}
              onRemove={payment.removeCard}
            />
          ) : (
            <BankAccounts
              accounts={payment.accounts}
              selectedId={payment.selectedAccount?.id}
              onSelect={payment.selectAccount}
              holder={user.name.toUpperCase()}
              onAdd={payment.addAccount}
              onRemove={payment.removeAccount}
            />
          )}
        </div>
        <WalletOperation
          mode={payment.mode}
          onModeChange={payment.changeMode}
          card={payment.selectedCard}
          account={payment.selectedAccount}
          payerEmail={user.email}
          onComplete={addTransaction}
        />
      </div>

      <TransactionHistory
        transactions={transactions.data}
        highlightId={lastTransactionId}
        loading={transactions.loading}
        error={transactions.error}
        onRetry={transactions.retry}
      />
    </div>
  )
}
