import { startRegistration, startAuthentication } from '@simplewebauthn/browser'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export interface AuthUser {
  id: string
  name: string
  role: string
  isVerified: boolean
  credentialId?: string
}

export interface WebAuthnResult {
  success: boolean
  userData?: AuthUser
  error?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function getOrCreateVoterId(): string {
  let id = localStorage.getItem('votechain_voter_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('votechain_voter_id', id)
  }
  return id
}

export function hasRegisteredCredential(): boolean {
  return !!localStorage.getItem('votechain_credential_id')
}

export function isWebAuthnSupported(): boolean {
  return typeof window !== 'undefined' &&
    !!window.PublicKeyCredential &&
    !!navigator.credentials
}

// ── Registration ──────────────────────────────────────────────────────────────
export async function registerBiometric(userId: string, userName: string): Promise<WebAuthnResult> {
  try {
    const optRes = await fetch(`${API_URL}/auth/register/options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userName }),
    })
    if (!optRes.ok) throw new Error((await optRes.json()).error || 'Options failed')
    const options = await optRes.json()

    const regResponse = await startRegistration({ optionsJSON: options })

    const verRes = await fetch(`${API_URL}/auth/register/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userName, response: regResponse }),
    })
    if (!verRes.ok) throw new Error((await verRes.json()).error || 'Verification failed')
    const { verified, credentialId } = await verRes.json()

    if (verified && credentialId) {
      localStorage.setItem('votechain_credential_id', credentialId)
      return { success: true }
    }
    return { success: false, error: 'Registration verification failed' }
  } catch (err: unknown) {
    const e = err as Error & { name?: string }
    if (e?.name === 'NotAllowedError') return { success: false, error: 'Authentication cancelled' }
    if (e?.name === 'InvalidStateError') return { success: false, error: 'Credential already registered' }
    return { success: false, error: e?.message || 'Registration failed' }
  }
}

// ── Authentication ────────────────────────────────────────────────────────────
export async function authenticateBiometric(userId: string, sessionId?: string): Promise<WebAuthnResult> {
  try {
    const optRes = await fetch(`${API_URL}/auth/authenticate/options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    if (!optRes.ok) throw new Error((await optRes.json()).error || 'Options failed')
    const options = await optRes.json()

    const authResponse = await startAuthentication({ optionsJSON: options })

    const verRes = await fetch(`${API_URL}/auth/authenticate/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: authResponse, userId, sessionId }),
    })
    if (!verRes.ok) throw new Error((await verRes.json()).error || 'Verify failed')
    const { verified, userData } = await verRes.json()

    if (verified && userData) return { success: true, userData }
    return { success: false, error: 'Authentication failed' }
  } catch (err: unknown) {
    const e = err as Error & { name?: string }
    if (e?.name === 'NotAllowedError') return { success: false, error: 'Authentication cancelled' }
    if (e?.name === 'InvalidStateError') return { success: false, error: 'No credential found. Register first.' }
    return { success: false, error: e?.message || 'Authentication failed' }
  }
}
