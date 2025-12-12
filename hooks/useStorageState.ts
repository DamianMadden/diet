import * as SecureStore from 'expo-secure-store'
import { useCallback, useEffect, useReducer } from 'react'

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void]

function useAsyncState<T>(initialValue: [boolean, T | null] = [true, null]): UseStateHook<T> {
  return useReducer(
    (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
    initialValue
  ) as UseStateHook<T>
}

export async function setStorageItemAsync(key: string, value: string | null) {
  if (value == null) {
    await SecureStore.deleteItemAsync(key)
  } else {
    await SecureStore.setItemAsync(key, value)
  }
}

export function useStorageState<T>(key: string): UseStateHook<T> {
  // Public
  const [state, setState] = useAsyncState<T>()

  // Get
  useEffect(() => {
    SecureStore.getItemAsync(key).then((value) => {
      setState(JSON.parse(value))
    })
  }, [key])

  // Set
  const setValue = useCallback(
    (value: T | null) => {
      setState(value)
      setStorageItemAsync(key, JSON.stringify(value))
    },
    [key]
  )

  return [state, setValue]
}
