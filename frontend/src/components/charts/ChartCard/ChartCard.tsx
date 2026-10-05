import type { ReactNode } from 'react'
import styles from './ChartCard.module.css'

// La primera celda de cada fila hace de clave, así que es texto.
export type ChartTable = {
  columns: string[]
  rows: [string, ...ReactNode[]][]
}

type StateProps = {
  loading?: boolean
  error?: Error | null
  onRetry?: () => void
}

function CardBody({ loading, error, onRetry, children }: StateProps & { children: ReactNode }) {
  if (loading) {
    return (
      <div className={styles.skeleton} role="status">
        <span className={styles.srOnly}>Cargando…</span>
      </div>
    )
  }
  if (error) {
    return (
      <div className={styles.error} role="alert">
        <p>No pudimos cargar esta información.</p>
        {onRetry && (
          <button type="button" className={styles.retry} onClick={onRetry}>
            Reintentar
          </button>
        )}
      </div>
    )
  }
  return <>{children}</>
}

// Tarjeta para gráficas. `table` es la vista en tabla de los mismos datos:
// ningún valor debe depender solo del color o del hover.
// Mientras `loading` o `error` estén activos, muestra su estado en lugar de `children`.
type Props = StateProps & {
  title: ReactNode
  description?: ReactNode
  table?: ChartTable
  children?: ReactNode
}

export function ChartCard({ title, description, table, loading, error, onRetry, children }: Props) {
  const ready = !loading && !error

  return (
    <section className={styles.card} aria-busy={loading || undefined}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
      </header>
      <div className={styles.body}>
        <CardBody loading={loading} error={error} onRetry={onRetry}>
          {children}
        </CardBody>
      </div>
      {ready && table && (
        <details className={styles.details}>
          <summary>Ver datos</summary>
          <table className={styles.table}>
            <thead>
              <tr>
                {table.columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) => (
                    <td key={index}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </section>
  )
}
