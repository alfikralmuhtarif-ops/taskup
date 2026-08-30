import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { getToken, setToken as persistToken } from './api'

interface AuthContextValue {
  token: string | null
  isAdmin: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/// Access tokens last 15 minutes (Jwt:AccessTokenMinutes) — ProtectedLayout only checked
/// "is a token present", never whether it had expired, so an old token from a previous
/// session still passed the client-side gate and only failed once the API call it made
/// came back 401, surfacing as a bare "Unauthorized" string instead of the login screen.
function decodeToken(token: string): { isAdmin: boolean; isExpired: boolean } {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    const isAdmin = payload.is_admin === 'true' || payload.is_admin === true
    const isExpired = typeof payload.exp === 'number' && Date.now() >= payload.exp * 1000
    return { isAdmin, isExpired }
  } catch {
    return { isAdmin: false, isExpired: true }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken())

  const login = (newToken: string) => {
    persistToken(newToken)
    setTokenState(newToken)
  }

  const logout = () => {
    persistToken(null)
    setTokenState(null)
  }

  const isAdmin = useMemo(() => {
    if (!token) return false
    const { isAdmin, isExpired } = decodeToken(token)
    return isAdmin && !isExpired
  }, [token])

  return <AuthContext.Provider value={{ token, isAdmin, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
