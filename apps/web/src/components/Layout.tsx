import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Home, Search, MessageSquare, User, LayoutDashboard, Building2, LogOut, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700' },
  student: { label: 'Student', color: 'bg-green-100 text-green-700' },
  landlord: { label: 'Landlord', color: 'bg-blue-100 text-blue-700' },
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const badge = user ? ROLE_BADGE[user.role] : null

  const studentLinks = (
    <>
      <NavLink to="/" end className={({ isActive }) => linkClass(isActive)}>Home</NavLink>
      <NavLink to="/search" className={({ isActive }) => linkClass(isActive)}>Search</NavLink>
      <NavLink to="/messages" className={({ isActive }) => linkClass(isActive)}>Messages</NavLink>
    </>
  )

  const landlordLinks = (
    <>
      <NavLink to="/landlord" className={({ isActive }) => linkClass(isActive)}>My Listings</NavLink>
      <NavLink to="/messages" className={({ isActive }) => linkClass(isActive)}>Enquiries</NavLink>
    </>
  )

  const adminLinks = (
    <>
      <NavLink to="/admin" className={({ isActive }) => linkClass(isActive)}>
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </NavLink>
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <NavLink to="/" className="flex items-center gap-2">
              <Building2 className="h-7 w-7 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">CampusHome</span>
            </NavLink>

            <nav className="hidden md:flex items-center gap-1">
              {user?.role === 'student' && studentLinks}
              {user?.role === 'landlord' && landlordLinks}
              {user?.role === 'admin' && adminLinks}
            </nav>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 leading-none">{user?.name?.split(' ')[0]}</p>
                  {badge && (
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <NavLink
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full"
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    My Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">CampusHome</span>
            </div>
            <p className="text-xs text-gray-400">University-Integrated Student Housing Platform · © 2026</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function linkClass(isActive: boolean) {
  return `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
  }`
}
