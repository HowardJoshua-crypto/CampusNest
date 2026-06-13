const express = require('express')
const { body, validationResult } = require('express-validator')
const db = require('../db')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { area, type, min_price, max_price, verified_only, search } = req.query
    let conditions = []
    let params = []
    let idx = 1

    if (verified_only === 'true' || !req.headers.authorization) {
      conditions.push(`l.verified = true`)
    }

    if (area && area !== 'All Areas') {
      conditions.push(`l.area = $${idx++}`)
      params.push(area)
    }
    if (type && type !== 'All Types') {
      conditions.push(`l.type = $${idx++}`)
      params.push(type)
    }
    if (min_price) {
      conditions.push(`l.price >= $${idx++}`)
      params.push(parseInt(min_price))
    }
    if (max_price) {
      conditions.push(`l.price <= $${idx++}`)
      params.push(parseInt(max_price))
    }
    if (search) {
      conditions.push(`(l.title ILIKE $${idx} OR l.area ILIKE $${idx} OR l.address ILIKE $${idx})`)
      params.push(`%${search}%`)
      idx++
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const result = await db.query(`
      SELECT l.*, u.name AS landlord_name,
             COALESCE(AVG(r.rating), 0) AS rating,
             COUNT(r.id) AS review_count
      FROM listings l
      LEFT JOIN users u ON l.landlord_id = u.id
      LEFT JOIN reviews r ON r.listing_id = l.id
      ${where}
      GROUP BY l.id, u.name
      ORDER BY l.created_at DESC
    `, params)
    res.json(result.rows)
  } catch (err) {
    console.error('List listings error:', err)
    res.status(500).json({ error: 'Failed to fetch listings' })
  }
})

router.get('/my', requireAuth, requireRole('landlord'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT l.*,
             COALESCE(AVG(r.rating), 0) AS rating,
             COUNT(DISTINCT r.id) AS review_count,
             COUNT(DISTINCT m.id) AS enquiry_count
      FROM listings l
      LEFT JOIN reviews r ON r.listing_id = l.id
      LEFT JOIN messages m ON m.listing_id = l.id AND m.receiver_id = $1
      WHERE l.landlord_id = $1
      GROUP BY l.id
      ORDER BY l.created_at DESC
    `, [req.user.id])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your listings' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT l.*, u.name AS landlord_name, u.email AS landlord_email,
             COALESCE(AVG(r.rating), 0) AS rating,
             COUNT(r.id) AS review_count
      FROM listings l
      LEFT JOIN users u ON l.landlord_id = u.id
      LEFT JOIN reviews r ON r.listing_id = l.id
      WHERE l.id = $1
      GROUP BY l.id, u.name, u.email
    `, [parseInt(req.params.id)])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Listing not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listing' })
  }
})

router.post('/', requireAuth, requireRole('landlord'), [
  body('title').trim().isLength({ min: 5 }),
  body('address').trim().notEmpty(),
  body('area').trim().notEmpty(),
  body('price').isInt({ min: 1 }),
  body('bedrooms').isInt({ min: 1 }),
  body('bathrooms').isInt({ min: 1 }),
  body('type').isIn(['Studio', 'Room', 'Apartment', 'House Share']),
  body('distance').isFloat({ min: 0 }),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  const { title, address, area, price, bedrooms, bathrooms, type, distance, amenities, image_url, description } = req.body
  try {
    const result = await db.query(`
      INSERT INTO listings (title, address, area, price, bedrooms, bathrooms, type, distance, amenities, image_url, description, landlord_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [title, address, area, price, bedrooms, bathrooms, type, distance, amenities || [], image_url || null, description || null, req.user.id])
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('Create listing error:', err)
    res.status(500).json({ error: 'Failed to create listing' })
  }
})

router.patch('/:id/verify', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { verified } = req.body
    const result = await db.query(
      'UPDATE listings SET verified = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [verified !== false, parseInt(req.params.id)]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Listing not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to update listing' })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const listing = await db.query('SELECT landlord_id FROM listings WHERE id = $1', [parseInt(req.params.id)])
    if (listing.rows.length === 0) return res.status(404).json({ error: 'Listing not found' })
    if (req.user.role !== 'admin' && listing.rows[0].landlord_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorised' })
    }
    await db.query('DELETE FROM listings WHERE id = $1', [parseInt(req.params.id)])
    res.json({ message: 'Listing deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete listing' })
  }
})

module.exports = router
