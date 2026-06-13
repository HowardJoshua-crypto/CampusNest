import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Home, Search, MessageSquare, User, LayoutDashboard, Building2 } from 'lucide-react'

export default function Layout() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

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
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/search"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                Search
              </NavLink>
              <NavLink
                to="/messages"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                Messages
              </NavLink>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                Admin
              </NavLink>
              <NavLink
                to="/profile"
                className="ml-2 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <User className="h-4 w-4" />
                Profile
              </NavLink>
            </nav>

            <div className="md:hidden flex items-center gap-1">
              <NavLink to="/" end className={({ isActive }) => `p-2 rounded-lg ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                <Home className="h-5 w-5" />
              </NavLink>
              <NavLink to="/search" className={({ isActive }) => `p-2 rounded-lg ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                <Search className="h-5 w-5" />
              </NavLink>
              <NavLink to="/messages" className={({ isActive }) => `p-2 rounded-lg ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                <MessageSquare className="h-5 w-5" />
              </NavLink>
              <NavLink to="/admin" className={({ isActive }) => `p-2 rounded-lg ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                <LayoutDashboard className="h-5 w-5" />
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => `p-2 rounded-lg ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                <User className="h-5 w-5" />
              </NavLink>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">CampusHome</span>
            </div>
            <p className="text-sm text-gray-500">University-Integrated Student Housing Platform</p>
            <p className="text-sm text-gray-400">© 2026 Campus Housing Intelligence System</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
