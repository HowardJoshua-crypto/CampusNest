const express = require('express')
const db = require('../db')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

router.use(requireAuth, requireRole('admin'))

// ── Stats ─────────────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [students, listings, complaints, rentAvg, flagged] = await Promise.all([
      db.query('SELECT COUNT(*) FROM students'),
      db.query('SELECT COUNT(*) FROM listings WHERE verified = true'),
      db.query("SELECT COUNT(*) FROM complaints WHERE status = 'open'"),
      db.query('SELECT COALESCE(AVG(price), 0) AS avg FROM listings WHERE verified = true'),
      db.query('SELECT COUNT(*) FROM listings WHERE flagged = true'),
    ])
    res.json({
      total_students: parseInt(students.rows[0].count),
      active_listings: parseInt(listings.rows[0].count),
      open_complaints: parseInt(complaints.rows[0].count),
      avg_rent: Math.round(parseFloat(rentAvg.rows[0].avg)),
      flagged_listings: parseInt(flagged.rows[0].count),
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// ── Area stats ─────────────────────────────────────────────────────────────────
router.get('/area-stats', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        l.area,
        COUNT(DISTINCT l.id) AS listing_count,
        ROUND(AVG(l.price)) AS avg_rent,
        COUNT(DISTINCT c.id) AS incidents
      FROM listings l
      LEFT JOIN complaints c ON c.listing_id = l.id
      WHERE l.verified = true
      GROUP BY l.area
      ORDER BY avg_rent DESC
    `)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch area stats' })
  }
})

// ── Listings (all) ─────────────────────────────────────────────────────────────
router.get('/listings', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT l.*, u.name AS landlord_name, u.id AS landlord_user_id, u.email AS landlord_email,
             ld.company_name, ld.verified_landlord,
             COALESCE(AVG(r.rating), 0) AS rating,
             COUNT(DISTINCT r.id) AS review_count
      FROM listings l
      LEFT JOIN users u ON l.landlord_id = u.id
      LEFT JOIN landlords ld ON ld.user_id = l.landlord_id
      LEFT JOIN reviews r ON r.listing_id = l.id
      GROUP BY l.id, u.name, u.id, u.email, ld.company_name, ld.verified_landlord
      ORDER BY l.flagged DESC, l.verified ASC, l.created_at DESC
    `)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listings' })
  }
})

// ── Verify listing ─────────────────────────────────────────────────────────────
router.patch('/listings/:id/verify', async (req, res) => {
  try {
    const { verified } = req.body
    const { rows } = await db.query(
      'UPDATE listings SET verified = $1 WHERE id = $2 RETURNING *',
      [verified !== false, parseInt(req.params.id)]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Listing not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify listing' })
  }
})

// ── Flag / unflag listing ──────────────────────────────────────────────────────
router.patch('/listings/:id/flag', async (req, res) => {
  try {
    const { flagged, flag_reason } = req.body
    const isFlagged = flagged !== false
    const { rows } = await db.query(
      `UPDATE listings SET flagged = $1, flag_reason = $2 WHERE id = $3 RETURNING *`,
      [isFlagged, isFlagged ? (flag_reason || null) : null, parseInt(req.params.id)]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Listing not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to flag listing' })
  }
})

// ── Remove listing ─────────────────────────────────────────────────────────────
router.delete('/listings/:id', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id FROM listings WHERE id = $1', [parseInt(req.params.id)])
    if (rows.length === 0) return res.status(404).json({ error: 'Listing not found' })
    await db.query('DELETE FROM listings WHERE id = $1', [parseInt(req.params.id)])
    res.json({ message: 'Listing removed' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove listing' })
  }
})

// ── Students ───────────────────────────────────────────────────────────────────
router.get('/students', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.email, u.name, u.phone, u.created_at,
             s.student_number, s.year_of_study, s.course,
             s.budget_min, s.budget_max, s.preferred_area,
             COUNT(DISTINCT sl.listing_id) AS saved_count,
             COUNT(DISTINCT r.id) AS review_count
      FROM users u
      JOIN students s ON s.user_id = u.id
      LEFT JOIN saved_listings sl ON sl.student_id = u.id
      LEFT JOIN reviews r ON r.student_id = u.id
      GROUP BY u.id, s.user_id
      ORDER BY u.created_at DESC
    `)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' })
  }
})

// ── Landlords ──────────────────────────────────────────────────────────────────
router.get('/landlords', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.email, u.name, u.phone, u.created_at,
             l.company_name, l.bio, l.verified_landlord, l.avg_response_hours,
             COUNT(DISTINCT li.id) AS listing_count,
             COUNT(DISTINCT li.id) FILTER (WHERE li.verified = true) AS verified_listings,
             COUNT(DISTINCT li.id) FILTER (WHERE li.flagged = true) AS flagged_listings,
             COALESCE(AVG(r.rating), 0) AS avg_rating
      FROM users u
      JOIN landlords l ON l.user_id = u.id
      LEFT JOIN listings li ON li.landlord_id = u.id
      LEFT JOIN reviews r ON r.listing_id = li.id
      GROUP BY u.id, l.user_id
      ORDER BY verified_listings DESC
    `)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch landlords' })
  }
})

// ── Verify landlord ────────────────────────────────────────────────────────────
router.patch('/landlords/:userId/verify', async (req, res) => {
  try {
    const { rows } = await db.query(
      'UPDATE landlords SET verified_landlord = $1 WHERE user_id = $2 RETURNING *',
      [req.body.verified !== false, parseInt(req.params.userId)]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Landlord not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to update landlord' })
  }
})

// ── Admins ─────────────────────────────────────────────────────────────────────
router.get('/admins', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.email, u.name, u.created_at,
             a.department, a.can_verify_listings, a.can_manage_users
      FROM users u
      JOIN admins a ON a.user_id = u.id
      ORDER BY u.created_at DESC
    `)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admins' })
  }
})

// ── Complaints ─────────────────────────────────────────────────────────────────
router.get('/complaints', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, u.name AS student_name, s.course, s.year_of_study,
             l.title AS listing_title, l.area AS listing_area
      FROM complaints c
      LEFT JOIN users u ON c.student_id = u.id
      LEFT JOIN students s ON s.user_id = c.student_id
      LEFT JOIN listings l ON c.listing_id = l.id
      ORDER BY c.created_at DESC
    `)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch complaints' })
  }
})

// ── Message landlord ───────────────────────────────────────────────────────────
router.post('/message-landlord', async (req, res) => {
  const { landlord_id, content, listing_id } = req.body
  if (!landlord_id || !content?.trim()) {
    return res.status(400).json({ error: 'landlord_id and content are required' })
  }
  try {
    const target = await db.query("SELECT id FROM users WHERE id = $1 AND role = 'landlord'", [parseInt(landlord_id)])
    if (target.rows.length === 0) return res.status(404).json({ error: 'Landlord not found' })

    const { rows } = await db.query(
      `INSERT INTO messages (sender_id, receiver_id, listing_id, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, parseInt(landlord_id), listing_id ? parseInt(listing_id) : null, content.trim()]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('Message landlord error:', err)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

module.exports = router
