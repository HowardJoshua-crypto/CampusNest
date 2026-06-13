import { useNavigate } from 'react-router-dom'
import { Search, ShieldCheck, BarChart3, MessageSquare, Star, MapPin } from 'lucide-react'
import { mockListings } from '../data/mockData'
import ListingCard from '../components/ListingCard'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div>
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Find Verified Student Housing Near Campus
          </h1>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
            An official university-linked platform connecting students with trusted landlords and giving administrators residential insights for welfare and planning.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search by area, street, or postcode..."
              className="flex-1 px-5 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              onClick={() => navigate('/search')}
              className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2 justify-center"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">University Verified</h3>
              <p className="text-gray-500 text-sm">Every listing is reviewed and approved by our admin team before going live. No scams, no hidden surprises.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Reviews</h3>
              <p className="text-gray-500 text-sm">Real reviews from fellow students who have lived there. Know what you're getting before you move in.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Residential Insights</h3>
              <p className="text-gray-500 text-sm">University administrators get area-level data on student housing trends to support welfare and planning decisions.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Listings</h2>
            <button
              onClick={() => navigate('/search')}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              View all →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockListings.slice(0, 3).map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Browse by Area</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['Westbrook', 'Northgate', 'Southfield', 'Eastside', 'Central'].map(area => (
              <button
                key={area}
                onClick={() => navigate(`/search?area=${area}`)}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors group"
              >
                <MapPin className="h-6 w-6 text-gray-400 group-hover:text-blue-500 mb-2" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{area}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-blue-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <MessageSquare className="h-10 w-10 mx-auto mb-4 text-blue-300" />
          <h2 className="text-2xl font-bold mb-3">Are you a landlord?</h2>
          <p className="text-blue-200 mb-6">List your property on the official university housing platform and reach verified student tenants directly.</p>
          <button className="bg-white text-blue-900 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors">
            Submit a Listing
          </button>
        </div>
      </section>
    </div>
  )
}
