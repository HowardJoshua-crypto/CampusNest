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

async function upload<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE_URL}${path}`, { method: 'POST', headers, body: formData })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Upload failed: ${res.status}`)
  return data
}

export const api = {
  auth: {
    login: (email: string, password: string, role: string) =>
      request<{ token: string; user: User }>('/auth/login', {
        method: 'POST', body: JSON.stringify({ email, password, role }),
      }),
    register: (data: Record<string, unknown>) =>
      request<{ token: string; user: User }>('/auth/register', {
        method: 'POST', body: JSON.stringify(data),
      }),
    me: () => request<User & {
      course?: string; year_of_study?: number; budget_min?: number; budget_max?: number
      preferred_area?: string; student_number?: string; company_name?: string
      bio?: string; verified_landlord?: boolean; department?: string
      can_verify_listings?: boolean; avatar_url?: string | null
    }>('/auth/me'),
  },

  users: {
    uploadAvatar: (file: File) => {
      const fd = new FormData()
      fd.append('avatar', file)
      return upload<{ avatar_url: string }>('/users/avatar', fd)
    },
    updateProfile: (data: Record<string, unknown>) =>
      request<User>('/users/profile', { method: 'PATCH', body: JSON.stringify(data) }),
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
    my: () => request<(Review & { listing_title?: string })[]>('/reviews/my'),
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
    stats: () => request<AdminStats & { flagged_listings?: number }>('/admin/stats'),
    areaStats: () => request<AreaStat[]>('/admin/area-stats'),
    listings: () => request<Listing[]>('/admin/listings'),
    complaints: () => request<Complaint[]>('/admin/complaints'),
    students: () => request<StudentRecord[]>('/admin/students'),
    landlords: () => request<LandlordRecord[]>('/admin/landlords'),
    verifyListing: (id: number, verified: boolean) =>
      request<Listing>(`/admin/listings/${id}/verify`, {
        method: 'PATCH', body: JSON.stringify({ verified }),
      }),
    flagListing: (id: number, flagged: boolean, flag_reason?: string) =>
      request<Listing>(`/admin/listings/${id}/flag`, {
        method: 'PATCH', body: JSON.stringify({ flagged, flag_reason }),
      }),
    removeListing: (id: number) =>
      request<{ message: string }>(`/admin/listings/${id}`, { method: 'DELETE' }),
    verifyLandlord: (userId: number, verified: boolean) =>
      request<LandlordRecord>(`/admin/landlords/${userId}/verify`, {
        method: 'PATCH', body: JSON.stringify({ verified }),
      }),
    messageLandlord: (landlordId: number, content: string, listingId?: number) =>
      request<{ id: number }>('/admin/message-landlord', {
        method: 'POST', body: JSON.stringify({ landlord_id: landlordId, content, listing_id: listingId }),
      }),
  },
}

export interface User {
  id: number
  email: string
  name: string
  role: string
  phone?: string
  avatar_url?: string | null
  created_at?: string
}

export interface StudentRecord extends User {
  student_number?: string
  year_of_study?: number
  course?: string
  budget_min?: number
  budget_max?: number
  preferred_area?: string
  saved_count?: number
  review_count?: number
}

export interface LandlordRecord extends User {
  company_name?: string
  bio?: string
  verified_landlord?: boolean
  avg_response_hours?: number
  listing_count?: number
  verified_listings?: number
  avg_rating?: number
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
  listing_count: number
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
