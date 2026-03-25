import { useState, useEffect } from 'react'
import { blink } from '../blink/client'

// SHARED GLOBAL STATE for simulation
let globalUser: any = null;
const listeners = new Set<(user: any) => void>();

export function useAuth() {
  const [user, setUserState] = useState<any>(globalUser)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const notify = (u: any) => setUserState(u);
    listeners.add(notify);
    
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      if (state.user) {
        globalUser = state.user;
        listeners.forEach(l => l(globalUser));
      }
      if (!state.isLoading) setIsLoading(false)
    })

    return () => {
      listeners.delete(notify);
      unsubscribe();
    }
  }, [])

  const setUser = (u: any) => {
    globalUser = u;
    listeners.forEach(l => l(globalUser));
  }

  const loginAsVoter = () => {
    setUser({
      id: 'voter_001',
      name: 'Sarah Jenkins',
      email: 'sarah.j@votechain.io',
      role: 'voter',
      isVerified: true
    })
  }

  const loginAsAdmin = () => {
    setUser({
      id: 'admin_001',
      name: 'Election Commission',
      email: 'ec@votechain.gov',
      role: 'admin',
      isVerified: true
    })
  }

  const loginAsObserver = () => {
    setUser({
      id: 'observer_001',
      name: 'Transparency Int.',
      email: 'observer@un.org',
      role: 'observer',
      isVerified: true
    })
  }

  const isAdmin = user?.role === 'admin'
  const isVoter = user?.role === 'voter' || !user?.role
  const isObserver = user?.role === 'observer'

  return {
    user,
    setUser,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    isVoter,
    isObserver,
    login: () => blink.auth.login(),
    loginAsVoter,
    loginAsAdmin,
    loginAsObserver,
    logout: () => {
      globalUser = null;
      listeners.forEach(l => l(null));
      blink.auth.logout()
    },
  }
}
