import { useState, useEffect, useCallback, type ReactNode } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import {
  Users, Home, AlertTriangle, TrendingUp, CheckCircle2,
  Flag, Trash2, MessageSquare, ShieldCheck, ShieldOff,
  Eye, Search, X, Send
} from 'lucide-react'
import { api } from '../api/client'
import type { AdminStats, AreaStat, Listing, Complaint, StudentRecord, LandlordRecord } from '../api/client'

const PIE_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6']
const TABS = ['Overview', 'Listings', 'Landlords', 'Students', 'Complaints'] as const
type Tab = typeof TABS[number]

// ── small helpers ──────────────────────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>
}

function Spinner() {
  return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
}

// ── Modal wrapper ──────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>('Overview')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [areaStats, setAreaStats] = useState<AreaStat[]>([])
  const [listings, setListings] = useState<(Listing & { flagged?: boolean; flag_reason?: string; landlord_user_id?: number; landlord_email?: string })[]>([])
  const [landlords, setLandlords] = useState<LandlordRecord[]>([])
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modal states
  const [flagTarget, setFlagTarget] = useState<{ id: number; title: string } | null>(null)
  const [flagReason, setFlagReason] = useState('')
  const [flagLoading, setFlagLoading] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<{ id: number; title: string } | null>(null)
  const [removeLoading, setRemoveLoading] = useState(false)
  const [msgTarget, setMsgTarget] = useState<{ landlordId: number; name: string; listingId?: number; listingTitle?: string } | null>(null)
  const [msgContent, setMsgContent] = useState('')
  const [msgLoading, setMsgLoading] = useState(false)
  const [msgSent, setMsgSent] = useState(false)
  const [actionError, setActionError] = useState('')

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [s, a, l, la, st, co] = await Promise.all([
        api.admin.stats(),
        api.admin.areaStats(),
        api.admin.listings(),
        api.admin.landlords(),
        api.admin.students(),
        api.admin.complaints(),
      ])
      setStats(s); setAreaStats(a); setListings(l as typeof listings)
      setLandlords(la); setStudents(st); setComplaints(co)
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // ── Listing actions ──────────────────────────────────────────────────────────
  const handleVerify = async (id: number, verified: boolean) => {
    setActionError('')
    try {
      await api.admin.verifyListing(id, verified)
      setListings(prev => prev.map(l => l.id === id ? { ...l, verified } : l))
    } catch { setActionError('Failed to update listing') }
  }

  const handleFlag = async () => {
    if (!flagTarget) return
    setFlagLoading(true); setActionError('')
    try {
      await api.admin.flagListing(flagTarget.id, true, flagReason)
      setListings(prev => prev.map(l => l.id === flagTarget.id ? { ...l, flagged: true, flag_reason: flagReason } : l))
      setFlagTarget(null); setFlagReason('')
    } catch { setActionError('Failed to flag listing') }
    setFlagLoading(false)
  }

  const handleUnflag = async (id: number) => {
    setActionError('')
    try {
      await api.admin.flagListing(id, false, '')
      setListings(prev => prev.map(l => l.id === id ? { ...l, flagged: false, flag_reason: undefined } : l))
    } catch { setActionError('Failed to unflag listing') }
  }

  const handleRemove = async () => {
    if (!removeTarget) return
    setRemoveLoading(true); setActionError('')
    try {
      await api.admin.removeListing(removeTarget.id)
      setListings(prev => prev.filter(l => l.id !== removeTarget.id))
      setStats(prev => prev ? { ...prev, active_listings: Math.max(0, prev.active_listings - 1) } : prev)
      setRemoveTarget(null)
    } catch { setActionError('Failed to remove listing') }
    setRemoveLoading(false)
  }

  const handleSendMessage = async () => {
    if (!msgTarget || !msgContent.trim()) return
    setMsgLoading(true); setActionError('')
    try {
      await api.admin.messageLandlord(msgTarget.landlordId, msgContent, msgTarget.listingId)
      setMsgSent(true); setMsgContent('')
    } catch { setActionError('Failed to send message') }
    setMsgLoading(false)
  }

  const openMessage = (landlordId: number, name: string, listingId?: number, listingTitle?: string) => {
    setMsgTarget({ landlordId, name, listingId, listingTitle })
    setMsgContent(''); setMsgSent(false); setActionError('')
  }

  const handleVerifyLandlord = async (userId: number, verified: boolean) => {
    try {
      await api.admin.verifyLandlord(userId, verified)
      setLandlords(prev => prev.map(l => l.id === userId ? { ...l, verified_landlord: verified } : l))
    } catch { setActionError('Failed to update landlord') }
  }

  // ── Filtered search ──────────────────────────────────────────────────────────
  const filteredListings = listings.filter(l =>
    !search || l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.area.toLowerCase().includes(search.toLowerCase()) ||
    (l.landlord_name || '').toLowerCase().includes(search.toLowerCase())
  )

  const complaintBreakdown = complaints.reduce<Record<string, number>>((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1; return acc
  }, {})
  const pieData = Object.entries(complaintBreakdown).map(([name, value]) => ({ name, value }))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">University housing administration · Full control panel</p>
      </div>

      {actionError && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {actionError}
          <button onClick={() => setActionError('')} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
            {t === 'Listings' && listings.filter(l => l.flagged).length > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {listings.filter(l => l.flagged).length}
              </span>
            )}
            {t === 'Complaints' && complaints.filter(c => c.status === 'open').length > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {complaints.filter(c => c.status === 'open').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'Overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Total Students', value: stats?.total_students ?? '—', icon: Users, color: 'bg-blue-100 text-blue-600' },
              { label: 'Active Listings', value: stats?.active_listings ?? '—', icon: Home, color: 'bg-green-100 text-green-600' },
              { label: 'Open Complaints', value: stats?.open_complaints ?? '—', icon: AlertTriangle, color: 'bg-amber-100 text-amber-600' },
              { label: 'Avg. Monthly Rent', value: stats ? `£${stats.avg_rent}` : '—', icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
              { label: 'Flagged Listings', value: (stats as (AdminStats & { flagged_listings?: number }) | null)?.flagged_listings ?? 0, icon: Flag, color: 'bg-red-100 text-red-600' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-500">{s.label}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                    <s.icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Listings &amp; Incidents per Area</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={areaStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="area" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="listing_count" name="Listings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="incidents" name="Incidents" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Complaints by Type</h2>
              {pieData.length === 0 ? (
                <p className="text-gray-400 text-sm text-center mt-10">No complaints yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name }) => name}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Area Summary</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Area', 'Listings', 'Avg Rent', 'Incidents'].map(h => (
                        <th key={h} className={`py-2 text-xs text-gray-400 font-medium ${h === 'Area' ? 'text-left' : 'text-right'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {areaStats.map(a => (
                      <tr key={a.area} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2.5 font-medium text-gray-800">{a.area}</td>
                        <td className="py-2.5 text-right text-gray-600">{a.listing_count}</td>
                        <td className="py-2.5 text-right text-gray-600">£{a.avg_rent}</td>
                        <td className="py-2.5 text-right">
                          <Badge label={String(a.incidents)} color={a.incidents > 1 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── LISTINGS ── */}
      {tab === 'Listings' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search listings…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-xs text-gray-400">{filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Listing', 'Area', 'Price', 'Landlord', 'Status', 'Actions'].map(h => (
                    <th key={h} className={`px-4 py-3 text-xs font-medium text-gray-400 ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredListings.map(l => (
                  <tr key={l.id} className={`hover:bg-gray-50 ${l.flagged ? 'bg-red-50 hover:bg-red-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {l.image_url && <img src={l.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1 max-w-[200px]">{l.title}</p>
                          {l.flagged && (
                            <div className="flex items-center gap-1 text-red-600 text-xs mt-0.5">
                              <AlertTriangle className="h-3 w-3" />
                              <span className="truncate max-w-[180px]">{l.flag_reason || 'Flagged'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{l.area}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">£{l.price}/mo</td>
                    <td className="px-4 py-3">
                      <p className="text-gray-800">{l.landlord_name || '—'}</p>
                      {l.landlord_email && <p className="text-xs text-gray-400 truncate max-w-[140px]">{l.landlord_email}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Badge
                          label={l.verified ? 'Verified' : 'Pending'}
                          color={l.verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}
                        />
                        {l.flagged && <Badge label="Flagged" color="bg-red-100 text-red-700" />}
                        {!l.available && <Badge label="Unavailable" color="bg-gray-100 text-gray-400" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Verify toggle */}
                        <button
                          onClick={() => handleVerify(l.id, !l.verified)}
                          title={l.verified ? 'Unverify' : 'Verify listing'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            l.verified ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600'
                          }`}
                        >
                          {l.verified ? <CheckCircle2 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>

                        {/* Flag / unflag */}
                        {l.flagged ? (
                          <button
                            onClick={() => handleUnflag(l.id)}
                            title="Remove flag"
                            className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          >
                            <Flag className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => { setFlagTarget({ id: l.id, title: l.title }); setFlagReason('') }}
                            title="Flag as dangerous"
                            className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                          >
                            <Flag className="h-4 w-4" />
                          </button>
                        )}

                        {/* Message landlord */}
                        {l.landlord_user_id && (
                          <button
                            onClick={() => openMessage(l.landlord_user_id!, l.landlord_name || 'Landlord', l.id, l.title)}
                            title="Message landlord"
                            className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                        )}

                        {/* Remove */}
                        <button
                          onClick={() => setRemoveTarget({ id: l.id, title: l.title })}
                          title="Remove listing"
                          className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredListings.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-10">No listings found</p>
            )}
          </div>
        </div>
      )}

      {/* ── LANDLORDS ── */}
      {tab === 'Landlords' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Landlord', 'Email', 'Listings', 'Avg Rating', 'Status', 'Actions'].map(h => (
                    <th key={h} className={`px-4 py-3 text-xs font-medium text-gray-400 ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {landlords.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{l.name}</p>
                      {l.company_name && <p className="text-xs text-gray-400">{l.company_name}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{l.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-gray-800 font-medium">{l.listing_count ?? 0}</span>
                      {(l.flagged_listings as number | undefined) ? (
                        <span className="ml-1 text-xs text-red-600">({l.flagged_listings as number} flagged)</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {l.avg_rating ? (
                        <span className="text-amber-600 font-medium">★ {Number(l.avg_rating).toFixed(1)}</span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={l.verified_landlord ? 'Verified' : 'Unverified'}
                        color={l.verified_landlord ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleVerifyLandlord(l.id, !l.verified_landlord)}
                          title={l.verified_landlord ? 'Unverify landlord' : 'Verify landlord'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            l.verified_landlord
                              ? 'bg-green-50 text-green-600 hover:bg-red-50 hover:text-red-500'
                              : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600'
                          }`}
                        >
                          {l.verified_landlord ? <ShieldCheck className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => openMessage(l.id, l.name)}
                          title="Send message"
                          className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── STUDENTS ── */}
      {tab === 'Students' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Email', 'Course', 'Year', 'Budget', 'Saved', 'Reviews'].map(h => (
                    <th key={h} className={`px-4 py-3 text-xs font-medium text-gray-400 ${h === 'Name' ? 'text-left' : 'text-center'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{s.name}</p>
                      {s.student_number && <p className="text-xs text-gray-400 font-mono">{s.student_number}</p>}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 text-xs">{s.email}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{s.course || '—'}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{s.year_of_study ? `Year ${s.year_of_study}` : '—'}</td>
                    <td className="px-4 py-3 text-center text-gray-600 whitespace-nowrap">
                      {s.budget_min && s.budget_max ? `£${s.budget_min}–£${s.budget_max}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center"><Badge label={String(s.saved_count ?? 0)} color="bg-blue-50 text-blue-600" /></td>
                    <td className="px-4 py-3 text-center"><Badge label={String(s.review_count ?? 0)} color="bg-purple-50 text-purple-600" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {students.length === 0 && <p className="text-center text-gray-400 text-sm py-10">No students registered</p>}
          </div>
        </div>
      )}

      {/* ── COMPLAINTS ── */}
      {tab === 'Complaints' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Student', 'Listing', 'Type', 'Description', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-gray-400 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {complaints.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.student_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[160px]">
                      <p className="truncate">{c.listing_title || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={c.type}
                        color={c.type === 'Safety' ? 'bg-red-100 text-red-700' : c.type === 'Maintenance' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                      <p className="line-clamp-2 text-xs">{c.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={c.status}
                        color={c.status === 'open' ? 'bg-red-100 text-red-700' : c.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {complaints.length === 0 && <p className="text-center text-gray-400 text-sm py-10">No complaints filed</p>}
          </div>
        </div>
      )}

      {/* ── Flag modal ── */}
      {flagTarget && (
        <Modal title="Flag listing as dangerous" onClose={() => setFlagTarget(null)}>
          <p className="text-sm text-gray-600 mb-4">
            Flagging <strong>"{flagTarget.title}"</strong> will mark it as a safety concern. The landlord can be messaged separately.
          </p>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Reason for flagging</label>
          <textarea
            value={flagReason}
            onChange={e => setFlagReason(e.target.value)}
            rows={3}
            placeholder="e.g. Safety hazards reported by students, unresolved maintenance issues..."
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
          />
          <div className="flex gap-3 mt-4">
            <button onClick={() => setFlagTarget(null)} className="flex-1 border border-gray-300 text-gray-700 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleFlag}
              disabled={flagLoading || !flagReason.trim()}
              className="flex-1 bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {flagLoading ? <Spinner /> : <><Flag className="h-4 w-4" /> Flag listing</>}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Remove modal ── */}
      {removeTarget && (
        <Modal title="Remove listing" onClose={() => setRemoveTarget(null)}>
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">This action is permanent</p>
              <p className="text-sm text-gray-500 mt-1">
                <strong>"{removeTarget.title}"</strong> will be permanently removed from the platform, including all reviews and saved instances.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setRemoveTarget(null)} className="flex-1 border border-gray-300 text-gray-700 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleRemove}
              disabled={removeLoading}
              className="flex-1 bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {removeLoading ? <Spinner /> : <><Trash2 className="h-4 w-4" /> Remove permanently</>}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Message landlord modal ── */}
      {msgTarget && (
        <Modal title={`Message ${msgTarget.name}`} onClose={() => { setMsgTarget(null); setMsgSent(false) }}>
          {msgSent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-semibold text-gray-900">Message sent</p>
              <p className="text-sm text-gray-500 mt-1">
                {msgTarget.name} will see your message in their inbox.
              </p>
              <button
                onClick={() => { setMsgSent(false); setMsgContent('') }}
                className="mt-4 text-sm text-blue-600 hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <>
              {msgTarget.listingTitle && (
                <div className="bg-gray-50 rounded-lg px-3 py-2 mb-4 text-xs text-gray-500">
                  Re: <span className="font-medium text-gray-700">{msgTarget.listingTitle}</span>
                </div>
              )}
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Message</label>
              <textarea
                value={msgContent}
                onChange={e => setMsgContent(e.target.value)}
                rows={5}
                placeholder={`Write your message to ${msgTarget.name}...`}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setMsgTarget(null)} className="flex-1 border border-gray-300 text-gray-700 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={msgLoading || !msgContent.trim()}
                  className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                >
                  {msgLoading ? <Spinner /> : <><Send className="h-4 w-4" /> Send message</>}
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  )
}
