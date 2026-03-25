import { useState, useEffect, Suspense, lazy } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ShieldCheck, Smartphone, QrCode, Lock, Fingerprint } from 'lucide-react'
import { toast } from '@blinkdotnew/ui'
import { useAuth } from '../hooks/useAuth'
import MobileBiometricLogin from '../components/auth/MobileBiometricLogin'
import QRCodeLogin from '../components/auth/QRCodeLogin'
import type { AuthUser } from '../services/webauthn'

const AnimatedBackground = lazy(() => import('../components/auth/AnimatedBackground'))

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768
    )
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

type LoginTab = 'biometric' | 'qr'

export default function VoterLoginPage() {
  const { loginAsVoter, setUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState<LoginTab>('biometric')

  // Auto-select tab based on device
  useEffect(() => {
    setActiveTab(isMobile ? 'biometric' : 'qr')
  }, [isMobile])

  useEffect(() => {
    if (isAuthenticated) navigate({ to: '/' })
  }, [isAuthenticated, navigate])

  const handleSuccess = (userData: AuthUser) => {
    setUser({
      id: userData.id,
      name: userData.name || 'VoteChain Voter',
      email: `${userData.id.slice(0, 8)}@votechain.io`,
      role: userData.role || 'voter',
      isVerified: true,
    })
    toast.success('Identity verified via WebAuthn biometric')
  }

  // Fallback for when backend isn't running (demo mode)
  const handleDemoLogin = () => {
    loginAsVoter()
    toast.success('Demo mode: Logged in as voter')
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* 3D Animated Background */}
      <Suspense fallback={null}>
        <AnimatedBackground />
      </Suspense>

      {/* Radial overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.12),transparent_70%)] z-[1]" />

      <div className="w-full max-w-lg relative z-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-5 animate-in fade-in slide-in-from-top-8 duration-700">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_20px_50px_rgba(59,130,246,0.35)]">
            <ShieldCheck size={48} className="text-white" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">Voter Portal</h1>
            <p className="text-slate-400 text-base max-w-xs mx-auto leading-relaxed">
              Hardware-grade biometric authentication for your vote.
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/40 border border-slate-800 backdrop-blur-3xl rounded-[3rem] p-1.5 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          {/* Tab Switcher */}
          <div className="flex p-2 gap-2">
            <button
              onClick={() => setActiveTab('biometric')}
              className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-200
                ${activeTab === 'biometric'
                  ? 'bg-white/5 text-blue-400 border border-white/10 shadow-inner'
                  : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Fingerprint size={14} />
              {isMobile ? 'Fingerprint' : 'This Device'}
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-200
                ${activeTab === 'qr'
                  ? 'bg-white/5 text-blue-400 border border-white/10 shadow-inner'
                  : 'text-slate-500 hover:text-slate-300'}`}
            >
              <QrCode size={14} />
              {isMobile ? 'QR Code' : 'Scan with Phone'}
            </button>
          </div>

          {/* Content */}
          <div className="p-8 sm:p-10">
            {activeTab === 'biometric' ? (
              <MobileBiometricLogin onSuccess={handleSuccess} />
            ) : (
              <QRCodeLogin onSuccess={handleSuccess} />
            )}
          </div>

          {/* Footer */}
          <div className="px-10 pb-8 pt-2 space-y-5">
            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Demo button (for when backend is not running) */}
            <button
              onClick={handleDemoLogin}
              className="w-full py-3 rounded-2xl border border-slate-800 text-[10px] font-bold text-slate-600 hover:text-slate-400 hover:border-slate-700 uppercase tracking-widest transition-all"
            >
              Demo Mode (No Backend)
            </button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 opacity-25 grayscale">
              <div className="flex items-center gap-1.5 text-[9px] font-black text-white uppercase tracking-widest">
                <Lock size={12} /> FIDO2 / WebAuthn
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-black text-white uppercase tracking-widest">
                <Smartphone size={12} /> Hardware Attestation
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-700 font-bold uppercase tracking-[0.4em] animate-pulse">
          Privacy-First · No Biometric Storage On Chain
        </p>
      </div>
    </div>
  )
}
