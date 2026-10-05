import { useCallback, useEffect, useState } from 'react'

type RequestState<T> = {
  data: T | undefined
  error: Error | null
  loading: boolean
}

type Updater<T> = T | undefined | ((current: T | undefined) => T | undefined)

// Ejecuta `request` (una función que devuelve una promesa) al montar y expone su estado.
// `request` debe ser estable (definida fuera del componente o memorizada).
export function useRequest<T>(request: () => Promise<T>) {
  const [state, setState] = useState<RequestState<T>>({
    data: undefined,
    error: null,
    loading: true,
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false
    request().then(
      (data) => !ignore && setState({ data, error: null, loading: false }),
      (error: unknown) =>
        !ignore &&
        setState({
          data: undefined,
          // Lo que rechaza una promesa puede ser cualquier cosa; quien lo
          // consume espera un Error con su `message`.
          error: error instanceof Error ? error : new Error(String(error)),
          loading: false,
        }),
    )
    return () => {
      ignore = true
    }
  }, [request, attempt])

  const retry = useCallback(() => {
    setState((current) => ({ ...current, error: null, loading: true }))
    setAttempt((count) => count + 1)
  }, [])

  // Para actualizar los datos localmente tras una mutación, sin volver a pedirlos.
  const setData = useCallback((updater: Updater<T>) => {
    setState((current) => ({
      ...current,
      data:
        typeof updater === 'function'
          ? (updater as (value: T | undefined) => T | undefined)(current.data)
          : updater,
    }))
  }, [])

  return { ...state, retry, setData }
}
