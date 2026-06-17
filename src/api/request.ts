type QueryValue = string | number | boolean | null | undefined
type QueryParams = Record<string, QueryValue | QueryValue[]>

interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  params?: QueryParams
}

interface PostOptions extends RequestOptions {
  data?: unknown
}

const apiBaseURL = import.meta.env.VITE_APP_BASE_URL ?? ''

function joinURL(baseURL: string, url: string) {
  if (!baseURL) return url
  if (/^https?:\/\//i.test(url)) return url

  return `${baseURL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
}

function buildURL(url: string, params?: QueryParams) {
  const requestURL = new URL(joinURL(apiBaseURL, url), window.location.origin)

  Object.entries(params ?? {}).forEach(([key, value]) => {
    const values = Array.isArray(value) ? value : [value]

    values.forEach((item) => {
      if (item === null || item === undefined || item === '') return
      requestURL.searchParams.append(key, String(item))
    })
  })

  if (/^https?:\/\//i.test(joinURL(apiBaseURL, url))) return requestURL.toString()

  return `${requestURL.pathname}${requestURL.search}${requestURL.hash}`
}

async function request<T>(
  url: string,
  options: RequestOptions & { data?: unknown; method: 'GET' | 'POST' },
) {
  const { data, headers, method, params, ...restOptions } = options
  const response = await fetch(buildURL(url, params), {
    ...restOptions,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function get<T>(url: string, options: RequestOptions = {}) {
  return request<T>(url, { ...options, method: 'GET' })
}

export function post<T>(url: string, options: PostOptions = {}) {
  return request<T>(url, { ...options, method: 'POST' })
}
