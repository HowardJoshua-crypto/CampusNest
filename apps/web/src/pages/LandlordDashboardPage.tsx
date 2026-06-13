import { useState } from 'react'
import { Home, Eye, MessageSquare, Star, Plus, CheckCircle, Clock, XCircle, TrendingUp, Edit2, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const myListings = [
  {
    id: '1',
    title: 'Modern Studio Near University Gate',
    area: 'Westbrook',
    price: 650,
    status: 'active',
    views: 142,
    enquiries: 8,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Cosy 1-Bed in Northgate',
    area: 'Northgate',
    price: 520,
    status: 'pending',
    views: 34,
    enquiries: 2,
    rating: null,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Spacious Room – Shared House',
    area: 'Eastside',
    price: 380,
    status: 'let',
    views: 219,
    enquiries: 15,
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&auto=format&fit=crop',
  },
]

const enquiries = [
  { id: '1', student: 'Amara Bello', listing: 'Modern Studio Near University Gate', message: 'Is the studio still available from September?', time: '2h ago', status: 'new' },
  { id: '2', student: 'Tom Kowalski', listing: 'Modern Studio Near University Gate', message: 'Can I arrange a viewing this week?', time: '5h ago', status: 'replied' },
  { id: '3', student: 'Lily Chen', listing: 'Cosy 1-Bed in Northgate', message: 'What utilities are included in the rent?', time: '1d ago', status: 'new' },
]

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  let: { label: 'Let Agreed', color: 'bg-gray-100 text-gray-600', icon: XCircle },
}

export default function LandlordDashboardPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'listings' | 'enquiries'>('listings')

  const activeCount = myListings.filter(l => l.status === 'active').length
  const totalViews = myListings.reduce((s, l) => s + l.views, 0)
  const totalEnquiries = myListings.reduce((s, l) => s + l.enquiries, 0)
  const newEnquiries = enquiries.filter(e => e.status === 'new').length

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Landlord Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.name}</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          Add Listing
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Listings', value: activeCount, icon: Home, color: 'bg-blue-100 text-blue-600' },
          { label: 'Total Views', value: totalViews, icon: Eye, color: 'bg-purple-100 text-purple-600' },
          { label: 'Total Enquiries', value: totalEnquiries, icon: MessageSquare, color: 'bg-green-100 text-green-600' },
          { label: 'New Enquiries', value: newEnquiries, icon: TrendingUp, color: 'bg-orange-100 text-orange-600' },
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

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {(['listings', 'enquiries'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            {tab === 'enquiries' && newEnquiries > 0 && (
              <span className="ml-1.5 bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5">{newEnquiries}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'listings' && (
        <div className="space-y-4">
          {myListings.map(listing => {
            const sc = statusConfig[listing.status as keyof typeof statusConfig]
            return (
              <div key={listing.id} className="bg-white border border-gray-200 rounded-xl p-5 flex gap-4 items-start">
                <img src={listing.image} alt={listing.title} className="w-24 h-20 object-cover rounded-xl shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{listing.title}</h3>
                    <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${sc.color}`}>
                      <sc.icon className="h-3 w-3" />
                      {sc.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{listing.area} · £{listing.price}/mo</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{listing.views} views</span>
                    <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{listing.enquiries} enquiries</span>
                    {listing.rating && <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-400" />{listing.rating}</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'enquiries' && (
        <div className="space-y-3">
          {enquiries.map(e => (
            <div key={e.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{e.student}</p>
                  <p className="text-xs text-gray-400">{e.listing}</p>
                </div>
                <div className="flex items-center gap-2">
                  {e.status === 'new' && (
                    <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">New</span>
                  )}
                  <span className="text-xs text-gray-400">{e.time}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{e.message}</p>
              <button className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                Reply
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
