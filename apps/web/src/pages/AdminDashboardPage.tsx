import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'
import { Users, Home, AlertTriangle, TrendingUp } from 'lucide-react'
import { areaStats, rentTrends, complaintTypes } from '../data/mockData'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const stats = [
  { label: 'Total Students', value: '1,725', icon: Users, color: 'bg-blue-100 text-blue-600', change: '+12% this term' },
  { label: 'Active Listings', value: '284', icon: Home, color: 'bg-green-100 text-green-600', change: '+8 this week' },
  { label: 'Open Complaints', value: '19', icon: AlertTriangle, color: 'bg-red-100 text-red-600', change: '↓ 3 resolved' },
  { label: 'Avg. Monthly Rent', value: '£570', icon: TrendingUp, color: 'bg-purple-100 text-purple-600', change: '+£30 from last term' },
]

export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">University residential intelligence overview · Academic Year 2025/26</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">{s.label}</span>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Students per Area</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={areaStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="area" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Average Rent Trend (Jan–Jun 2026)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={rentTrends} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `£${v}`} />
              <Line type="monotone" dataKey="avgRent" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Complaints by Type</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={complaintTypes} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={70} label={({ type }) => type}>
                {complaintTypes.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Area Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs text-gray-400 font-medium">Area</th>
                  <th className="text-right py-2 text-xs text-gray-400 font-medium">Students</th>
                  <th className="text-right py-2 text-xs text-gray-400 font-medium">Avg Rent</th>
                  <th className="text-right py-2 text-xs text-gray-400 font-medium">Incidents</th>
                </tr>
              </thead>
              <tbody>
                {areaStats.map(a => (
                  <tr key={a.area} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 font-medium text-gray-800">{a.area}</td>
                    <td className="py-2.5 text-right text-gray-600">{a.students}</td>
                    <td className="py-2.5 text-right text-gray-600">£{a.avgRent}</td>
                    <td className="py-2.5 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.incidents > 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {a.incidents}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
