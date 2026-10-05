import 'dotenv/config'
import { z } from 'zod'

// `dotenv/config` carga .env si existe, y no se queja si no está: las variables
// del entorno real tienen prioridad, así que en producción no hace falta archivo.
//
// Las variables se leen y validan una vez al arrancar, no cada vez que se usan:
// si falta alguna o viene mal, el proceso muere en el arranque con un mensaje
// claro, en vez de fallar más tarde en mitad de una petición.
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),

  // Obligatoria y sin valor por defecto: un servicio con superficie de
  // administración no debe arrancar en un estado ambiguo, y un valor por
  // defecto sería una clave que conoce todo el que lea el repositorio.
  ADMIN_KEY: z.string().min(16, 'ADMIN_KEY debe tener al menos 16 caracteres'),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('Variables de entorno inválidas:')
  console.error(z.prettifyError(parsed.error))
  process.exit(1)
}

export const env = parsed.data
