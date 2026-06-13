import { User, Mail, Phone, MapPin, Star, Heart, Bell } from 'lucide-react'
import { mockListings } from '../data/mockData'
import ListingCard from '../components/ListingCard'

const saved = mockListings.filter(l => ['1', '3'].includes(l.id))

export default function ProfilePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Alex Johnson</h2>
            <p className="text-sm text-gray-500 mb-1">Student · Year 2</p>
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">Verified Student</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                a.johnson@university.ac.uk
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                +44 7700 900123
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                Currently in Westbrook
              </div>
            </div>
            <button className="mt-4 w-full border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Edit Profile
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">Saved Listings</h2>
              <span className="ml-auto bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">{saved.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {saved.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-900">My Reviews</h2>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800 text-sm">Modern Studio Near University Gate</span>
                <div className="flex items-center gap-0.5 text-yellow-400">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-3.5 w-3.5 fill-yellow-400" />)}
                </div>
              </div>
              <p className="text-gray-600 text-sm">Fantastic location, very clean and the landlord is responsive.</p>
              <p className="text-gray-400 text-xs mt-2">Posted 10 Apr 2026</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            </div>
            <div className="space-y-2">
              {[
                { msg: 'Your listing enquiry to James Okafor was read', time: '2h ago' },
                { msg: 'New listing available in Westbrook matching your search', time: '1d ago' },
                { msg: 'Rent trend report for May 2026 is ready', time: '3d ago' },
              ].map((n, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-700">{n.msg}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
