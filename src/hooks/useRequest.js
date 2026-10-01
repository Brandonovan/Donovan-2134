import { useCallback, useEffect, useState } from 'react'

// Ejecuta `request` (una función que devuelve una promesa) al montar y expone su estado.
// `request` debe ser estable (definida fuera del componente o memorizada).
export function useRequest(request) {
  const [state, setState] = useState({ data: undefined, error: null, loading: true })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false
    request().then(
      (data) => !ignore && setState({ data, error: null, loading: false }),
      (error) => !ignore && setState({ data: undefined, error, loading: false }),
    )
    return () => {
      ignore = true
    }
  }, [request, attempt])

  const retry = useCallback(() => {
    setState((current) => ({ ...current, error: null, loading: true }))
    setAttempt((count) => count + 1)
  }, [])

  return { ...state, retry }
}
