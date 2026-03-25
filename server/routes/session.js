import { Router } from 'express'
import { randomUUID } from 'crypto'
import { sessionStore, io } from '../index.js'

export const sessionRouter = Router()

const SESSION_TTL_MS = 60 * 1000 // 60 seconds

// Cleanup expired sessions every 30s
setInterval(() => {
  const now = Date.now()
  for (const [id, session] of sessionStore.entries()) {
    if (session.expiresAt < now) sessionStore.delete(id)
  }
}, 30000)

// POST /session/create
sessionRouter.post('/create', (_req, res) => {
  const sessionId = randomUUID()
  const expiresAt = Date.now() + SESSION_TTL_MS

  sessionStore.set(sessionId, { sessionId, status: 'pending', createdAt: Date.now(), expiresAt })

  // Auto-expire notification
  setTimeout(() => {
    const s = sessionStore.get(sessionId)
    if (s && s.status === 'pending') {
      s.status = 'expired'
      sessionStore.set(sessionId, s)
      io.to(`session:${sessionId}`).emit('session:expired')
    }
  }, SESSION_TTL_MS)

  res.json({ sessionId, expiresAt })
})

// GET /session/status/:sessionId
sessionRouter.get('/status/:sessionId', (req, res) => {
  const session = sessionStore.get(req.params.sessionId)
  if (!session) return res.status(404).json({ error: 'Session not found' })

  if (session.expiresAt < Date.now()) {
    session.status = 'expired'
    return res.json({ status: 'expired' })
  }

  res.json({ status: session.status, userData: session.userData })
})

// POST /session/confirm  — called by mobile after WebAuthn success
sessionRouter.post('/confirm', (req, res) => {
  const { sessionId, userData } = req.body
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' })

  const session = sessionStore.get(sessionId)
  if (!session) return res.status(404).json({ error: 'Session not found' })
  if (session.expiresAt < Date.now()) return res.status(400).json({ error: 'Session expired' })
  if (session.status !== 'pending') return res.status(400).json({ error: 'Session already used' })

  session.status = 'authenticated'
  session.userData = userData
  sessionStore.set(sessionId, session)

  io.to(`session:${sessionId}`).emit('session:authenticated', { userData })
  console.log(`[Session] ${sessionId} confirmed`)

  res.json({ success: true })
})
