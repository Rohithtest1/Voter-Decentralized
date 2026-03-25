import { io as socketIO, type Socket } from 'socket.io-client'
import type { AuthUser } from './webauthn'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export interface QRSession {
  sessionId: string
  qrUrl: string
  expiresAt: number
}

let socket: Socket | null = null

export async function createQRSession(): Promise<QRSession> {
  const res = await fetch(`${API_URL}/session/create`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to create session')
  const { sessionId, expiresAt } = await res.json()
  const qrUrl = `${window.location.origin}/auth/scan?sessionId=${sessionId}&api=${encodeURIComponent(API_URL)}`
  return { sessionId, qrUrl, expiresAt }
}

export async function getSessionStatus(sessionId: string): Promise<{ status: string; userData?: AuthUser }> {
  const res = await fetch(`${API_URL}/session/status/${sessionId}`)
  if (!res.ok) throw new Error('Failed to get session status')
  return res.json()
}

export async function confirmSession(sessionId: string, userData: AuthUser): Promise<void> {
  await fetch(`${API_URL}/session/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, userData }),
  })
}

export function connectToSession(
  sessionId: string,
  onAuthenticated: (userData: AuthUser) => void,
  onExpired: () => void
): () => void {
  socket?.disconnect()

  socket = socketIO(API_URL, {
    query: { sessionId },
    transports: ['websocket', 'polling'],
  })

  socket.on('session:authenticated', ({ userData }: { userData: AuthUser }) => {
    onAuthenticated(userData)
  })

  socket.on('session:expired', onExpired)
  socket.on('connect_error', (err) => console.warn('[Socket]', err.message))

  return () => {
    socket?.disconnect()
    socket = null
  }
}
