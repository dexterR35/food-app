import { useCallback, useRef } from 'react'

export function useDebouncedAction(action, waitMs = 500) {
  const lastRunRef = useRef(0)

  return useCallback((...args) => {
    const now = Date.now()
    if (now - lastRunRef.current < waitMs) return
    lastRunRef.current = now
    return action(...args)
  }, [action, waitMs])
}
