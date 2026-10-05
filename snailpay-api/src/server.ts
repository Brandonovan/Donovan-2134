import { createApp } from './app.js'
import { env } from './config/env.js'

createApp().listen(env.PORT, () => {
  console.log(`snailpay-api escuchando en http://localhost:${env.PORT}`)
})
