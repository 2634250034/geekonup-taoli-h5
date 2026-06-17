const SHARE_TOKEN_STORAGE_KEY = 'taoli:h5:share-token'

function getSessionStorage() {
  return typeof window === 'undefined' ? null : window.sessionStorage
}

export function getQueryString(value: unknown) {
  if (Array.isArray(value)) return String(value[0] ?? '').trim()

  return String(value ?? '').trim()
}

export function saveShareToken(token: string) {
  if (!token) return

  getSessionStorage()?.setItem(SHARE_TOKEN_STORAGE_KEY, token)
}

export function getSavedShareToken() {
  return getSessionStorage()?.getItem(SHARE_TOKEN_STORAGE_KEY) ?? ''
}

export function getShareToken(value: unknown) {
  const token = getQueryString(value)

  if (token) {
    saveShareToken(token)
    return token
  }

  return getSavedShareToken()
}
