/// <reference types="vite/client" />

// Variables de entorno que lee la app. Declararlas aquí hace que
// import.meta.env.VITE_USE_MOCKS esté tipada y que un nombre mal escrito sea
// un error de compilación en vez de un `undefined` silencioso.
interface ImportMetaEnv {
  readonly VITE_USE_MOCKS?: string
  readonly VITE_API_URL?: string
  readonly VITE_GATEWAY_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
