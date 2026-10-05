import { useCallback, useEffect, useState } from 'react'
import { readStatus, type GatewayStatus } from '../merchant/gateway'

// Consulta el estado de la pasarela al montar, y de nuevo cada vez que se
// reintenta.
//
// Arranca en 'checking' para que la pantalla no parpadee entre "todo bien" y
// "servicio caído" mientras llega la respuesta. El efecto solo escribe el
// estado al resolverse la promesa; volver a 'checking' ocurre en el evento que
// lo provoca, no dentro del efecto.
export function useGatewayStatus() {
  const [status, setStatus] = useState<GatewayStatus | 'checking'>('checking')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false

    readStatus().then((next) => {
      if (!cancelled) setStatus(next)
    })

    return () => {
      cancelled = true
    }
  }, [attempt])

  const retry = useCallback(() => {
    setStatus('checking')
    setAttempt((count) => count + 1)
  }, [])

  return { status, retry, isOperational: status === 'operational' }
}
