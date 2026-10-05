import { beforeEach } from 'vitest'

// localStorage mínimo, en memoria.
//
// Las pruebas son de lógica, no de componentes, así que montar un DOM completo
// solo para esto sería desproporcionado. Se vacía entre pruebas para que
// ninguna dependa de lo que dejó la anterior.
const store = new Map<string, string>()

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, String(value)),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
  },
})

beforeEach(() => {
  store.clear()
})
