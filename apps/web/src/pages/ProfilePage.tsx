import { useState, useEffect, useRef, ChangeEvent } from 'react'
import {
  User, Mail, Phone, MapPin, Star, Heart, Camera,
  Pencil, X, Check, GraduationCap, Home, Shield, BookOpen
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import type { Listing, Review } from '../api/client'

interface ProfileData {
  name: string
  phone: string
  avatar_url: string | null
  // student
  course?: string
  year_of_study?: number
  budget_min?: number
  budget_max?: number
  preferred_area?: string
  student_number?: string
  // landlord
  company_name?: string
  bio?: string
  verified_landlord?: boolean
  // admin
  department?: string
  can_verify_listings?: boolean
}

function Avatar({ url, name, size = 20 }: { url: string | null; name: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  if (url) {
    return (
      <img
        src={url} alt={name}
        className={`w-${size} h-${size} rounded-full object-cover border-4 border-white shadow`}
      />
    )
  }
  return (
    <div className={`w-${size} h-${size} rounded-full bg-blue-600 flex items-center justify-center border-4 border-white shadow`}>
      <span className="text-white font-bold text-xl">{initials}</span>
    </div>
  )
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [savedListings, setSavedListings] = useState<Listing[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [saveError, setSaveError] = useState('')

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editCourse, setEditCourse] = useState('')
  const [editYear, setEditYear] = useState('')
  const [editBudgetMin, setEditBudgetMin] = useState('')
  const [editBudgetMax, setEditBudgetMax] = useState('')
  const [editPreferredArea, setEditPreferredArea] = useState('')
  const [editCompany, setEditCompany] = useState('')
  const [editBio, setEditBio] = useState('')

  useEffect(() => {
    if (!user) return
    api.auth.me().then((me: unknown) => {
      const data = me as ProfileData & { name: string; phone: string; avatar_url: string | null }
      setProfile(data)
      setAvatarUrl(data.avatar_url)
    }).catch(console.error)

    if (user.role === 'student') {
      api.saved.list().then(setSavedListings).catch(() => {})
      api.reviews.my().then(setReviews).catch(() => {})
    }
  }, [user])

  const openEdit = () => {
    if (!profile) return
    setEditName(profile.name)
    setEditPhone(profile.phone || '')
    setEditCourse(profile.course || '')
    setEditYear(String(profile.year_of_study || 1))
    setEditBudgetMin(String(profile.budget_min || ''))
    setEditBudgetMax(String(profile.budget_max || ''))
    setEditPreferredArea(profile.preferred_area || '')
    setEditCompany(profile.company_name || '')
    setEditBio(profile.bio || '')
    setEditing(true)
    setSaveError('')
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setSaveError('')
    try {
      const payload: Record<string, unknown> = { name: editName, phone: editPhone }
      if (user.role === 'student') {
        payload.course = editCourse
        payload.year_of_study = parseInt(editYear)
        payload.budget_min = parseInt(editBudgetMin)
        payload.budget_max = parseInt(editBudgetMax)
        payload.preferred_area = editPreferredArea
      } else if (user.role === 'landlord') {
        payload.company_name = editCompany
        payload.bio = editBio
      }
      const updated = await api.users.updateProfile(payload)
      setProfile(prev => prev ? { ...prev, ...updated } : prev)
      updateUser({ name: updated.name })
      setEditing(false)
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const result = await api.users.uploadAvatar(file)
      setAvatarUrl(result.avatar_url)
      setProfile(prev => prev ? { ...prev, avatar_url: result.avatar_url } : prev)
    } catch (err) {
      console.error('Avatar upload failed', err)
    } finally {
      setUploadingAvatar(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const roleLabel = user.role === 'student'
    ? `Student${profile.year_of_study ? ` · Year ${profile.year_of_study}` : ''}`
    : user.role === 'landlord'
    ? profile.company_name || 'Landlord'
    : profile.department || 'Admin'

  const roleIcon = user.role === 'student'
    ? <GraduationCap className="h-4 w-4" />
    : user.role === 'landlord'
    ? <Home className="h-4 w-4" />
    : <Shield className="h-4 w-4" />

  const roleColor = user.role === 'student'
    ? 'bg-blue-100 text-blue-700'
    : user.role === 'landlord'
    ? 'bg-green-100 text-green-700'
    : 'bg-purple-100 text-purple-700'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-5">
          {/* Avatar card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
            <div className="relative inline-block mb-4">
              {avatarUrl ? (
                <img src={avatarUrl} alt={profile.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mx-auto" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center border-4 border-white shadow-md mx-auto">
                  <span className="text-white font-bold text-2xl">
                    {profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {uploadingAvatar
                  ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Camera className="h-3.5 w-3.5" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <h2 className="text-lg font-bold text-gray-900">{profile.name}</h2>
            <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full mt-1 mb-3 ${roleColor}`}>
              {roleIcon}
              {roleLabel}
            </div>

            {user.role === 'landlord' && profile.verified_landlord && (
              <div className="text-xs text-green-700 bg-green-50 rounded-full px-3 py-1 mb-2">
                ✓ Verified Landlord
              </div>
            )}

            <button
              onClick={openEdit}
              className="mt-2 w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Profile
            </button>
          </div>

          {/* Contact card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  {profile.phone}
                </div>
              )}
              {profile.preferred_area && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                  Looking in {profile.preferred_area}
                </div>
              )}
            </div>
          </div>

          {/* Role-specific info */}
          {user.role === 'student' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" /> Academic Info
              </h3>
              <div className="space-y-2 text-sm">
                {profile.course && <div><span className="text-gray-400">Course:</span> <span className="text-gray-700 font-medium">{profile.course}</span></div>}
                {profile.year_of_study && <div><span className="text-gray-400">Year:</span> <span className="text-gray-700 font-medium">Year {profile.year_of_study}</span></div>}
                {profile.student_number && <div><span className="text-gray-400">Student No:</span> <span className="text-gray-700 font-mono text-xs">{profile.student_number}</span></div>}
                {(profile.budget_min || profile.budget_max) && (
                  <div>
                    <span className="text-gray-400">Budget:</span>{' '}
                    <span className="text-gray-700 font-medium">£{profile.budget_min}–£{profile.budget_max}/mo</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {user.role === 'landlord' && profile.bio && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-800 mb-2">About</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-8">
          {user.role === 'student' && (
            <>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="h-5 w-5 text-red-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Saved Listings</h2>
                  <span className="ml-auto bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">{savedListings.length}</span>
                </div>
                {savedListings.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
                    No saved listings yet. Browse listings to save them here.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedListings.map(l => (
                      <div key={l.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                        {l.image_url && <img src={l.image_url} alt={l.title} className="w-full h-36 object-cover" />}
                        <div className="p-4">
                          <p className="font-semibold text-sm text-gray-900 truncate">{l.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{l.area} · £{l.price}/mo</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-lg font-semibold text-gray-900">My Reviews</h2>
                </div>
                {reviews.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
                    No reviews posted yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map(r => (
                      <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800 text-sm">{(r as Review & { listing_title?: string }).listing_title || 'Listing'}</span>
                          <div className="flex items-center gap-0.5 text-yellow-400">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} className={`h-3.5 w-3.5 ${i <= r.rating ? 'fill-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
                            ))}
                          </div>
                        </div>
                        {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
                        <p className="text-gray-400 text-xs mt-2">{new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {user.role === 'landlord' && (
            <div>
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500 text-sm">
                Manage your listings from the <a href="/landlord" className="text-blue-600 font-medium hover:underline">Landlord Dashboard</a>.
              </div>
            </div>
          )}

          {user.role === 'admin' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-500" /> Admin Permissions
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Department</span>
                  <span className="font-medium text-gray-800">{profile.department || '—'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Can verify listings</span>
                  <span className={`font-medium ${profile.can_verify_listings ? 'text-green-600' : 'text-red-500'}`}>
                    {profile.can_verify_listings ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
              <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full name</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)}
                  placeholder="+44 7700 900000"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {user.role === 'student' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Course</label>
                    <input type="text" value={editCourse} onChange={e => setEditCourse(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
                      <select value={editYear} onChange={e => setEditYear(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Min (£)</label>
                      <input type="number" value={editBudgetMin} onChange={e => setEditBudgetMin(e.target.value)} min="0"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Max (£)</label>
                      <input type="number" value={editBudgetMax} onChange={e => setEditBudgetMax(e.target.value)} min="0"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Preferred area</label>
                    <input type="text" value={editPreferredArea} onChange={e => setEditPreferredArea(e.target.value)}
                      placeholder="e.g. Westbrook"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </>
              )}

              {user.role === 'landlord' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Company name</label>
                    <input type="text" value={editCompany} onChange={e => setEditCompany(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Bio</label>
                    <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={3}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  </div>
                </>
              )}

              {saveError && (
                <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{saveError}</div>
              )}
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setEditing(false)}
                className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {saving
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Check className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
