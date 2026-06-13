const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const db = require('../db')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) cb(null, true)
    else cb(new Error('Only image files are allowed'))
  },
})

router.post('/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const avatarUrl = `/uploads/${req.file.filename}`
  await db.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarUrl, req.user.id])
  res.json({ avatar_url: avatarUrl })
})

router.patch('/profile', requireAuth, async (req, res) => {
  const { name, phone, ...roleFields } = req.body
  const role = req.user.role
  try {
    if (name || phone !== undefined) {
      await db.query(
        'UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone) WHERE id = $3',
        [name || null, phone || null, req.user.id]
      )
    }

    if (role === 'student') {
      const { course, year_of_study, budget_min, budget_max, preferred_area } = roleFields
      await db.query(
        `UPDATE students SET
          course = COALESCE($1, course),
          year_of_study = COALESCE($2, year_of_study),
          budget_min = COALESCE($3, budget_min),
          budget_max = COALESCE($4, budget_max),
          preferred_area = COALESCE($5, preferred_area)
         WHERE user_id = $6`,
        [course || null, year_of_study ? parseInt(year_of_study) : null,
         budget_min ? parseInt(budget_min) : null, budget_max ? parseInt(budget_max) : null,
         preferred_area || null, req.user.id]
      )
    } else if (role === 'landlord') {
      const { company_name, bio } = roleFields
      await db.query(
        `UPDATE landlords SET
          company_name = COALESCE($1, company_name),
          bio = COALESCE($2, bio)
         WHERE user_id = $3`,
        [company_name || null, bio || null, req.user.id]
      )
    }

    const { rows } = await db.query(
      'SELECT id, email, name, role, phone, avatar_url FROM users WHERE id = $1',
      [req.user.id]
    )
    res.json(rows[0])
  } catch (err) {
    console.error('Profile update error:', err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

module.exports = router
