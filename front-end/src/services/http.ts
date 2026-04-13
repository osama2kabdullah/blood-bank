/**
 * HTTP Client — Edge-compatible fetch wrapper
 * Designed for Cloudflare Workers edge endpoints
 */
import { env } from '@utils/env'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestOptions {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: unknown
  signal?: AbortSignal
  timeout?: number
  cache?: RequestCache
}

export interface ApiResponse<T> {
  data: T
  status: number
  headers: Headers
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

const DEFAULT_TIMEOUT = 15_000

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    signal,
    timeout = DEFAULT_TIMEOUT,
    cache = 'default',
  } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  const combinedSignal = signal ?? controller.signal

  const url = path.startsWith('http') ? path : `${env.apiBaseUrl}${path}`

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: combinedSignal,
      cache,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      let errorData: { message?: string } | null = null
      try { errorData = await response.json() } catch { errorData = null }
      const message = errorData?.message ?? `HTTP ${response.status}: ${response.statusText}`
      throw new HttpError(response.status, message, errorData)
    }

    const contentType = response.headers.get('content-type') ?? ''
    const data = contentType.includes('application/json')
      ? ((await response.json()) as T)
      : ((await response.text()) as unknown as T)

    return { data, status: response.status, headers: response.headers }
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof HttpError) throw err
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new HttpError(408, 'Request timed out')
    }
    throw new HttpError(0, 'Network error')
  }
}

export const http = {
  get: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(path, { ...opts, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(path, { ...opts, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(path, { ...opts, method: 'PATCH', body }),
  delete: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'DELETE' }),
}
