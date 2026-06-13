const express = require('express')
const db = require('../db')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

router.get('/', requireAuth, requireRole('student'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT l.*, u.name AS landlord_name,
             COALESCE(AVG(r.rating), 0) AS rating,
             COUNT(r.id) AS review_count
      FROM saved_listings sl
      JOIN listings l ON sl.listing_id = l.id
      LEFT JOIN users u ON l.landlord_id = u.id
      LEFT JOIN reviews r ON r.listing_id = l.id
      WHERE sl.student_id = $1
      GROUP BY l.id, u.name
    `, [req.user.id])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved listings' })
  }
})

router.post('/:listingId', requireAuth, requireRole('student'), async (req, res) => {
  try {
    await db.query(
      'INSERT INTO saved_listings (student_id, listing_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, parseInt(req.params.listingId)]
    )
    res.json({ message: 'Saved' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to save listing' })
  }
})

router.delete('/:listingId', requireAuth, requireRole('student'), async (req, res) => {
  try {
    await db.query(
      'DELETE FROM saved_listings WHERE student_id = $1 AND listing_id = $2',
      [req.user.id, parseInt(req.params.listingId)]
    )
    res.json({ message: 'Removed from saved' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove saved listing' })
  }
})

module.exports = router
