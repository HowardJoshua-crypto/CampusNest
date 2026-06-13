const express = require('express')
const { body, validationResult } = require('express-validator')
const db = require('../db')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

router.get('/listing/:listingId', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.id, r.rating, r.comment, r.created_at,
             u.name AS author
      FROM reviews r
      JOIN users u ON r.student_id = u.id
      WHERE r.listing_id = $1
      ORDER BY r.created_at DESC
    `, [parseInt(req.params.listingId)])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
})

router.get('/my', requireAuth, requireRole('student'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.id, r.listing_id, r.rating, r.comment, r.created_at,
             l.title AS listing_title
      FROM reviews r
      JOIN listings l ON r.listing_id = l.id
      WHERE r.student_id = $1
      ORDER BY r.created_at DESC
    `, [req.user.id])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
})

router.post('/', requireAuth, requireRole('student'), [
  body('listing_id').isInt(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  const { listing_id, rating, comment } = req.body
  try {
    const result = await db.query(`
      INSERT INTO reviews (listing_id, student_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (listing_id, student_id)
      DO UPDATE SET rating = $3, comment = $4
      RETURNING *
    `, [listing_id, req.user.id, rating, comment || null])
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('Review error:', err)
    res.status(500).json({ error: 'Failed to submit review' })
  }
})

module.exports = router
