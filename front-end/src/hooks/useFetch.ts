/**
 * useFetch — Smart data fetching with caching, dedup, and error handling
 * No external dependency — built on useEffect + useRef
 */
import { useState, useEffect, useRef, useCallback } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface FetchState<T> {
  data: T | undefined
  status: Status
  error: string | null
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
}

interface FetchOptions {
  /** Don't fetch on mount — call refetch() manually */
  manual?: boolean
  /** Re-fetch when window regains focus */
  refetchOnFocus?: boolean
  /** Stale-while-revalidate TTL in ms (0 = no cache) */
  cacheTtl?: number
  /** Deduplicate in-flight requests with same key */
  dedupe?: boolean
}

/* In-memory cache shared across all useFetch instances */
const cache = new Map<string, { data: unknown; expiresAt: number }>()
/* In-flight promise registry — deduplication */
const inFlight = new Map<string, Promise<unknown>>()

export function useFetch<T>(
  key: string,
  fetcher: () => Promise<{ data: T }>,
  options: FetchOptions = {},
) {
  const {
    manual = false,
    refetchOnFocus = false,
    cacheTtl = 60_000,
    dedupe = true,
  } = options

  const [state, setState] = useState<FetchState<T>>({
    data: undefined,
    status: 'idle',
    error: null,
    isLoading: !manual,
    isSuccess: false,
    isError: false,
  })

  const isMounted = useRef(true)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const execute = useCallback(async (force = false) => {
    /* Check cache */
    if (!force && cacheTtl > 0) {
      const cached = cache.get(key)
      if (cached && cached.expiresAt > Date.now()) {
        setState({
          data: cached.data as T,
          status: 'success',
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false,
        })
        return
      }
    }

    setState((s) => ({ ...s, status: 'loading', isLoading: true, error: null }))

    try {
      let promise: Promise<{ data: T }>

      if (dedupe && inFlight.has(key)) {
        promise = inFlight.get(key) as Promise<{ data: T }>
      } else {
        promise = fetcherRef.current()
        inFlight.set(key, promise as Promise<unknown>)
      }

      const { data } = await promise
      inFlight.delete(key)

      if (cacheTtl > 0) {
        cache.set(key, { data, expiresAt: Date.now() + cacheTtl })
      }

      if (!isMounted.current) return
      setState({ data, status: 'success', error: null, isLoading: false, isSuccess: true, isError: false })
    } catch (err) {
      inFlight.delete(key)
      if (!isMounted.current) return
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setState((s) => ({ ...s, status: 'error', error: msg, isLoading: false, isSuccess: false, isError: true }))
    }
  }, [key, cacheTtl, dedupe])

  useEffect(() => {
    isMounted.current = true
    if (!manual) execute()
    return () => { isMounted.current = false }
  }, [key, manual, execute])

  useEffect(() => {
    if (!refetchOnFocus) return
    const handler = () => execute()
    window.addEventListener('focus', handler)
    return () => window.removeEventListener('focus', handler)
  }, [refetchOnFocus, execute])

  const refetch = useCallback(() => execute(true), [execute])
  const invalidate = useCallback(() => { cache.delete(key) }, [key])

  return { ...state, refetch, invalidate }
}

export function invalidateCache(key?: string) {
  if (key) {
    cache.delete(key)
    inFlight.delete(key)
  } else {
    cache.clear()
    inFlight.clear()
  }
}

export function invalidateCacheByPrefix(prefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
  for (const key of inFlight.keys()) {
    if (key.startsWith(prefix)) inFlight.delete(key)
  }
}
