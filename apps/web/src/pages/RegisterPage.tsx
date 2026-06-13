import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Building2, Eye, EyeOff, GraduationCap, Home,
  LayoutDashboard, AlertCircle, CheckCircle2, ArrowLeft
} from 'lucide-react'
import { useAuth, UserRole } from '../context/AuthContext'
import { api } from '../api/client'

const EMAIL_RULES: Record<UserRole, { domain: string; label: string }> = {
  student: { domain: '@student.university.ac.uk', label: 'Student email required' },
  admin:   { domain: '@university.ac.uk',         label: 'University staff email required' },
  landlord:{ domain: '',                           label: 'Any email accepted' },
}

const ROLES: { value: UserRole; label: string; icon: typeof Home; color: string }[] = [
  { value: 'student',  label: 'Student',  icon: GraduationCap,   color: 'blue'   },
  { value: 'landlord', label: 'Landlord', icon: Home,            color: 'green'  },
  { value: 'admin',    label: 'Admin',    icon: LayoutDashboard, color: 'purple' },
]

const colorMap = {
  blue:   { border: 'border-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-700',   icon: 'text-blue-600'   },
  green:  { border: 'border-green-500',  bg: 'bg-green-50',  text: 'text-green-700',  icon: 'text-green-600'  },
  purple: { border: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-600' },
}

export default function RegisterPage() {
  const { loginWithData } = useAuth()
  const navigate = useNavigate()

  const [role, setRole] = useState<UserRole>('student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Role-specific fields
  const [course, setCourse] = useState('')
  const [year, setYear] = useState('1')
  const [budgetMin, setBudgetMin] = useState('300')
  const [budgetMax, setBudgetMax] = useState('700')
  const [companyName, setCompanyName] = useState('')
  const [bio, setBio] = useState('')

  const rule = EMAIL_RULES[role]
  const colors = colorMap[ROLES.find(r => r.value === role)!.color as keyof typeof colorMap]

  const emailValid = !rule.domain || email.toLowerCase().endsWith(rule.domain)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!emailValid) {
      setError(`${rule.label}: email must end with ${rule.domain}`)
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const payload: Record<string, unknown> = { email, password, name, role, phone }
      if (role === 'student') {
        payload.course = course
        payload.year_of_study = parseInt(year)
        payload.budget_min = parseInt(budgetMin)
        payload.budget_max = parseInt(budgetMax)
      } else if (role === 'landlord') {
        payload.company_name = companyName
        payload.bio = bio
      }

      const { token, user } = await api.auth.register(payload)
      loginWithData({ id: user.id, name: user.name, email: user.email, role: user.role as UserRole, token })

      if (role === 'admin') navigate('/admin')
      else if (role === 'landlord') navigate('/landlord')
      else navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="h-8 w-8 text-white" />
            <span className="text-2xl font-bold text-white">CampusHome</span>
          </div>
          <p className="text-blue-200 text-sm">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-2 mb-5">
            <Link to="/login" className="text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Create account</h1>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {ROLES.map(r => {
              const c = colorMap[r.color as keyof typeof colorMap]
              const active = role === r.value
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => { setRole(r.value); setError('') }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all ${
                    active ? `${c.border} ${c.bg} ${c.text}` : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <r.icon className={`h-5 w-5 ${active ? c.icon : 'text-gray-400'}`} />
                  <span className="text-xs font-semibold">{r.label}</span>
                </button>
              )
            })}
          </div>

          {/* Email domain notice */}
          <div className={`rounded-xl px-3 py-2.5 mb-5 text-xs flex items-center gap-2 ${colors.bg} ${colors.text}`}>
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            {rule.domain
              ? <span>Requires a <strong>{rule.domain}</strong> email address</span>
              : <span>Any email address accepted</span>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Full name */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full name</label>
              <input
                type="text" required value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email address</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder={rule.domain ? `name${rule.domain}` : 'you@example.com'}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  email && !emailValid ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {email && !emailValid && (
                <p className="text-xs text-red-600 mt-1">Must end with <code>{rule.domain}</code></p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone <span className="text-gray-400">(optional)</span></label>
              <input
                type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+44 7700 900000"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Role-specific fields */}
            {role === 'student' && (
              <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-blue-700">Student details</p>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Course / Programme</label>
                  <input
                    type="text" value={course} onChange={e => setCourse(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
                    <select value={year} onChange={e => setYear(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Min budget (£)</label>
                    <input type="number" value={budgetMin} onChange={e => setBudgetMin(e.target.value)} min="0"
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Max budget (£)</label>
                    <input type="number" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} min="0"
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            )}

            {role === 'landlord' && (
              <div className="bg-green-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-green-700">Landlord details</p>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Company name <span className="text-gray-400">(optional)</span></label>
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                    placeholder="e.g. Smith Properties Ltd"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Short bio <span className="text-gray-400">(optional)</span></label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2}
                    placeholder="Tell students a bit about yourself and your properties..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-11"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Confirm password</label>
              <input
                type={showPw ? 'text' : 'password'} required value={confirm}
                onChange={e => setConfirm(e.target.value)} placeholder="Repeat your password"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  confirm && confirm !== password ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 text-xs px-3 py-2.5 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading || !emailValid}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
