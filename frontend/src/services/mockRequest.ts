const MOCK_DELAY_MS = 600

// Mientras no exista el backend, los servicios responden con mocks.
// Para usar la API real: VITE_USE_MOCKS=false (y VITE_API_URL) en .env.local.
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

// Simula la respuesta de un endpoint: latencia de red y una copia nueva de los
// datos en cada llamada, como si llegaran deserializados de un JSON.
// `response` puede ser el dato o una función que lo calcula; si lanza un error,
// la promesa se rechaza como lo haría una respuesta 4xx.
export function mockRequest<T>(
  response: T | (() => T),
  { delay = MOCK_DELAY_MS }: { delay?: number } = {},
): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const data = typeof response === 'function' ? (response as () => T)() : response
        resolve(structuredClone(data))
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)))
      }
    }, delay)
  })
}
