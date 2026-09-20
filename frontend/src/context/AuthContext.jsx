import { createContext, useContext, useCallback, useState } from 'react'
import * as api from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [username, setUsername] = useState(() => localStorage.getItem('username'))
  const [user, setUser] = useState(null)

  const login = useCallback(async (credentials) => {
    const data = await api.login(credentials)
    localStorage.setItem('token', data.token)
    localStorage.setItem('username', data.username)
    setToken(data.token)
    setUsername(data.username)
    return data
  }, [])

  const logout = useCallback(async () => {
    const currentToken = localStorage.getItem('token')
    if (currentToken) {
      try {
        await api.logout(currentToken)
      } catch {
        // Backend logout is best-effort; local state must always be cleared.
      }
    }
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setToken(null)
    setUsername(null)
    setUser(null)
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setToken(null)
    setUsername(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, username, user, setUser, login, logout, clearSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}