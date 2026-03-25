import { useState } from 'react'
import { Fingerprint, CheckCircle2, AlertCircle, Lock, RefreshCw } from 'lucide-react'
import {
  getOrCreateVoterId,
  hasRegisteredCredential,
  isWebAuthnSupported,
  registerBiometric,
  authenticateBiometric,
  type AuthUser,
} from '../../services/webauthn'

interface Props {
  onSuccess: (user: AuthUser) => void
}

type Phase = 'idle' | 'registering' | 'authenticating' | 'success' | 'error'

export default function MobileBiometricLogin({ onSuccess }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const supported = isWebAuthnSupported()

  const handleAuth = async () => {
    if (!supported) {
      setErrorMsg('WebAuthn is not supported on this browser/device.')
      setPhase('error')
      return
    }

    const userId = getOrCreateVoterId()
    const userName = `VoteChain Voter`

    // Register if no credential yet
    if (!hasRegisteredCredential()) {
      setPhase('registering')
      const regResult = await registerBiometric(userId, userName)
      if (!regResult.success) {
        setErrorMsg(regResult.error || 'Registration failed')
        setPhase('error')
        return
      }
    }

    // Authenticate
    setPhase('authenticating')
    const authResult = await authenticateBiometric(userId)
    if (!authResult.success || !authResult.userData) {
      setErrorMsg(authResult.error || 'Authentication failed')
      setPhase('error')
      return
    }

    setPhase('success')
    setTimeout(() => onSuccess(authResult.userData!), 800)
  }

  const isLoading = phase === 'registering' || phase === 'authenticating'

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      {/* Fingerprint Ring */}
      <button
        onClick={handleAuth}
        disabled={isLoading || phase === 'success'}
        className="relative group focus:outline-none disabled:cursor-not-allowed"
        aria-label="Authenticate with fingerprint"
      >
        {/* Glow */}
        <div className={`absolute -inset-10 rounded-full blur-[60px] transition-all duration-700
          ${phase === 'success' ? 'bg-green-500/30' : phase === 'error' ? 'bg-red-500/20' : 'bg-blue-500/20 group-hover:bg-blue-500/35 animate-pulse'}`} />

        {/* Spinning rings */}
        {isLoading && (
          <>
            <div className="absolute -inset-4 rounded-full border border-blue-500/30 animate-ping" />
            <div className="absolute -inset-2 rounded-full border-2 border-blue-500/50 animate-spin [animation-duration:2s]" />
          </>
        )}

        {/* Main circle */}
        <div className={`w-36 h-36 rounded-full border-2 flex items-center justify-center bg-slate-950/80 relative z-10 backdrop-blur-xl transition-all duration-500 group-hover:scale-105 active:scale-95
          ${phase === 'success' ? 'border-green-500' : phase === 'error' ? 'border-red-500/50' : 'border-slate-700 group-hover:border-blue-500/70'}`}>
          {phase === 'success' ? (
            <CheckCircle2 className="text-green-500 animate-in zoom-in duration-300" size={72} />
          ) : phase === 'error' ? (
            <AlertCircle className="text-red-400" size={72} />
          ) : (
            <Fingerprint
              className={`transition-colors duration-300 ${isLoading ? 'text-blue-400' : 'text-slate-600 group-hover:text-blue-400'}`}
              size={72}
            />
          )}
        </div>

        {/* Lock badge */}
        {!isLoading && phase === 'idle' && (
          <div className="absolute top-1 right-1 w-9 h-9 bg-blue-600 rounded-full border-4 border-[#020617] z-20 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Lock size={12} className="text-white" />
          </div>
        )}
      </button>

      {/* Label */}
      <div className="text-center space-y-2">
        <p className="text-xl font-bold text-white tracking-tight">
          {phase === 'registering' && 'Setting Up Biometric...'}
          {phase === 'authenticating' && 'Verifying Identity...'}
          {phase === 'success' && 'Identity Verified'}
          {phase === 'error' && 'Verification Failed'}
          {phase === 'idle' && 'Fingerprint Authentication'}
        </p>
        <p className="text-sm text-slate-500 max-w-[260px] mx-auto leading-relaxed">
          {phase === 'registering' && 'Register your fingerprint or Face ID with this device.'}
          {phase === 'authenticating' && 'Touch sensor or use Face ID to sign your voter credential.'}
          {phase === 'success' && 'Redirecting to your secure voter dashboard...'}
          {phase === 'error' && errorMsg}
          {phase === 'idle' && (!supported
            ? 'WebAuthn not supported. Please use a compatible browser.'
            : hasRegisteredCredential()
              ? 'Touch the fingerprint sensor or use Face ID to log in.'
              : 'First time? Your biometric will be registered securely.'
          )}
        </p>
      </div>

      {/* Retry */}
      {phase === 'error' && (
        <button
          onClick={() => { setPhase('idle'); setErrorMsg('') }}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-blue-400 border border-blue-500/30 rounded-2xl hover:bg-blue-500/10 transition-all"
        >
          <RefreshCw size={14} /> Try Again
        </button>
      )}

      {/* Main CTA */}
      {phase === 'idle' && (
        <button
          onClick={handleAuth}
          disabled={!supported}
          className="w-full max-w-xs h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white font-black text-xs uppercase tracking-[0.25em] shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] border-t border-white/20"
        >
          {hasRegisteredCredential() ? 'Authenticate with Biometric' : 'Register & Authenticate'}
        </button>
      )}
    </div>
  )
}
