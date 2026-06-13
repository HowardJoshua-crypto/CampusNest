const BASE_URL = '/api'

function getToken(): string | null {
  const user = localStorage.getItem('campus_housing_user')
  if (!user) return null
  try {
    return JSON.parse(user).token || null
  } catch {
    return null
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`)
  return data
}

export const api = {
  auth: {
    login: (email: string, password: string, role: string) =>
      request<{ token: string; user: { id: number; email: string; name: string; role: string } }>(
        '/auth/login', { method: 'POST', body: JSON.stringify({ email, password, role }) }
      ),
    register: (data: { email: string; password: string; name: string; role: string; phone?: string }) =>
      request<{ token: string; user: { id: number; email: string; name: string; role: string } }>(
        '/auth/register', { method: 'POST', body: JSON.stringify(data) }
      ),
    me: () => request<{ id: number; email: string; name: string; role: string }>('/auth/me'),
  },

  listings: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : ''
      return request<Listing[]>(`/listings${qs}`)
    },
    get: (id: string | number) => request<Listing>(`/listings/${id}`),
    create: (data: Partial<Listing>) =>
      request<Listing>('/listings', { method: 'POST', body: JSON.stringify(data) }),
    verify: (id: number, verified: boolean) =>
      request<Listing>(`/listings/${id}/verify`, { method: 'PATCH', body: JSON.stringify({ verified }) }),
    delete: (id: number) =>
      request<{ message: string }>(`/listings/${id}`, { method: 'DELETE' }),
    my: () => request<Listing[]>('/listings/my'),
  },

  reviews: {
    forListing: (listingId: number) => request<Review[]>(`/reviews/listing/${listingId}`),
    submit: (data: { listing_id: number; rating: number; comment?: string }) =>
      request<Review>('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  },

  messages: {
    conversations: () => request<Conversation[]>('/messages/conversations'),
    thread: (partnerId: number) => request<Message[]>(`/messages/${partnerId}`),
    send: (data: { receiver_id: number; content: string; listing_id?: number }) =>
      request<Message>('/messages', { method: 'POST', body: JSON.stringify(data) }),
  },

  saved: {
    list: () => request<Listing[]>('/saved'),
    save: (listingId: number) => request<{ message: string }>(`/saved/${listingId}`, { method: 'POST' }),
    remove: (listingId: number) => request<{ message: string }>(`/saved/${listingId}`, { method: 'DELETE' }),
  },

  admin: {
    stats: () => request<AdminStats>('/admin/stats'),
    areaStats: () => request<AreaStat[]>('/admin/area-stats'),
    listings: () => request<Listing[]>('/admin/listings'),
    complaints: () => request<Complaint[]>('/admin/complaints'),
    users: () => request<User[]>('/admin/users'),
  },
}

export interface Listing {
  id: number
  title: string
  address: string
  area: string
  price: number
  bedrooms: number
  bathrooms: number
  type: string
  distance: number
  verified: boolean
  available: boolean
  amenities: string[]
  image_url: string | null
  description: string | null
  landlord_id: number | null
  landlord_name: string | null
  rating: number
  review_count: number
  created_at: string
}

export interface Review {
  id: number
  listing_id: number
  student_id: number
  rating: number
  comment: string | null
  author: string
  created_at: string
}

export interface Message {
  id: number
  sender_id: number
  receiver_id: number
  listing_id: number | null
  content: string
  read: boolean
  sender_name: string
  created_at: string
}

export interface Conversation {
  partner_id: number
  partner_name: string
  listing_id: number | null
  listing_title: string | null
  last_message: string
  last_time: string
  unread_count: number
}

export interface AdminStats {
  total_students: number
  active_listings: number
  open_complaints: number
  avg_rent: number
}

export interface AreaStat {
  area: string
  students: number
  avg_rent: number
  incidents: number
}

export interface Complaint {
  id: number
  listing_id: number | null
  student_id: number | null
  type: string
  description: string
  status: string
  student_name: string | null
  listing_title: string | null
  created_at: string
}

export interface User {
  id: number
  email: string
  name: string
  role: string
  created_at: string
}
