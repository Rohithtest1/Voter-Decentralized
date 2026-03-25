import { Router } from 'express'
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import { isoBase64URL, isoUint8Array } from '@simplewebauthn/server/helpers'
import { challengeStore, credentialStore, userCredentials, io } from '../index.js'

export const authRouter = Router()

const RP_NAME = process.env.RP_NAME || 'VoteChain'
const RP_ID = process.env.RP_ID || 'localhost'
const RP_ORIGIN = process.env.RP_ORIGIN || 'http://localhost:5173'

// POST /auth/register/options
authRouter.post('/register/options', async (req, res) => {
  const { userId, userName = 'VoteChain Voter' } = req.body
  if (!userId) return res.status(400).json({ error: 'userId required' })

  const existingIds = userCredentials.get(userId) || []
  const excludeCredentials = existingIds.map((id) => ({
    id,
    transports: credentialStore.get(id)?.transports ?? [],
  }))

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userID: isoUint8Array.fromUTF8String(userId),
    userName,
    attestationType: 'none',
    excludeCredentials,
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
      authenticatorAttachment: 'platform',
    },
  })

  challengeStore.set(`reg:${userId}`, {
    challenge: options.challenge,
    expiresAt: Date.now() + 5 * 60 * 1000,
  })

  res.json(options)
})

// POST /auth/register/verify
authRouter.post('/register/verify', async (req, res) => {
  const { userId, userName = 'VoteChain Voter', response } = req.body
  if (!userId || !response) return res.status(400).json({ error: 'userId and response required' })

  const stored = challengeStore.get(`reg:${userId}`)
  if (!stored || stored.expiresAt < Date.now()) {
    return res.status(400).json({ error: 'Challenge expired or not found' })
  }

  try {
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: stored.challenge,
      expectedOrigin: RP_ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: true,
    })

    challengeStore.delete(`reg:${userId}`)

    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo
      const pubKeyB64 = isoBase64URL.fromBuffer(credential.publicKey)

      credentialStore.set(credential.id, {
        id: credential.id,
        publicKey: pubKeyB64,
        counter: credential.counter,
        transports: credential.transports ?? [],
        userId,
        userName,
      })

      const existing = userCredentials.get(userId) || []
      userCredentials.set(userId, [...existing, credential.id])

      return res.json({ verified: true, credentialId: credential.id })
    }
    res.status(400).json({ verified: false, error: 'Verification failed' })
  } catch (err) {
    console.error('[Register Verify]', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /auth/authenticate/options
authRouter.post('/authenticate/options', async (req, res) => {
  const { userId } = req.body || {}

  const credIds = userId ? (userCredentials.get(userId) || []) : []
  const allowCredentials = credIds.map((id) => ({
    id,
    transports: credentialStore.get(id)?.transports ?? ['internal'],
  }))

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials,
    userVerification: 'preferred',
    timeout: 60000,
  })

  const key = userId ? `auth:${userId}` : `auth:challenge:${options.challenge}`
  challengeStore.set(key, {
    challenge: options.challenge,
    userId: userId || null,
    expiresAt: Date.now() + 2 * 60 * 1000,
  })

  res.json(options)
})

// POST /auth/authenticate/verify
authRouter.post('/authenticate/verify', async (req, res) => {
  const { response, userId, sessionId } = req.body
  if (!response) return res.status(400).json({ error: 'response required' })

  // Find stored challenge
  let storedChallenge = null
  let challengeKey = null
  if (userId) {
    challengeKey = `auth:${userId}`
    storedChallenge = challengeStore.get(challengeKey)
  }
  if (!storedChallenge) {
    // Fallback: scan all auth challenges
    for (const [key, val] of challengeStore.entries()) {
      if (key.startsWith('auth:') && val.challenge) {
        storedChallenge = val
        challengeKey = key
        break
      }
    }
  }

  if (!storedChallenge || storedChallenge.expiresAt < Date.now()) {
    return res.status(400).json({ error: 'Challenge expired or not found' })
  }

  const storedCred = credentialStore.get(response.id)
  if (!storedCred) {
    return res.status(400).json({ error: 'Credential not found. Please register first.' })
  }

  try {
    const publicKey = new Uint8Array(isoBase64URL.toBuffer(storedCred.publicKey))
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: storedChallenge.challenge,
      expectedOrigin: RP_ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: storedCred.id,
        publicKey,
        counter: storedCred.counter,
        transports: storedCred.transports,
      },
    })

    challengeStore.delete(challengeKey)

    if (verification.verified) {
      storedCred.counter = verification.authenticationInfo.newCounter
      credentialStore.set(storedCred.id, storedCred)

      const userData = {
        id: storedCred.userId,
        name: storedCred.userName,
        role: 'voter',
        isVerified: true,
        credentialId: storedCred.id,
      }

      if (sessionId) {
        io.to(`session:${sessionId}`).emit('session:authenticated', { userData })
        console.log(`[Auth] Session ${sessionId} authenticated → user ${storedCred.userId}`)
      }

      return res.json({ verified: true, userData })
    }

    res.status(400).json({ verified: false, error: 'Authentication failed' })
  } catch (err) {
    console.error('[Authenticate Verify]', err)
    res.status(500).json({ error: err.message })
  }
})
