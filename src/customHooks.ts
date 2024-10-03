import {useEffect, useState} from 'react'

function useLocalStorage<T>(
  storageKey: string,
  fallbackState: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState(() => {
    const obj = localStorage.getItem(storageKey)
    return obj != null ? (JSON.parse(obj) ?? fallbackState) : fallbackState
  })

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(value))
  }, [value, storageKey])

  return [value, setValue]
}

export default useLocalStorage
