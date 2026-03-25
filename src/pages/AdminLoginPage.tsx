import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ShieldCheck, User, Key, ChevronRight, BarChart3, Globe } from 'lucide-react'
import { Button, Input, toast } from '@blinkdotnew/ui'
import { useAuth } from '../hooks/useAuth'

export default function AdminLoginPage() {
  const { loginAsAdmin, loginAsObserver } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<'admin' | 'observer'>('admin')
  const [credentials, setCredentials] = useState({ id: '', password: '' })
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const handleLogin = async () => {
    setIsAuthenticating(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (role === 'admin') {
      loginAsAdmin()
      toast.success('Election Commission session initialized')
    } else {
      loginAsObserver()
      toast.success('Observer Protocol authorized')
    }
    navigate({ to: '/' })
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
      <div className="w-full max-w-md space-y-10 relative">
        {/* Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 text-blue-400 shadow-xl mb-2">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase tracking-[0.1em]">Authority Node</h1>
          <p className="text-slate-500 font-medium text-sm uppercase tracking-widest leading-relaxed">
            Administrative & Observer Governance Entrance
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-700">
          <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800">
            <button 
              onClick={() => setRole('admin')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'admin' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Commission
            </button>
            <button 
              onClick={() => setRole('observer')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'observer' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Observer
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Personnel Identifier</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                <Input 
                  className="bg-slate-950/50 border-slate-800 rounded-2xl pl-12 h-14 text-white focus:ring-blue-500/20" 
                  placeholder="EMP-000-X"
                  value={credentials.id}
                  onChange={e => setCredentials(p => ({ ...p, id: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Access Key</label>
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                <Input 
                  type="password"
                  className="bg-slate-950/50 border-slate-800 rounded-2xl pl-12 h-14 text-white focus:ring-blue-500/20" 
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={e => setCredentials(p => ({ ...p, password: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleLogin}
            disabled={isAuthenticating}
            className="w-full h-16 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] group flex items-center justify-center shadow-xl shadow-white/5"
          >
            {isAuthenticating ? (
              <div className="w-5 h-5 border-2 border-slate-800 border-t-slate-400 rounded-full animate-spin" />
            ) : (
              <>
                Initialize Authority Session
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <BarChart3 size={16} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Nodes</p>
              <p className="text-xs font-bold text-white tracking-tight">12/12 Live</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Globe size={16} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Hash Rate</p>
              <p className="text-xs font-bold text-white tracking-tight">2.4 PH/s</p>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-700 font-bold uppercase tracking-[0.3em] font-mono">
          EC-PROTOCOL-v2.0 // CRYPTO-SECURED
        </p>
      </div>
    </div>
  )
}
