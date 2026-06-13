import { useNavigate } from 'react-router-dom'
import { Star, MapPin, ShieldCheck, Bed, Bath } from 'lucide-react'

interface Listing {
  id: string
  title: string
  address: string
  price: number
  bedrooms: number
  bathrooms: number
  area: string
  distance: number
  verified: boolean
  rating: number
  reviewCount: number
  image: string
  amenities: string[]
  landlord: string
  available: boolean
  type: string
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {!listing.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-red-600 px-3 py-1 rounded-full">Let Agreed</span>
          </div>
        )}
        {listing.verified && (
          <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            Verified
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
          {listing.type}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{listing.title}</h3>
        </div>
        <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
          <MapPin className="h-3 w-3" />
          <span>{listing.area} · {listing.distance} mi to campus</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600 text-xs mb-3">
          <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{listing.bedrooms} bed</span>
          <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{listing.bathrooms} bath</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">£{listing.price}<span className="text-xs font-normal text-gray-500">/mo</span></span>
          <div className="flex items-center gap-1 text-yellow-500 text-xs">
            <Star className="h-3 w-3 fill-yellow-400" />
            <span className="font-medium text-gray-700">{listing.rating}</span>
            <span className="text-gray-400">({listing.reviewCount})</span>
          </div>
        </div>
      </div>
    </div>
  )
}
