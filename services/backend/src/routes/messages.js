const express = require('express')
const { body, validationResult } = require('express-validator')
const db = require('../db')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

router.get('/conversations', requireAuth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT DISTINCT ON (partner_id)
        partner_id,
        partner_name,
        listing_id,
        listing_title,
        last_message,
        last_time,
        unread_count
      FROM (
        SELECT
          CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END AS partner_id,
          CASE WHEN m.sender_id = $1 THEN ru.name ELSE su.name END AS partner_name,
          m.listing_id,
          l.title AS listing_title,
          m.content AS last_message,
          m.created_at AS last_time,
          COUNT(CASE WHEN m.receiver_id = $1 AND NOT m.read THEN 1 END) OVER (
            PARTITION BY CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
          ) AS unread_count
        FROM messages m
        JOIN users su ON m.sender_id = su.id
        JOIN users ru ON m.receiver_id = ru.id
        LEFT JOIN listings l ON m.listing_id = l.id
        WHERE m.sender_id = $1 OR m.receiver_id = $1
        ORDER BY m.created_at DESC
      ) sub
      ORDER BY partner_id, last_time DESC
    `, [req.user.id])
    res.json(result.rows)
  } catch (err) {
    console.error('Conversations error:', err)
    res.status(500).json({ error: 'Failed to fetch conversations' })
  }
})

router.get('/:partnerId', requireAuth, async (req, res) => {
  try {
    const partnerId = parseInt(req.params.partnerId)
    await db.query(
      'UPDATE messages SET read = true WHERE sender_id = $1 AND receiver_id = $2',
      [partnerId, req.user.id]
    )
    const result = await db.query(`
      SELECT m.*, u.name AS sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2)
         OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC
    `, [req.user.id, partnerId])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

router.post('/', requireAuth, [
  body('receiver_id').isInt(),
  body('content').trim().isLength({ min: 1 }),
  body('listing_id').optional().isInt(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  const { receiver_id, content, listing_id } = req.body
  try {
    const result = await db.query(`
      INSERT INTO messages (sender_id, receiver_id, content, listing_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [req.user.id, receiver_id, content, listing_id || null])
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' })
  }
})

module.exports = router
