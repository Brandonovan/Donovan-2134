import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // El alias se repite aquí porque vitest no lee vite.config.js cuando existe
  // esta configuración. Son pruebas de lógica, así que no hace falta el plugin
  // de React ni un DOM completo.
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts'],
  },
})
