import { createBrowserClient } from '@supabase/ssr'

const REMEMBER_ME_KEY = 'app_remember_me'

/**
 * Set the "Remember Me" preference.
 * When true  → Supabase stores session in localStorage  (persists across browser restarts)
 * When false → Supabase stores session in sessionStorage (cleared when browser closes)
 */
export function setRememberMe(value: boolean) {
  // We always write this flag to localStorage so we can read it on next visit
  localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(value))
}

export function getRememberMe(): boolean {
  try {
    return JSON.parse(localStorage.getItem(REMEMBER_ME_KEY) ?? 'false')
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
      // Check both storages – the token may exist in either one
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
