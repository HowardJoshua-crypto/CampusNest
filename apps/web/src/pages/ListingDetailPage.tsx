import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, MapPin, ShieldCheck, Bed, Bath, Wifi, Car, TreePine, MessageSquare } from 'lucide-react'
import { mockListings, mockReviews } from '../data/mockData'

export default function ListingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const listing = mockListings.find(l => l.id === id)
  const reviews = mockReviews.filter(r => r.listingId === id)

  if (!listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-500">
        <p className="text-lg font-medium">Listing not found</p>
        <button onClick={() => navigate('/search')} className="mt-4 text-blue-600 hover:underline text-sm">Back to search</button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden mb-6 h-72">
            <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
          </div>

          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
            {listing.verified && (
              <span className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap">
                <ShieldCheck className="h-3.5 w-3.5" />
                University Verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
            <MapPin className="h-4 w-4" />
            {listing.address} · {listing.distance} mi to campus
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
            <span className="flex items-center gap-1"><Bed className="h-4 w-4" />{listing.bedrooms} bedroom{listing.bedrooms > 1 ? 's' : ''}</span>
            <span className="flex items-center gap-1"><Bath className="h-4 w-4" />{listing.bathrooms} bathroom{listing.bathrooms > 1 ? 's' : ''}</span>
            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">{listing.type}</span>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {listing.amenities.map(a => (
                <span key={a} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{a}</span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm">No reviews yet for this listing.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800 text-sm">{review.author}</span>
                      <div className="flex items-center gap-1 text-yellow-500">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                    <p className="text-gray-400 text-xs mt-2">{review.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">£{listing.price}</span>
              <span className="text-gray-500 text-sm"> / month</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-yellow-600 mb-4">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-800">{listing.rating}</span>
              <span className="text-gray-400">({listing.reviewCount} reviews)</span>
            </div>
            <div className="border-t border-gray-100 pt-4 mb-4">
              <p className="text-xs text-gray-500 mb-1">Listed by</p>
              <p className="text-sm font-medium text-gray-800">{listing.landlord}</p>
            </div>
            {listing.available ? (
              <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors mb-3 flex items-center justify-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Contact Landlord
              </button>
            ) : (
              <button disabled className="w-full bg-gray-200 text-gray-400 font-semibold py-3 rounded-xl cursor-not-allowed mb-3">
                Currently Let
              </button>
            )}
            <button className="w-full border border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm">
              Save to Favourites
            </button>
            <p className="text-xs text-gray-400 text-center mt-4">Report an issue with this listing</p>
          </div>
        </div>
      </div>
    </div>
  )
}
