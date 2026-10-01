const MOCK_DELAY_MS = 600

// Mientras no exista el backend, los servicios responden con mocks.
// Para usar la API real: VITE_USE_MOCKS=false (y VITE_API_URL) en .env.local.
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

// Simula la respuesta de un endpoint: latencia de red y una copia nueva de los
// datos en cada llamada, como si llegaran deserializados de un JSON.
export function mockRequest(data, { delay = MOCK_DELAY_MS } = {}) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), delay)
  })
}
