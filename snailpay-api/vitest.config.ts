import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    // Sin la latencia simulada: una suite que espera 1,2 s por cobro tarda
    // minutos en vez de segundos, y lo que se prueba no es el reloj.
    env: { AUTHORIZATION_DELAY_MS: '0' },
  },
})
