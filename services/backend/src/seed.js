require('dotenv').config()
const bcrypt = require('bcryptjs')
const db = require('./db')

const users = [
  {
    email: 'admin@university.ac.uk', password: 'admin123',
    name: 'Dr. Margaret Cole', role: 'admin',
    profile: { department: 'Student Housing Office', can_verify_listings: true, can_manage_users: true },
  },
  {
    email: 'student@university.ac.uk', password: 'student123',
    name: 'Alex Johnson', role: 'student',
    profile: { student_number: 'S20240012', year_of_study: 2, course: 'Computer Science', budget_min: 400, budget_max: 750, preferred_area: 'Westbrook' },
  },
  {
    email: 'student2@university.ac.uk', password: 'student123',
    name: 'Amara Bello', role: 'student',
    profile: { student_number: 'S20240089', year_of_study: 1, course: 'Medicine', budget_min: 300, budget_max: 650, preferred_area: 'Central' },
  },
  {
    email: 'landlord@housing.com', password: 'landlord123',
    name: 'James Okafor', role: 'landlord',
    profile: { company_name: null, bio: 'Independent landlord with 8 years of experience renting to students.', verified_landlord: true },
  },
  {
    email: 'priya@housing.com', password: 'landlord123',
    name: 'Priya Sharma', role: 'landlord',
    profile: { company_name: 'Sharma Properties Ltd', bio: 'Family-run property business managing 12 student houses.', verified_landlord: true },
  },
  {
    email: 'chen@housing.com', password: 'landlord123',
    name: 'Chen Wei', role: 'landlord',
    profile: { company_name: 'CW Lettings', bio: 'Premium managed apartments for postgraduate students.', verified_landlord: true },
  },
]

const listings = [
  {
    title: 'Modern Studio Near University Gate', address: '14 Oak Lane, Westbrook',
    area: 'Westbrook', price: 650, bedrooms: 1, bathrooms: 1, type: 'Studio',
    distance: 0.3, verified: true, available: true,
    amenities: ['WiFi', 'Laundry', 'Furnished', 'Bills Included'],
    image_url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop',
    description: 'A bright, modern studio apartment just 5 minutes walk from the main university gate.',
    landlord_email: 'landlord@housing.com',
  },
  {
    title: 'Shared House – 4 Beds Available', address: '22 Birch Street, Northgate',
    area: 'Northgate', price: 420, bedrooms: 4, bathrooms: 2, type: 'House Share',
    distance: 0.7, verified: true, available: true,
    amenities: ['WiFi', 'Garden', 'Parking', 'Dishwasher'],
    image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&auto=format&fit=crop',
    description: 'Spacious shared house in a popular student area. Large garden and off-street parking.',
    landlord_email: 'priya@housing.com',
  },
  {
    title: '1-Bed Apartment with City View', address: '8 Elm Road, Southfield',
    area: 'Southfield', price: 780, bedrooms: 1, bathrooms: 1, type: 'Apartment',
    distance: 1.2, verified: true, available: true,
    amenities: ['WiFi', 'Gym', 'Concierge', 'Bills Included'],
    image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop',
    description: 'Stunning city view apartment with building gym and 24h concierge.',
    landlord_email: 'chen@housing.com',
  },
  {
    title: 'Budget-Friendly Room in Student Area', address: '5 Maple Close, Eastside',
    area: 'Eastside', price: 340, bedrooms: 1, bathrooms: 1, type: 'Room',
    distance: 1.5, verified: false, available: true,
    amenities: ['WiFi', 'Shared Kitchen'],
    image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop',
    description: 'Affordable room in a lively student area. Shared kitchen and common areas.',
    landlord_email: 'landlord@housing.com',
  },
  {
    title: 'Cosy 2-Bed Flat, 5 mins to Campus', address: '31 Cedar Avenue, Westbrook',
    area: 'Westbrook', price: 580, bedrooms: 2, bathrooms: 1, type: 'Apartment',
    distance: 0.5, verified: true, available: true,
    amenities: ['WiFi', 'Furnished', 'Pets Allowed'],
    image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop',
    description: 'Comfortable flat for two students. Pet-friendly and fully furnished.',
    landlord_email: 'priya@housing.com',
  },
  {
    title: 'Luxury En-Suite in Managed Block', address: '100 University Boulevard, Central',
    area: 'Central', price: 890, bedrooms: 1, bathrooms: 1, type: 'Studio',
    distance: 0.1, verified: true, available: false,
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
    await db.query('DELETE FROM students')
    await db.query('DELETE FROM landlords')
    await db.query('DELETE FROM admins')
    await db.query('DELETE FROM users')
    for (const seq of ['users', 'listings', 'reviews', 'messages', 'complaints']) {
      await db.query(`ALTER SEQUENCE ${seq}_id_seq RESTART WITH 1`)
    }

    const userIds = {}
    for (const u of users) {
      const hash = await bcrypt.hash(u.password, 10)
      const { rows } = await db.query(
        'INSERT INTO users (email, password_hash, name, role) VALUES ($1,$2,$3,$4) RETURNING id',
        [u.email, hash, u.name, u.role]
      )
      const uid = rows[0].id
      userIds[u.email] = uid

      if (u.role === 'student') {
        const p = u.profile
        await db.query(
          `INSERT INTO students (user_id, student_number, year_of_study, course, budget_min, budget_max, preferred_area)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [uid, p.student_number, p.year_of_study, p.course, p.budget_min, p.budget_max, p.preferred_area]
        )
      } else if (u.role === 'landlord') {
        const p = u.profile
        await db.query(
          `INSERT INTO landlords (user_id, company_name, bio, verified_landlord)
           VALUES ($1,$2,$3,$4)`,
          [uid, p.company_name, p.bio, p.verified_landlord]
        )
      } else if (u.role === 'admin') {
        const p = u.profile
        await db.query(
          `INSERT INTO admins (user_id, department, can_verify_listings, can_manage_users)
           VALUES ($1,$2,$3,$4)`,
          [uid, p.department, p.can_verify_listings, p.can_manage_users]
        )
      }
      console.log(`  ${u.role}: ${u.email} (id=${uid})`)
    }

    const listingIds = []
    for (const l of listings) {
      const { rows } = await db.query(
        `INSERT INTO listings (title,address,area,price,bedrooms,bathrooms,type,distance,verified,available,amenities,image_url,description,landlord_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
        [l.title, l.address, l.area, l.price, l.bedrooms, l.bathrooms, l.type, l.distance,
         l.verified, l.available, l.amenities, l.image_url, l.description, userIds[l.landlord_email]]
      )
      listingIds.push(rows[0].id)
      console.log(`  Listing: ${l.title} (id=${rows[0].id})`)
    }

    const s1 = userIds['student@university.ac.uk']
    const s2 = userIds['student2@university.ac.uk']
    await db.query('INSERT INTO reviews (listing_id,student_id,rating,comment) VALUES ($1,$2,$3,$4)', [listingIds[0], s1, 5, 'Fantastic location, very clean and the landlord is responsive.'])
    await db.query('INSERT INTO reviews (listing_id,student_id,rating,comment) VALUES ($1,$2,$3,$4)', [listingIds[1], s1, 4, 'Great housemates vibe, well maintained house.'])
    await db.query('INSERT INTO reviews (listing_id,student_id,rating,comment) VALUES ($1,$2,$3,$4)', [listingIds[0], s2, 5, 'Perfect for a first year. Very close to campus and the landlord is great.'])

    await db.query('INSERT INTO saved_listings (student_id,listing_id) VALUES ($1,$2)', [s1, listingIds[0]])
    await db.query('INSERT INTO saved_listings (student_id,listing_id) VALUES ($1,$2)', [s1, listingIds[2]])

    const l1 = userIds['landlord@housing.com']
    await db.query('INSERT INTO messages (sender_id,receiver_id,listing_id,content) VALUES ($1,$2,$3,$4)', [s1, l1, listingIds[0], 'Hi, is the studio still available for September?'])
    await db.query('INSERT INTO messages (sender_id,receiver_id,listing_id,content) VALUES ($1,$2,$3,$4)', [l1, s1, listingIds[0], 'Hi! Yes it is still available. Would you like to arrange a viewing?'])

    await db.query(
      "INSERT INTO complaints (listing_id,student_id,type,description,status) VALUES ($1,$2,$3,$4,$5)",
      [listingIds[0], s1, 'Maintenance', 'Boiler was slow to be fixed after reporting.', 'resolved']
    )
    await db.query(
      "INSERT INTO complaints (listing_id,student_id,type,description,status) VALUES ($1,$2,$3,$4,$5)",
      [listingIds[3], s2, 'Safety', 'Front door lock was broken for two weeks.', 'open']
    )

    console.log('\nSeed complete!')
    process.exit(0)
  } catch (err) {
    console.error('Seed failed:', err)
    process.exit(1)
  }
}

seed()
