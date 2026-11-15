import { useEffect, useState } from 'react'

type State<T> =
  | { status: 'loading'; data: null }
  | { status: 'error'; data: null }
  | { status: 'ready'; data: T }

export function useAsync<T>(load: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<State<T>>({ status: 'loading', data: null })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading', data: null })
    load().then(
      (data) => {
        if (!cancelled) setState({ status: 'ready', data })
      },
      () => {
        if (!cancelled) setState({ status: 'error', data: null })
      },
    )
    return () => {
      cancelled = true
    }
  }, [...deps, tick])

  return { ...state, reload: () => setTick((t) => t + 1) }
}
