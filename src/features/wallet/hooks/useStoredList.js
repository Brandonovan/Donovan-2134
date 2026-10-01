import { useCallback, useState } from 'react'
import { readUserList, saveUserList } from '../storage/userStorage'

// Estado de React sincronizado con una lista de userStorage.
export function useStoredList(key) {
  const [list, setList] = useState(() => readUserList(key))

  const update = useCallback(
    (next) => {
      setList(next)
      saveUserList(key, next)
    },
    [key],
  )

  return [list, update]
}
