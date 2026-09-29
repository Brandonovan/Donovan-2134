import styles from './ChartCard.module.css'

// Tarjeta para gráficas. `table` es la vista en tabla de los mismos datos:
// ningún valor debe depender solo del color o del hover.
export function ChartCard({ title, description, table, children }) {
  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
      </header>
      <div className={styles.body}>{children}</div>
      {table && (
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
