import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { mockListings } from '../data/mockData'
import ListingCard from '../components/ListingCard'

const areas = ['All Areas', 'Westbrook', 'Northgate', 'Southfield', 'Eastside', 'Central']
const types = ['All Types', 'Studio', 'Room', 'Apartment', 'House Share']

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [selectedArea, setSelectedArea] = useState(searchParams.get('area') || 'All Areas')
  const [selectedType, setSelectedType] = useState('All Types')
  const [maxPrice, setMaxPrice] = useState(1000)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const area = searchParams.get('area')
    if (area) setSelectedArea(area)
  }, [searchParams])

  const filtered = mockListings.filter(l => {
    if (query && !l.title.toLowerCase().includes(query.toLowerCase()) && !l.area.toLowerCase().includes(query.toLowerCase())) return false
    if (selectedArea !== 'All Areas' && l.area !== selectedArea) return false
    if (selectedType !== 'All Types' && l.type !== selectedType) return false
    if (l.price > maxPrice) return false
    if (verifiedOnly && !l.verified) return false
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Search Student Housing</h1>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search listings..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Area</label>
              <select
                value={selectedArea}
                onChange={e => setSelectedArea(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {areas.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Property Type</label>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {types.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max Price: £{maxPrice}/mo</label>
              <input
                type="range"
                min={200}
                max={1200}
                step={50}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="verified"
                checked={verifiedOnly}
                onChange={e => setVerifiedOnly(e.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />
              <label htmlFor="verified" className="text-sm text-gray-700">Verified only</label>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {selectedArea !== 'All Areas' && (
          <span className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
            {selectedArea}
            <button onClick={() => setSelectedArea('All Areas')}><X className="h-3 w-3" /></button>
          </span>
        )}
        {selectedType !== 'All Types' && (
          <span className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
            {selectedType}
            <button onClick={() => setSelectedType('All Types')}><X className="h-3 w-3" /></button>
          </span>
        )}
        {verifiedOnly && (
          <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
            Verified Only
            <button onClick={() => setVerifiedOnly(false)}><X className="h-3 w-3" /></button>
          </span>
        )}
        <p className="text-sm text-gray-500 ml-auto">{filtered.length} listing{filtered.length !== 1 ? 's' : ''} found</p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">No listings match your filters</p>
          <p className="text-sm mt-1">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}
