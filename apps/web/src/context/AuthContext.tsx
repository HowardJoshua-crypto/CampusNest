import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = 'admin' | 'student' | 'landlord'

export interface AuthUser {
  name: string
  email: string
  role: UserRole
  avatar?: string
}

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const MOCK_USERS: Record<string, { name: string; password: string; role: UserRole }> = {
  'admin@university.ac.uk': { name: 'Dr. Margaret Cole', password: 'admin123', role: 'admin' },
  'student@university.ac.uk': { name: 'Alex Johnson', password: 'student123', role: 'student' },
  'landlord@housing.com': { name: 'James Okafor', password: 'landlord123', role: 'landlord' },
}

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
    await new Promise(r => setTimeout(r, 600))
    const found = MOCK_USERS[email.toLowerCase()]
    if (!found || found.password !== password || found.role !== role) {
      throw new Error('Invalid credentials or role mismatch')
    }
    const authUser: AuthUser = { name: found.name, email, role: found.role }
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
