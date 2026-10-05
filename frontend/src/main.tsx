import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/app/App'
import '@/styles/variables.css'
import '@/styles/global.css'

// El elemento existe en index.html; el ! lo afirma en vez de envolver el
// arranque entero en una comprobacion que nunca se cumpliria al reves.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
