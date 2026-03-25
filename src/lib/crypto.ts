export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export function generateVerificationId(): string {
  return `VC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
}

export function encryptVote(choice: string): string {
  // Simulate encryption for MVP
  return btoa(choice + Date.now().toString())
}

export function decryptVote(encrypted: string): string {
  // Simulate decryption for MVP
  const decoded = atob(encrypted)
  return decoded.slice(0, -13) // Remove timestamp
}
