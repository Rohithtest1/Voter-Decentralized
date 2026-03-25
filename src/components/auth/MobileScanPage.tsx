import { useState, useEffect } from 'react'
import { ShieldCheck, Fingerprint, CheckCircle2, AlertCircle, Lock } from 'lucide-react'
import {
  getOrCreateVoterId,
  hasRegisteredCredential,
  isWebAuthnSupported,
  registerBiometric,
  authenticateBiometric,
  type AuthUser,
} from '../../services/webauthn'
import { confirmSession } from '../../services/sessionService'

type Phase = 'idle' | 'registering' | 'authenticating' | 'confirming' | 'success' | 'error'

export default function MobileScanPage() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [sessionId, setSessionId] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sid = params.get('sessionId') || ''
    setSessionId(sid)
    if (!sid) {
      setErrorMsg('Invalid QR code — no session ID found.')
      setPhase('error')
    }
  }, [])

  const handleAuth = async () => {
    if (!isWebAuthnSupported()) {
      setErrorMsg('WebAuthn is not supported on this device/browser.')
      setPhase('error')
      return
    }
    if (!sessionId) {
      setErrorMsg('No session ID found in QR code.')
      setPhase('error')
      return
    }

    const userId = getOrCreateVoterId()
    const userName = 'VoteChain Voter'

    // Register if first time
    if (!hasRegisteredCredential()) {
      setPhase('registering')
      const regResult = await registerBiometric(userId, userName)
      if (!regResult.success) {
        setErrorMsg(regResult.error || 'Registration failed')
        setPhase('error')
        return
      }
    }

    setPhase('authenticating')
    const authResult = await authenticateBiometric(userId, sessionId)
    if (!authResult.success || !authResult.userData) {
      setErrorMsg(authResult.error || 'Authentication failed')
      setPhase('error')
      return
    }

    // Inform backend — this also triggers the desktop via Socket.io
    setPhase('confirming')
    try {
      await confirmSession(sessionId, authResult.userData as AuthUser)
    } catch {
      // Backend already may have handled it in verify step, not fatal
    }

    setPhase('success')
  }

  const isLoading = ['registering', 'authenticating', 'confirming'].includes(phase)

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(30,58,138,0.2),transparent_70%)]" />
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full animate-pulse" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-600/10 blur-[100px] rounded-full animate-pulse" />

      <div className="w-full max-w-sm relative z-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-8 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_16px_40px_rgba(59,130,246,0.35)]">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">VoteChain</h1>
            <p className="text-sm text-slate-400 mt-1">Mobile Biometric Authorization</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          {/* Fingerprint button */}
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={handleAuth}
              disabled={isLoading || phase === 'success' || phase === 'error'}
              className="relative group focus:outline-none disabled:cursor-not-allowed"
              aria-label="Authenticate with biometric"
            >
              {isLoading && (
                <>
                  <div className="absolute -inset-4 rounded-full border border-blue-500/30 animate-ping" />
                  <div className="absolute -inset-2 rounded-full border-2 border-blue-500/50 animate-spin [animation-duration:2s]" />
                </>
              )}
              <div className={`absolute -inset-8 rounded-full blur-[50px] transition-all duration-700
                ${phase === 'success' ? 'bg-green-500/25' : phase === 'error' ? 'bg-red-500/15' : 'bg-blue-500/20 group-hover:bg-blue-500/30'}`} />
              <div className={`w-32 h-32 rounded-full border-2 flex items-center justify-center bg-slate-950/80 relative z-10 backdrop-blur-xl transition-all group-hover:scale-105 active:scale-95
                ${phase === 'success' ? 'border-green-500' : phase === 'error' ? 'border-red-500/50' : 'border-slate-700 group-hover:border-blue-500/60'}`}>
                {phase === 'success'
                  ? <CheckCircle2 className="text-green-400 animate-in zoom-in duration-300" size={64} />
                  : phase === 'error'
                    ? <AlertCircle className="text-red-400" size={64} />
                    : <Fingerprint className={`transition-colors ${isLoading ? 'text-blue-400' : 'text-slate-600 group-hover:text-blue-400'}`} size={64} />
                }
              </div>
              {!isLoading && phase === 'idle' && (
                <div className="absolute top-0 right-0 w-8 h-8 bg-blue-600 rounded-full border-4 border-[#020617] z-20 flex items-center justify-center shadow-lg">
                  <Lock size={11} className="text-white" />
                </div>
              )}
            </button>

            <div className="text-center space-y-1.5">
              <p className="text-lg font-bold text-white">
                {phase === 'registering' && 'Registering Biometric...'}
                {phase === 'authenticating' && 'Verifying Identity...'}
                {phase === 'confirming' && 'Confirming with Desktop...'}
                {phase === 'success' && 'Authenticated!'}
                {phase === 'error' && 'Verification Failed'}
                {phase === 'idle' && 'Authenticate to Continue'}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed max-w-[220px] mx-auto">
                {phase === 'registering' && 'Touch sensor or use Face ID to enroll.'}
                {phase === 'authenticating' && 'Touch sensor or use Face ID to verify.'}
                {phase === 'confirming' && 'Notifying your desktop browser...'}
                {phase === 'success' && 'You can now close this tab. Your desktop is logging in.'}
                {phase === 'error' && errorMsg}
                {phase === 'idle' && 'Touch the fingerprint icon above or tap the button below.'}
              </p>
            </div>
          </div>

          {/* CTA */}
          {phase === 'idle' && (
            <button
              onClick={handleAuth}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-[0.25em] shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] border-t border-white/20"
            >
              Authenticate with Fingerprint
            </button>
          )}

          {phase === 'success' && (
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-green-400">
              <CheckCircle2 size={14} />
              Desktop session activated
            </div>
          )}

          {phase === 'error' && (
            <button
              onClick={() => { setPhase('idle'); setErrorMsg('') }}
              className="w-full h-14 rounded-2xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-xs font-black uppercase tracking-widest transition-all"
            >
              Try Again
            </button>
          )}
        </div>

        <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.4em]">
          Privacy-First · No Biometric Data Stored on Chain
        </p>
      </div>
    </div>
  )
}
