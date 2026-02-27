import { createBrowserClient } from '@supabase/ssr'

const REMEMBER_ME_KEY = 'app_remember_me_data'

interface RememberMeData {
  enabled: boolean
  expiresAt: number | null
}

/**
 * Set the "Remember Me" preference.
 * When true  → Supabase stores session in localStorage + expires at 90 days
 * When false → Supabase stores session in sessionStorage
 */
export function setRememberMe(value: boolean) {
  let expiresAt = null
  if (value) {
    expiresAt = Date.now() + 90 * 24 * 60 * 60 * 1000 // 90 days from now
  }

  const data: RememberMeData = { enabled: value, expiresAt }
  localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(data))
}

export function getRememberMe(): boolean {
  try {
    // support backward compatibility with old key
    const oldRawData = localStorage.getItem('app_remember_me')
    if (oldRawData) {
      if (oldRawData === 'true') {
        localStorage.removeItem('app_remember_me')
        setRememberMe(true)
        return true
      }
      if (oldRawData === 'false') {
        localStorage.removeItem('app_remember_me')
        setRememberMe(false)
        return false
      }
    }

    const rawData = localStorage.getItem(REMEMBER_ME_KEY)
    if (!rawData) return false

    const parsed = JSON.parse(rawData) as RememberMeData

    if (parsed.enabled && parsed.expiresAt) {
      if (Date.now() > parsed.expiresAt) {
        // Token has expired
        clearRememberMe()
        return false
      }
    }

    return true
  } catch {
    return false
  }
}

/**
 * Clears Remember-Me flag and any session data from both storages.
 * Called on explicit sign-out so the next visit starts clean.
 */
export function clearRememberMe() {
  localStorage.removeItem(REMEMBER_ME_KEY)
  localStorage.removeItem('app_remember_me')
}

/**
 * Custom storage adapter that delegates to either localStorage or sessionStorage
 * based on the "Remember Me" flag. Implements the Web Storage API interface
 * expected by Supabase's auth.storage option.
 */
function createDualStorage() {
  const resolveStorage = (): Storage =>
    getRememberMe() ? localStorage : sessionStorage

  return {
    getItem: (key: string): string | null => {
      // If remember me is false or expired, ONLY check sessionStorage
      // We don't want to accidentally resurrect an expired token from localStorage
      if (!getRememberMe()) {
        return sessionStorage.getItem(key)
      }
      return localStorage.getItem(key) ?? sessionStorage.getItem(key)
    },
    setItem: (key: string, value: string): void => {
      const target = resolveStorage()
      target.setItem(key, value)
      // Remove from the *other* storage to keep things clean
      const other = target === localStorage ? sessionStorage : localStorage
      other.removeItem(key)
    },
    removeItem: (key: string): void => {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    },
  }
}

// We disable singleton so that auth.storage is always respected
// when the remember-me preference changes.
export function createClient() {
  return createBrowserClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!,
    {
      isSingleton: false,
      auth: {
        storage: createDualStorage(),
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  )
}
