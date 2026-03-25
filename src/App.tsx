import { useState } from 'react'
import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, Link } from '@tanstack/react-router'
import { Toaster, AppShell, AppShellSidebar, AppShellMain, MobileSidebarTrigger, Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarItem, Badge, useBlinkUI, Button } from '@blinkdotnew/ui'
import { LayoutDashboard, Vote, ShieldCheck, History, Database, LogOut, Settings, BarChart3, Lock as LockIcon, Fingerprint, ChevronRight, QrCode } from 'lucide-react'
import { useAuth } from './hooks/useAuth'

// Page Imports
import HomePage from './pages/OverviewPage'
import ElectionsPage from './pages/ElectionsPage'
import VotePage from './pages/VotePage'
import AdminPage from './pages/AdminPage'
import ExplorerPage from './pages/ExplorerPage'
import AuditPage from './pages/AuditPage'
import VerifyVotePage from './pages/VerifyVotePage'
import ProfilePage from './pages/ProfilePage'
import VoterLoginPage from './pages/VoterLoginPage'
import AdminLoginPage from './pages/AdminLoginPage'
import MobileScanPage from './components/auth/MobileScanPage'

// Root Route
const rootRoute = createRootRoute({
  component: () => {
    const { user, isLoading, logout, isAdmin, isObserver, isVoter } = useAuth()
    const { pathname } = window.location

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
              <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-500/40" />
            </div>
            <span className="text-[10px] font-bold text-blue-200/40 uppercase tracking-[0.4em] animate-pulse">Initializing Secure Chaining</span>
          </div>
        </div>
      )
    }

    // Handle Route-Based Logic for Authentication
    if (!user) {
      // Mobile scan page is public — no auth needed
      if (pathname.startsWith('/auth/scan')) {
        return <MobileScanPage />
      }
      if (pathname.startsWith('/admin') || pathname.startsWith('/audit') || pathname.startsWith('/explorer')) {
        return <AdminLoginPage />
      }
      return <VoterLoginPage />
    }

    return (
      <AppShell>
        <AppShellSidebar>
          <Sidebar className="border-r border-slate-800 bg-slate-950">
            <SidebarHeader className="flex items-center gap-3 px-6 py-8">
              <div className="w-10 h-10 rounded-[1.2rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-2xl text-white tracking-tighter">VOTECHAIN</span>
            </SidebarHeader>
            <SidebarContent className="px-4 pt-4">
              {/* VOTER PORTAL */}
              {isVoter && !isAdmin && !isObserver && (
                <SidebarGroup className="space-y-1">
                  <SidebarGroupLabel className="px-4 mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Voter App</SidebarGroupLabel>
                  <SidebarItem icon={<LayoutDashboard size={18} />} label="Overview" href="/" />
                  <SidebarItem icon={<Vote size={18} />} label="Cast My Vote" href="/elections" />
                  <SidebarItem icon={<History size={18} />} label="My Vote Receipt" href="/profile" />
                  <SidebarItem icon={<ShieldCheck size={18} />} label="Verify My Vote" href="/verify" />
                </SidebarGroup>
              )}

              {/* COMMISSION DASHBOARD */}
              {isAdmin && (
                <SidebarGroup className="space-y-1">
                  <SidebarGroupLabel className="px-4 mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Election Commission</SidebarGroupLabel>
                  <SidebarItem icon={<BarChart3 size={18} />} label="Live Turnout" href="/" />
                  <SidebarItem icon={<Database size={18} />} label="Votes Recorded" href="/explorer" />
                  <SidebarItem icon={<Settings size={18} />} label="Governance" href="/admin" />
                  <SidebarItem icon={<History size={18} />} label="Results Center" href="/audit" />
                </SidebarGroup>
              )}

              {/* OBSERVER PORTAL */}
              {isObserver && (
                <SidebarGroup className="space-y-1">
                  <SidebarGroupLabel className="px-4 mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Observer Portal</SidebarGroupLabel>
                  <SidebarItem icon={<ShieldCheck size={18} />} label="Audit Registry" href="/audit" />
                  <SidebarItem icon={<Database size={18} />} label="Block Ledger" href="/explorer" />
                </SidebarGroup>
              )}
            </SidebarContent>
            
            <div className="mt-auto p-6 space-y-4">
              <Link to="/profile" className="flex items-center gap-3 p-4 rounded-3xl bg-slate-900 shadow-xl border border-white/5 group">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold group-hover:scale-110 transition-transform">
                  {user?.name?.[0] || 'V'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                  <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">{user?.role || 'Voter'}</p>
                </div>
              </Link>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
              >
                <LogOut size={16} />
                Terminate Session
              </button>
            </div>
          </Sidebar>
        </AppShellSidebar>
        <AppShellMain className="bg-[#020617]">
          <div className="md:hidden flex items-center gap-4 px-6 h-18 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
            <MobileSidebarTrigger />
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter text-white">VOTECHAIN</span>
          </div>
          <div className="max-w-[1600px] mx-auto min-h-screen bg-[#020617]">
            <Outlet />
          </div>
          <Toaster position="bottom-right" />
        </AppShellMain>
      </AppShell>
    )
  },
})

// Register Routes
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage })
const electionsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/elections', component: ElectionsPage })
const voteRoute = createRoute({ getParentRoute: () => rootRoute, path: '/elections/$electionId', component: VotePage })
const adminRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin', component: AdminPage })
const explorerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/explorer', component: ExplorerPage })
const auditRoute = createRoute({ getParentRoute: () => rootRoute, path: '/audit', component: AuditPage })
const verifyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/verify', component: VerifyVotePage })
const profileRoute = createRoute({ getParentRoute: () => rootRoute, path: '/profile', component: ProfilePage })

const routeTree = rootRoute.addChildren([indexRoute, electionsRoute, voteRoute, adminRoute, explorerRoute, auditRoute, verifyRoute, profileRoute])
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

export default function App() {
  return <RouterProvider router={router} />
}
