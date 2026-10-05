import { useCallback, useState } from 'react'
import { readUserList, saveUserList } from '../storage/userStorage'

// Estado de React sincronizado con una lista de userStorage.
//
// `keep` es un filtro opcional que se aplica al cargar: los registros que no lo
// pasen se descartan y la lista se guarda ya podada. Sirve para limpiar datos
// que quedaron inservibles por un cambio de formato.
export function useStoredList<T>(
  key: string,
  keep?: (item: T) => boolean,
): [T[], (next: T[]) => void] {
  const [list, setList] = useState<T[]>(() => {
    const stored = readUserList<T>(key)
    if (!keep) return stored

    const kept = stored.filter(keep)
    if (kept.length !== stored.length) saveUserList<T>(key, kept)
    return kept
  })

  const update = useCallback(
    (next: T[]) => {
      setList(next)
      saveUserList<T>(key, next)
    },
    [key],
  )

  return [list, update]
}
