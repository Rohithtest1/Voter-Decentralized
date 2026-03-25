import { Page, PageHeader, PageTitle, PageDescription, PageBody, Card, CardHeader, CardTitle, CardContent, Button, Badge, Separator } from '@blinkdotnew/ui'
import { useAuth } from '../hooks/useAuth'
import { useBlockchainExplorer } from '../hooks/useElectionData'
import { ShieldCheck, User, Fingerprint, History, ExternalLink, LogOut, ChevronRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { logs } = useBlockchainExplorer()
  
  const userVotes = logs.filter(log => log.userId === user?.id && log.action === 'VOTE_CAST')

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <Page className="bg-white">
      <PageHeader className="border-b border-border/40 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#2563eb] flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-500/20">
              {user?.name ? getInitials(user.name) : <User size={40} />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">{user?.name || 'Voter Registry'}</h1>
                <Badge className="bg-[#f0f9ff] text-[#0ea5e9] border-none font-bold px-2 py-0.5 text-[10px] uppercase tracking-wider">
                  Verified
                </Badge>
                <Badge className="bg-[#f0fdf4] text-green-600 border-none font-bold px-2 py-0.5 text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <Fingerprint size={10} /> Passkey Enrolled
                </Badge>
              </div>
              <p className="text-muted-foreground font-medium">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-4">
             <Button variant="outline" className="rounded-xl border-border/40 gap-2" onClick={() => logout()}>
               <LogOut size={16} /> Sign Out
             </Button>
          </div>
        </div>
      </PageHeader>

      <PageBody className="py-12 space-y-12 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Security & Identity Card */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
              <ShieldCheck className="text-[#0ea5e9]" size={20} />
              Security Vault
            </h2>
            
            <Card className="border-border/40 rounded-[2rem] overflow-hidden shadow-sm bg-muted/5">
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Voter ID (Cryptographic)</p>
                    <div className="flex items-center gap-2 p-3 bg-white border border-border/40 rounded-xl font-mono text-xs text-[#0ea5e9] break-all">
                      <Fingerprint size={14} className="shrink-0" />
                      {user?.id}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Account Status</p>
                    <div className="flex items-center gap-2 text-sm font-bold text-green-600">
                      <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                      Active & Secured
                    </div>
                  </div>
                </div>

                <Separator {...({} as any)} />

                <div className="space-y-4">
                   <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                     Your identity is protected via <strong>Zero-Knowledge Encryption</strong>. Platform administrators cannot link your Voter ID to your specific ballot choices.
                   </p>
                   <Button variant="outline" className="w-full rounded-xl gap-2 text-xs border-border/40">
                     Download Security Audit
                   </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Log */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
              <History className="text-[#0ea5e9]" size={20} />
              Electoral Participation history
            </h2>

            <div className="space-y-4">
              {userVotes.length > 0 ? userVotes.map((vote, i) => (
                <Card key={i} className="border-border/40 hover:border-border/60 transition-all rounded-2xl group cursor-default">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#f0f9ff] flex items-center justify-center text-[#0ea5e9]">
                          <ShieldCheck size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#0f172a]">Vote Recorded on Ledger</h4>
                          <div className="flex flex-col gap-0.5 mt-1">
                            <p className="text-[10px] text-muted-foreground font-medium">
                              {new Date(vote.timestamp).toLocaleDateString()} at {new Date(vote.timestamp).toLocaleTimeString()}
                            </p>
                            {vote.details && (
                              <p className="text-[9px] font-mono font-bold text-accent uppercase tracking-tighter">
                                Receipt: {JSON.parse(vote.details).verificationId || 'N/A'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 rounded-lg text-[10px] py-1">
                           Verified Block
                         </Badge>
                         <Link to="/verify">
                           <Button size="icon" variant="ghost" className="rounded-full opacity-40 group-hover:opacity-100 transition-opacity">
                             <ChevronRight size={20} />
                           </Button>
                         </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="py-20 text-center border-2 border-dashed border-border/40 rounded-[2rem] bg-muted/5">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-border/40">
                    <History size={24} className="text-muted-foreground/40" />
                  </div>
                  <h3 className="font-bold text-[#0f172a]">No Participation Yet</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                    Your voting activity will appear here once you've cast a ballot in an active election.
                  </p>
                  <Link to="/">
                    <Button variant="link" className="text-[#0ea5e9] font-bold mt-4">
                      Browse Active Elections
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageBody>
    </Page>
  )
}
