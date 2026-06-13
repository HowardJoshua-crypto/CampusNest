require('dotenv').config()
const bcrypt = require('bcryptjs')
const db = require('./db')

const users = [
  { email: 'admin@university.ac.uk', password: 'admin123', name: 'Dr. Margaret Cole', role: 'admin' },
  { email: 'student@university.ac.uk', password: 'student123', name: 'Alex Johnson', role: 'student' },
  { email: 'landlord@housing.com', password: 'landlord123', name: 'James Okafor', role: 'landlord' },
  { email: 'priya@housing.com', password: 'landlord123', name: 'Priya Sharma', role: 'landlord' },
  { email: 'chen@housing.com', password: 'landlord123', name: 'Chen Wei', role: 'landlord' },
]

const listings = [
  {
    title: 'Modern Studio Near University Gate',
    address: '14 Oak Lane, Westbrook',
    area: 'Westbrook', price: 650, bedrooms: 1, bathrooms: 1,
    type: 'Studio', distance: 0.3, verified: true, available: true,
    amenities: ['WiFi', 'Laundry', 'Furnished', 'Bills Included'],
    image_url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop',
    description: 'A bright, modern studio apartment just 5 minutes walk from the main university gate.',
    landlord_email: 'landlord@housing.com',
  },
  {
    title: 'Shared House – 4 Beds Available',
    address: '22 Birch Street, Northgate',
    area: 'Northgate', price: 420, bedrooms: 4, bathrooms: 2,
    type: 'House Share', distance: 0.7, verified: true, available: true,
    amenities: ['WiFi', 'Garden', 'Parking', 'Dishwasher'],
    image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&auto=format&fit=crop',
    description: 'Spacious shared house in a popular student area. Large garden and off-street parking.',
    landlord_email: 'priya@housing.com',
  },
  {
    title: '1-Bed Apartment with City View',
    address: '8 Elm Road, Southfield',
    area: 'Southfield', price: 780, bedrooms: 1, bathrooms: 1,
    type: 'Apartment', distance: 1.2, verified: true, available: true,
    amenities: ['WiFi', 'Gym', 'Concierge', 'Bills Included'],
    image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop',
    description: 'Stunning city view apartment with access to building gym and 24h concierge.',
    landlord_email: 'chen@housing.com',
  },
  {
    title: 'Budget-Friendly Room in Student Area',
    address: '5 Maple Close, Eastside',
    area: 'Eastside', price: 340, bedrooms: 1, bathrooms: 1,
    type: 'Room', distance: 1.5, verified: false, available: true,
    amenities: ['WiFi', 'Shared Kitchen'],
    image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop',
    description: 'Affordable room in a lively student area. Shared kitchen and common areas.',
    landlord_email: 'landlord@housing.com',
  },
  {
    title: 'Cosy 2-Bed Flat, 5 mins to Campus',
    address: '31 Cedar Avenue, Westbrook',
    area: 'Westbrook', price: 580, bedrooms: 2, bathrooms: 1,
    type: 'Apartment', distance: 0.5, verified: true, available: true,
    amenities: ['WiFi', 'Furnished', 'Pets Allowed'],
    image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop',
    description: 'Comfortable flat for two students. Pet-friendly and fully furnished.',
    landlord_email: 'priya@housing.com',
  },
  {
    title: 'Luxury En-Suite in Managed Block',
    address: '100 University Boulevard, Central',
    area: 'Central', price: 890, bedrooms: 1, bathrooms: 1,
    type: 'Studio', distance: 0.1, verified: true, available: false,
    amenities: ['WiFi', 'Gym', 'Security', 'Bills Included', 'Furnished'],
    image_url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&auto=format&fit=crop',
    description: 'Premium managed block right on campus. 24h security and on-site gym.',
    landlord_email: 'chen@housing.com',
  },
]

async function seed() {
  console.log('Seeding database...')
  try {
    await db.query('DELETE FROM saved_listings')
    await db.query('DELETE FROM complaints')
    await db.query('DELETE FROM messages')
    await db.query('DELETE FROM reviews')
    await db.query('DELETE FROM listings')
    await db.query('DELETE FROM users')
    await db.query('ALTER SEQUENCE users_id_seq RESTART WITH 1')
    await db.query('ALTER SEQUENCE listings_id_seq RESTART WITH 1')
    await db.query('ALTER SEQUENCE reviews_id_seq RESTART WITH 1')
    await db.query('ALTER SEQUENCE messages_id_seq RESTART WITH 1')

    const userIds = {}
    for (const u of users) {
      const hash = await bcrypt.hash(u.password, 10)
      const r = await db.query(
        'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [u.email, hash, u.name, u.role]
      )
      userIds[u.email] = r.rows[0].id
      console.log(`  User: ${u.email} (id=${r.rows[0].id})`)
    }

    const listingIds = []
    for (const l of listings) {
      const landlordId = userIds[l.landlord_email]
      const r = await db.query(
        `INSERT INTO listings (title, address, area, price, bedrooms, bathrooms, type, distance, verified, available, amenities, image_url, description, landlord_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
        [l.title, l.address, l.area, l.price, l.bedrooms, l.bathrooms, l.type, l.distance, l.verified, l.available, l.amenities, l.image_url, l.description, landlordId]
      )
      listingIds.push(r.rows[0].id)
      console.log(`  Listing: ${l.title} (id=${r.rows[0].id})`)
    }

    const studentId = userIds['student@university.ac.uk']
    await db.query(
      'INSERT INTO reviews (listing_id, student_id, rating, comment) VALUES ($1, $2, $3, $4)',
      [listingIds[0], studentId, 5, 'Fantastic location, very clean and the landlord is responsive.']
    )
    await db.query(
      'INSERT INTO reviews (listing_id, student_id, rating, comment) VALUES ($1, $2, $3, $4)',
      [listingIds[1], studentId, 4, 'Great housemates vibe, well maintained house.']
    )

    const landlordId = userIds['landlord@housing.com']
    await db.query(
      'INSERT INTO messages (sender_id, receiver_id, listing_id, content) VALUES ($1,$2,$3,$4)',
      [studentId, landlordId, listingIds[0], 'Hi, is the studio still available for September?']
    )
    await db.query(
      'INSERT INTO messages (sender_id, receiver_id, listing_id, content) VALUES ($1,$2,$3,$4)',
      [landlordId, studentId, listingIds[0], 'Hi! Yes it is available. Would you like to arrange a viewing?']
    )

    await db.query(
      "INSERT INTO complaints (listing_id, student_id, type, description, status) VALUES ($1,$2,$3,$4,$5)",
      [listingIds[0], studentId, 'Maintenance', 'Boiler was slow to be fixed after reporting.', 'resolved']
    )

    console.log('Seed complete!')
    process.exit(0)
  } catch (err) {
    console.error('Seed failed:', err)
    process.exit(1)
  }
}

seed()
