// Latencia simulada de la autorización.
//
// Un cobro real no es instantáneo: la pasarela habla con el banco emisor y
// espera su respuesta, lo que suele llevar entre uno y tres segundos. Devolver
// en 130 ms haría que el paso de "procesando" pasara volando y que la interfaz
// se diseñara contra un tiempo que no existe fuera de este mock.
//
// Solo afecta a las operaciones de dinero. /health y /status siguen siendo
// inmediatos: son comprobaciones de estado, no cobros.

// Variación de ±20% alrededor del valor configurado. Una latencia clavada en el
// mismo número es su propia pista de que es falsa.
const JITTER = 0.2

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function authorizationDelay(baseMs: number): Promise<void> {
  const factor = 1 + (Math.random() * 2 - 1) * JITTER
  return sleep(Math.round(baseMs * factor))
}
