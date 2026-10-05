// El dinero se maneja en centavos, como enteros.
//
// En coma flotante, 0.1 + 0.2 no es 0.3, y los errores se acumulan operación
// tras operación: un saldo acabaría desviándose de la suma de sus movimientos.
// El front lo esquiva redondeando a dos decimales en cada cálculo, pero quien
// lleva la cuenta real no puede permitirse ese parche.
//
// Hacia fuera, la API sigue hablando en pesos: la conversión ocurre en el borde.

export type Cents = number

export function toCents(amount: number): Cents {
  return Math.round(amount * 100)
}

export function toAmount(cents: Cents): number {
  return cents / 100
}
