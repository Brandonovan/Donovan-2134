import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { notFound } from './middlewares/notFound.js'
import { routes } from './routes.js'

// La app se construye aquí y escucha en server.ts. Separarlas permite que los
// tests la importen y le hagan peticiones sin ocupar un puerto.
export function createApp() {
  const app = express()

  app.use(cors({ origin: env.CORS_ORIGIN }))
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.use(routes)

  // Estos dos van al final: el 404 recoge lo que ninguna ruta atendió, y el
  // manejador de errores tiene que ser el último middleware registrado.
  app.use(notFound)
  app.use(errorHandler)

  return app
}
