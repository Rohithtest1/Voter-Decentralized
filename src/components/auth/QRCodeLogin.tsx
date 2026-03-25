import { useState, useEffect, useRef, useCallback } from 'react'
import QRCode from 'qrcode'
import { QrCode, CheckCircle2, RefreshCw, Smartphone, Clock, Wifi, WifiOff } from 'lucide-react'
import { createQRSession, connectToSession, getSessionStatus, type QRSession } from '../../services/sessionService'
import type { AuthUser } from '../../services/webauthn'

interface Props {
  onSuccess: (user: AuthUser) => void
}

type Phase = 'loading' | 'pending' | 'scanning' | 'success' | 'expired' | 'error'

export default function QRCodeLogin({ onSuccess }: Props) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [session, setSession] = useState<QRSession | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(60)
  const [socketConnected, setSocketConnected] = useState(false)
  const disconnectRef = useRef<(() => void) | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const cleanup = () => {
    disconnectRef.current?.()
    disconnectRef.current = null
    if (pollRef.current) clearInterval(pollRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const initSession = useCallback(async () => {
    cleanup()
    setPhase('loading')
    try {
      const s = await createQRSession()
      setSession(s)

      const dataUrl = await QRCode.toDataURL(s.qrUrl, {
        width: 220,
        margin: 2,
        color: { dark: '#020617', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      })
      setQrDataUrl(dataUrl)
      setSecondsLeft(60)
      setPhase('pending')

      // --- Socket.io real-time listener ---
      const disconnect = connectToSession(
        s.sessionId,
        (userData) => {
          cleanup()
          setPhase('success')
          setTimeout(() => onSuccess(userData), 800)
        },
        () => {
          cleanup()
          setPhase('expired')
        }
      )
      disconnectRef.current = disconnect
      setSocketConnected(true)

      // --- Countdown timer ---
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // --- Polling fallback (every 2.5s) ---
      pollRef.current = setInterval(async () => {
        try {
          const { status, userData } = await getSessionStatus(s.sessionId)
          if (status === 'authenticated' && userData) {
            cleanup()
            setPhase('success')
            setTimeout(() => onSuccess(userData), 800)
          } else if (status === 'expired') {
            cleanup()
            setPhase('expired')
          }
        } catch { /* ignore poll errors */ }
      }, 2500)

    } catch (err) {
      console.error('[QR]', err)
      setPhase('error')
    }
  }, [onSuccess])

  useEffect(() => {
    initSession()
    return cleanup
  }, [initSession])

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      {/* QR Panel */}
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute -inset-4 rounded-[3rem] bg-blue-500/10 blur-2xl" />

        <div className="relative bg-white rounded-[2.5rem] p-5 shadow-[0_0_60px_rgba(59,130,246,0.15)]">
          {/* Status overlay */}
          {(phase === 'loading' || phase === 'success' || phase === 'expired' || phase === 'scanning') && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-20 flex flex-col items-center justify-center rounded-[2.5rem] text-white space-y-4">
              {phase === 'loading' && (
                <>
                  <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Generating QR...</p>
                </>
              )}
              {phase === 'success' && (
                <>
                  <CheckCircle2 size={52} className="text-green-400 animate-bounce" />
                  <p className="text-xs font-black uppercase tracking-widest text-green-400">Authenticated!</p>
                </>
              )}
              {phase === 'expired' && (
                <>
                  <Clock size={42} className="text-amber-400" />
                  <p className="text-xs font-black uppercase tracking-widest text-amber-400">QR Expired</p>
                </>
              )}
            </div>
          )}

          {/* QR Code */}
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Login QR Code" className="w-52 h-52 rounded-2xl" />
          ) : (
            <div className="w-52 h-52 flex items-center justify-center">
              <QrCode size={120} className="text-slate-300" />
            </div>
          )}

          {/* Scan line animation */}
          {phase === 'pending' && (
            <div className="absolute inset-x-5 top-5 h-0.5 bg-blue-500/60 rounded-full animate-[scan_2.5s_ease-in-out_infinite]" />
          )}
        </div>

        {/* Corner markers */}
        <div className="absolute top-1 left-1 w-6 h-6 border-t-2 border-l-2 border-blue-500 rounded-tl-xl" />
        <div className="absolute top-1 right-1 w-6 h-6 border-t-2 border-r-2 border-blue-500 rounded-tr-xl" />
        <div className="absolute bottom-1 left-1 w-6 h-6 border-b-2 border-l-2 border-blue-500 rounded-bl-xl" />
        <div className="absolute bottom-1 right-1 w-6 h-6 border-b-2 border-r-2 border-blue-500 rounded-br-xl" />
      </div>

      {/* Status text */}
      <div className="text-center space-y-2">
        <p className="text-xl font-bold text-white tracking-tight">Cross-Device Authorization</p>
        <p className="text-sm text-slate-500 max-w-[270px] mx-auto leading-relaxed">
          {phase === 'pending' && 'Scan this QR with your phone to authenticate via biometrics.'}
          {phase === 'success' && 'Mobile authentication confirmed. Logging you in...'}
          {phase === 'expired' && 'This QR code has expired. Generate a new one.'}
          {phase === 'error' && 'Could not connect to auth server. Check your connection.'}
          {phase === 'loading' && 'Setting up secure session...'}
        </p>
      </div>

      {/* Timer + socket indicator */}
      {phase === 'pending' && (
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${secondsLeft < 15 ? 'text-amber-400' : 'text-slate-500'}`}>
            <Clock size={12} />
            <span>{secondsLeft}s</span>
          </div>
          <div className="w-px h-4 bg-slate-700" />
          <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${socketConnected ? 'text-green-500' : 'text-slate-500'}`}>
            {socketConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span>{socketConnected ? 'Live' : 'Polling'}</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      {phase === 'pending' && (
        <div className="flex items-center gap-3 px-5 py-3 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <Smartphone size={16} className="text-blue-400 shrink-0" />
          <p className="text-[11px] text-slate-400 font-medium">
            Open camera on your phone → scan → tap fingerprint
          </p>
        </div>
      )}

      {/* Regenerate */}
      {(phase === 'expired' || phase === 'error') && (
        <button
          onClick={initSession}
          className="flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 rounded-2xl transition-all shadow-lg shadow-blue-500/20"
        >
          <RefreshCw size={14} /> Generate New QR
        </button>
      )}
    </div>
  )
}
