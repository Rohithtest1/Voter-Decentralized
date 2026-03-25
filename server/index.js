import express from 'express'
import { createServer } from 'http'
import { Server as SocketIO } from 'socket.io'
import cors from 'cors'
import { authRouter } from './routes/auth.js'
import { sessionRouter } from './routes/session.js'

const app = express()
const httpServer = createServer(app)

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

export const io = new SocketIO(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})

app.use(cors({ origin: FRONTEND_URL, credentials: true }))
app.use(express.json())

// ── In-Memory Stores ──────────────────────────────────────────────────────────
// challenge:    `reg:userId` | `auth:userId` → { challenge, expiresAt }
export const challengeStore = new Map()
// credential:   credentialId → { id, publicKey (base64), counter, transports, userId, userName }
export const credentialStore = new Map()
// userCreds:    userId → credentialId[]
export const userCredentials = new Map()
// sessions:     sessionId → { status, expiresAt, userData? }
export const sessionStore = new Map()

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/auth', authRouter)
app.use('/session', sessionRouter)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── WebSocket ─────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  const sessionId = socket.handshake.query.sessionId
  if (sessionId) {
    socket.join(`session:${sessionId}`)
    console.log(`[WS] Joined session:${sessionId}`)
  }
  socket.on('disconnect', () => console.log('[WS] Client disconnected'))
})

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`🔐 VoteChain Auth Server → http://localhost:${PORT}`)
  console.log(`   FRONTEND_URL : ${FRONTEND_URL}`)
  console.log(`   RP_ID        : ${process.env.RP_ID || 'localhost'}`)
})
