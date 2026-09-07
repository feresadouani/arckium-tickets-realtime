/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authApi } from '../services/api'
import { mapUserFromBackend } from '../utils/mappers'

const AuthContext = createContext(null)

const ROLE_REDIRECTS = {
  admin: '/dashboard',
  manager: '/dashboard',
  technician: '/my-dashboard',
  operator: '/tickets',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)

  const applyProfile = useCallback((profile) => {
    const userData = mapUserFromBackend(profile)
    setUser(userData)
    localStorage.setItem('arckium_user', JSON.stringify(userData))
    return userData
  }, [])

  const checkSetupStatus = useCallback(async () => {
    try {
      const { needsSetup: setupRequired } = await authApi.setupStatus()
      setNeedsSetup(setupRequired)
      return setupRequired
    } catch {
      setNeedsSetup(false)
      return false
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      const setupRequired = await checkSetupStatus()
      if (setupRequired) {
        setLoading(false)
        return
      }
      try {
        const profile = await authApi.me()
        applyProfile(profile)
      } catch {
        setUser(null)
        localStorage.removeItem('arckium_user')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [applyProfile, checkSetupStatus])

  const login = useCallback(async (email, password) => {
    try {
      await authApi.login(email, password)
      const profile = await authApi.me()
      const userData = applyProfile(profile)
      setNeedsSetup(false)

      return { success: true, redirect: ROLE_REDIRECTS[userData.role] ?? '/tickets' }
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Invalid email or password',
      }
    }
  }, [applyProfile])

  const setupAdmin = useCallback(async (data) => {
    try {
      await authApi.setup(data)
      const profile = await authApi.me()
      const userData = applyProfile(profile)
      setNeedsSetup(false)

      return { success: true, redirect: ROLE_REDIRECTS[userData.role] ?? '/dashboard' }
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Setup failed',
      }
    }
  }, [applyProfile])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore network errors on logout
    }
    setUser(null)
    localStorage.removeItem('arckium_user')
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, login, logout, setupAdmin, needsSetup, loading, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
