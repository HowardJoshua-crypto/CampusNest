const express = require('express')
const bcrypt = require('bcryptjs')
const { body, validationResult } = require('express-validator')
const db = require('../db')
const { signToken, requireAuth } = require('../middleware/auth')

const router = express.Router()

async function insertRoleProfile(userId, role, extra = {}) {
  if (role === 'student') {
    await db.query(
      `INSERT INTO students (user_id, student_number, year_of_study, course, budget_min, budget_max, preferred_area)
       VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (user_id) DO NOTHING`,
      [userId, extra.student_number || null, extra.year_of_study || null, extra.course || null,
       extra.budget_min || 200, extra.budget_max || 900, extra.preferred_area || null]
    )
  } else if (role === 'landlord') {
    await db.query(
      `INSERT INTO landlords (user_id, company_name, bio, verified_landlord)
       VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO NOTHING`,
      [userId, extra.company_name || null, extra.bio || null, extra.verified_landlord || false]
    )
  } else if (role === 'admin') {
    await db.query(
      `INSERT INTO admins (user_id, department, can_verify_listings, can_manage_users)
       VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO NOTHING`,
      [userId, extra.department || 'Housing Office',
       extra.can_verify_listings !== false, extra.can_manage_users || false]
    )
  }
}

async function fetchFullUser(userId, role) {
  let q, rows
  if (role === 'student') {
    ({ rows } = await db.query(
      `SELECT u.id, u.email, u.name, u.role, u.phone, u.created_at,
              s.student_number, s.year_of_study, s.course,
              s.budget_min, s.budget_max, s.preferred_area
       FROM users u
       LEFT JOIN students s ON s.user_id = u.id
       WHERE u.id = $1`, [userId]
    ))
  } else if (role === 'landlord') {
    ({ rows } = await db.query(
      `SELECT u.id, u.email, u.name, u.role, u.phone, u.created_at,
              l.company_name, l.bio, l.verified_landlord, l.avg_response_hours
       FROM users u
       LEFT JOIN landlords l ON l.user_id = u.id
       WHERE u.id = $1`, [userId]
    ))
  } else {
    ({ rows } = await db.query(
      `SELECT u.id, u.email, u.name, u.role, u.phone, u.created_at,
              a.department, a.can_verify_listings, a.can_manage_users
       FROM users u
       LEFT JOIN admins a ON a.user_id = u.id
       WHERE u.id = $1`, [userId]
    ))
  }
  return rows[0] || null
}

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 }),
  body('role').isIn(['admin', 'student', 'landlord']),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  const { email, password, name, role, phone, ...extra } = req.body
  try {
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Email already registered' })

    const password_hash = await bcrypt.hash(password, 12)
    const { rows } = await db.query(
      'INSERT INTO users (email, password_hash, name, role, phone) VALUES ($1,$2,$3,$4,$5) RETURNING id, email, name, role',
      [email, password_hash, name, role, phone || null]
    )
    const user = rows[0]
    await insertRoleProfile(user.id, role, extra)

    const fullUser = await fetchFullUser(user.id, role)
    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role })
    res.status(201).json({ token, user: fullUser })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  body('role').isIn(['admin', 'student', 'landlord']),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  const { email, password, role } = req.body
  try {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email])
    if (rows.length === 0 || rows[0].role !== role) {
      return res.status(401).json({ error: 'Invalid credentials or role mismatch' })
    }
    const user = rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials or role mismatch' })

    const fullUser = await fetchFullUser(user.id, role)
    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role })
    res.json({ token, user: fullUser })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await fetchFullUser(req.user.id, req.user.role)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

module.exports = router
