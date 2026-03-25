import { Page, PageHeader, PageTitle, PageDescription, PageBody, StatGroup, Stat, Card, CardHeader, CardTitle, CardContent, Badge, Button, EmptyState } from '@blinkdotnew/ui'
import { useAuth } from '../hooks/useAuth'
import { useElections, useGlobalStats } from '../hooks/useElectionData'
import { Vote, ShieldCheck, History, Database, BarChart3, Clock, CheckCircle2, RefreshCw } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'

export default function OverviewPage() {
  const { user, isAdmin, isObserver } = useAuth()
  const { elections, isLoading: isLoadingElections } = useElections()
  const { stats, isLoading: isLoadingStats } = useGlobalStats()

  const activeElections = elections.filter(e => e.status === 'active')
  const closedElections = elections.filter(e => e.status === 'closed')

  if (isLoadingElections || isLoadingStats) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )

  return (
    <Page className="bg-[#f8fafc]">
      <PageHeader className="flex flex-row items-end justify-between py-10">
        <div className="space-y-1">
          <PageTitle className="text-3xl font-bold tracking-tight text-[#0f172a]">Overview Dashboard</PageTitle>
          <PageDescription className="text-sm font-medium text-muted-foreground/80">Welcome back, {user?.displayName || user?.name || 'RP Personal'}. View the status of ongoing elections and platform integrity.</PageDescription>
        </div>
      </PageHeader>
      <PageBody className="space-y-10 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="p-6 bg-white border-border/50 shadow-sm rounded-2xl relative overflow-hidden group">
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 leading-none">Active Elections</p>
              <div className="text-3xl font-bold text-[#0f172a] tabular-nums leading-none pt-1">{activeElections.length}</div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-6 p-2 rounded-xl bg-[#f0f9ff] text-[#0ea5e9]">
              <Vote size={18} />
            </div>
          </Card>
          
          <Card className="p-6 bg-white border-border/50 shadow-sm rounded-2xl relative overflow-hidden group">
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 leading-none">Total Elections</p>
              <div className="text-3xl font-bold text-[#0f172a] tabular-nums leading-none pt-1">{elections.length}</div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-6 p-2 rounded-xl bg-muted/50 text-muted-foreground/40">
              <Database size={18} />
            </div>
          </Card>

          <Card className="p-6 bg-white border-border/50 shadow-sm rounded-2xl relative overflow-hidden group">
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 leading-none">Completed Polls</p>
              <div className="text-3xl font-bold text-[#0f172a] tabular-nums leading-none pt-1">{closedElections.length}</div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-6 p-2 rounded-xl bg-green-50 text-green-500">
              <CheckCircle2 size={18} />
            </div>
          </Card>

          <Card className="p-6 bg-white border-border/50 shadow-sm rounded-2xl relative overflow-hidden group">
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 leading-none">Security Status</p>
              <div className="text-xl font-bold text-[#0f172a] leading-none pt-1">Secured</div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-6 p-2 rounded-xl bg-[#f0f9ff] text-[#0ea5e9]">
              <ShieldCheck size={18} />
            </div>
          </Card>
        </div>

        <Card className="bg-white border-border/50 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
            <CardTitle className="text-xl font-bold text-[#0f172a]">Recent Elections</CardTitle>
            <Link to="/elections">
              <Button variant="link" className="text-[#0ea5e9] font-bold text-xs p-0">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            {activeElections.length === 0 ? (
              <EmptyState icon={<Clock />} title="No Active Elections" description="Check back later for upcoming voting opportunities." />
            ) : (
              <div className="space-y-4">
                {activeElections.slice(0, 3).map(election => (
                  <div key={election.id} className="group flex items-center justify-between p-6 border border-border/50 rounded-2xl bg-white hover:border-[#0ea5e9]/30 transition-all shadow-sm hover:shadow-md">
                    <div className="space-y-1">
                      <h4 className="font-bold text-[#0f172a] tracking-tight">{election.title}</h4>
                      <p className="text-xs font-medium text-muted-foreground/60">Ends {format(new Date(election.endTime), 'MMMM do, yyyy')}</p>
                    </div>
                    <Link to="/elections/$electionId" params={{ electionId: election.id }}>
                      <Button className="bg-[#0f172a] text-white px-8 py-5 rounded-xl font-bold text-xs hover:bg-[#1e293b] active:scale-95 transition-all">Vote Now</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </PageBody>
    </Page>
  )
}
