require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors({ origin: '*', credentials: true }))
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/listings', require('./routes/listings'))
app.use('/api/reviews', require('./routes/reviews'))
app.use('/api/messages', require('./routes/messages'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/saved', require('./routes/saved'))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend API running on port ${PORT}`)
})
