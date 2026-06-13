import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../api/client'

export type UserRole = 'admin' | 'student' | 'landlord'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: UserRole
  token: string
}

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('campus_housing_user')
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch {
        localStorage.removeItem('campus_housing_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: UserRole) => {
    const { token, user: u } = await api.auth.login(email, password, role)
    const authUser: AuthUser = { id: u.id, name: u.name, email: u.email, role: u.role as UserRole, token }
    setUser(authUser)
    localStorage.setItem('campus_housing_user', JSON.stringify(authUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('campus_housing_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
