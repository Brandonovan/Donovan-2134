import { useCallback, useState } from 'react'
import { readUserList, saveUserList } from '../storage/userStorage'

// Estado de React sincronizado con una lista de userStorage.
//
// `keep` es un filtro opcional que se aplica al cargar: los registros que no lo
// pasen se descartan y la lista se guarda ya podada. Sirve para limpiar datos
// que quedaron inservibles por un cambio de formato.
export function useStoredList(key, keep) {
  const [list, setList] = useState(() => {
    const stored = readUserList(key)
    if (!keep) return stored

    const kept = stored.filter(keep)
    if (kept.length !== stored.length) saveUserList(key, kept)
    return kept
  })

  const update = useCallback(
    (next) => {
      setList(next)
      saveUserList(key, next)
    },
    [key],
  )

  return [list, update]
}
