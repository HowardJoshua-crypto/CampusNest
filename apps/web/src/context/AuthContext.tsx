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
  loginWithData: (authUser: AuthUser) => void
  logout: () => void
  updateUser: (partial: Partial<Pick<AuthUser, 'name'>>) => void
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

  const persist = (u: AuthUser) => {
    setUser(u)
    localStorage.setItem('campus_housing_user', JSON.stringify(u))
  }

  const login = async (email: string, password: string, role: UserRole) => {
    const { token, user: u } = await api.auth.login(email, password, role)
    persist({ id: u.id, name: u.name, email: u.email, role: u.role as UserRole, token })
  }

  const loginWithData = (authUser: AuthUser) => {
    persist(authUser)
  }

  const updateUser = (partial: Partial<Pick<AuthUser, 'name'>>) => {
    if (!user) return
    const updated = { ...user, ...partial }
    persist(updated)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('campus_housing_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, loginWithData, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
