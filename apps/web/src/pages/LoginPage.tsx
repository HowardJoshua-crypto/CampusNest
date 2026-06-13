import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Eye, EyeOff, GraduationCap, LayoutDashboard, Home, AlertCircle } from 'lucide-react'
import { useAuth, UserRole } from '../context/AuthContext'

const ROLES: { value: UserRole; label: string; icon: typeof Home; description: string; hint: string }[] = [
  {
    value: 'student',
    label: 'Student',
    icon: GraduationCap,
    description: 'Browse and save verified housing listings',
    hint: 'student@university.ac.uk / student123',
  },
  {
    value: 'landlord',
    label: 'Landlord',
    icon: Home,
    description: 'Manage your property listings and enquiries',
    hint: 'landlord@housing.com / landlord123',
  },
  {
    value: 'admin',
    label: 'Admin',
    icon: LayoutDashboard,
    description: 'University administrator with full dashboard access',
    hint: 'admin@university.ac.uk / admin123',
  },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<UserRole>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedRole = ROLES.find(r => r.value === role)!

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password, role)
      if (role === 'admin') navigate('/admin')
      else if (role === 'landlord') navigate('/landlord')
      else navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = () => {
    setEmail(selectedRole.hint.split(' / ')[0])
    setPassword(selectedRole.hint.split(' / ')[1])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Building2 className="h-8 w-8 text-white" />
            <span className="text-2xl font-bold text-white">CampusHome</span>
          </div>
          <p className="text-blue-200 text-sm">University-Integrated Student Housing Platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Sign in to your account</h1>
          <p className="text-sm text-gray-500 mb-6">Choose your role to continue</p>

          <div className="grid grid-cols-3 gap-2 mb-6">
            {ROLES.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => { setRole(r.value); setError('') }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all ${
                  role === r.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <r.icon className={`h-5 w-5 ${role === r.value ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-xs font-semibold">{r.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-blue-50 rounded-xl p-3 mb-6 text-xs text-blue-700 flex items-start gap-2">
            <selectedRole.icon className="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />
            <span>{selectedRole.description}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={`e.g. ${selectedRole.hint.split(' / ')[0]}`}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 text-xs px-3 py-2.5 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : `Sign in as ${selectedRole.label}`}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-2">Demo credentials</p>
            <button
              type="button"
              onClick={fillDemo}
              className="w-full text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 py-2 rounded-lg transition-colors font-medium"
            >
              Fill {selectedRole.label} demo credentials
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-4">
            New to CampusHome?{' '}
            <a href="/register" className="text-blue-600 font-medium hover:underline">Create an account</a>
          </p>
        </div>
      </div>
    </div>
  )
}
