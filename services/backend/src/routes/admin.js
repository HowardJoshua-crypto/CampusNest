const express = require('express')
const db = require('../db')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

router.use(requireAuth, requireRole('admin'))

router.get('/stats', async (req, res) => {
  try {
    const [students, listings, complaints, rentAvg] = await Promise.all([
      db.query("SELECT COUNT(*) FROM users WHERE role = 'student'"),
      db.query("SELECT COUNT(*) FROM listings WHERE verified = true"),
      db.query("SELECT COUNT(*) FROM complaints WHERE status = 'open'"),
      db.query("SELECT COALESCE(AVG(price), 0) AS avg FROM listings WHERE verified = true"),
    ])
    res.json({
      total_students: parseInt(students.rows[0].count),
      active_listings: parseInt(listings.rows[0].count),
      open_complaints: parseInt(complaints.rows[0].count),
      avg_rent: Math.round(parseFloat(rentAvg.rows[0].avg)),
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

router.get('/area-stats', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        l.area,
        COUNT(DISTINCT s.id) AS students,
        ROUND(AVG(l.price)) AS avg_rent,
        COUNT(DISTINCT c.id) AS incidents
      FROM listings l
      LEFT JOIN users s ON s.role = 'student'
      LEFT JOIN complaints c ON c.listing_id = l.id
      GROUP BY l.area
      ORDER BY l.area
    `)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch area stats' })
  }
})

router.get('/listings', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT l.*, u.name AS landlord_name,
             COALESCE(AVG(r.rating), 0) AS rating,
             COUNT(r.id) AS review_count
      FROM listings l
      LEFT JOIN users u ON l.landlord_id = u.id
      LEFT JOIN reviews r ON r.listing_id = l.id
      GROUP BY l.id, u.name
      ORDER BY l.verified ASC, l.created_at DESC
    `)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listings' })
  }
})

router.get('/complaints', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, u.name AS student_name, l.title AS listing_title
      FROM complaints c
      LEFT JOIN users u ON c.student_id = u.id
      LEFT JOIN listings l ON c.listing_id = l.id
      ORDER BY c.created_at DESC
    `)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch complaints' })
  }
})

router.get('/users', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

module.exports = router
