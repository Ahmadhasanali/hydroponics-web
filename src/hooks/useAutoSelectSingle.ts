import { useEffect, useRef } from 'react'

function isEmptyValue(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

export function useAutoSelectSingle<T>(
  items: T[] | undefined,
  currentValue: unknown,
  select: (item: T) => void,
) {
  const didAutoSelect = useRef(false)

  useEffect(() => {
    if (didAutoSelect.current) return
    if (!items || items.length !== 1) return
    if (!isEmptyValue(currentValue)) return
    didAutoSelect.current = true
    select(items[0])
  }, [items, currentValue, select])
}
