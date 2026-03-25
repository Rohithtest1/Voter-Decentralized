import { useState } from 'react'
import { Page, PageHeader, PageTitle, PageDescription, PageActions, PageBody, Button, Card, CardHeader, CardTitle, CardContent, Input, Textarea, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DataTable, Badge, Separator, Persona, EmptyState } from '@blinkdotnew/ui'
import { useAuth } from '../hooks/useAuth'
import { useElections, useElection, useGlobalStats } from '../hooks/useElectionData'
import { Plus, Users, Settings, BarChart3, Clock, Trash2, Eye, ShieldCheck, CheckCircle2, RefreshCw, Vote, Search, Edit, Database, ChevronLeft, User, History } from 'lucide-react'
import { format } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'

export default function AdminPage() {
  const { user } = useAuth()
  const { elections, createElection, updateStatus, isLoading: isLoadingElections } = useElections()
  const { stats, isLoading: isLoadingStats } = useGlobalStats()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedElectionId, setSelectedElectionId] = useState<string | null>(null)
  
  const isLoading = isLoadingElections || isLoadingStats

  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
  })

  const handleCreate = async () => {
    if (!newElection.title || !user?.id) return
    try {
      await createElection({
        ...newElection,
        createdBy: user.id,
        status: 'draft',
      })
      setIsCreateOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'title', header: 'Election Title', cell: ({ row }) => <span className="font-bold">{row.original.title}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => (
      <Badge variant={row.original.status === 'active' ? 'secondary' : 'outline'} className={row.original.status === 'active' ? 'bg-accent/10 text-accent' : ''}>
        {row.original.status.toUpperCase()}
      </Badge>
    )},
    { accessorKey: 'endTime', header: 'Deadline', cell: ({ row }) => format(new Date(row.original.endTime), 'PP p') },
    { id: 'actions', header: 'Actions', cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setSelectedElectionId(row.original.id)}><Settings size={16} /></Button>
        {row.original.status === 'draft' && (
          <Button variant="outline" size="sm" onClick={() => updateStatus({ id: row.original.id, status: 'active' })}>Launch</Button>
        )}
        {row.original.status === 'active' && (
          <Button variant="destructive" size="sm" onClick={() => updateStatus({ id: row.original.id, status: 'closed' })}>Close</Button>
        )}
      </div>
    )}
  ]

  return (
    <Page className="bg-[#f8fafc]">
      <PageHeader className="py-10">
        <div className="space-y-1">
          <PageTitle className="text-3xl font-bold tracking-tight text-[#0f172a]">Electoral Commission Dashboard</PageTitle>
          <PageDescription className="text-sm font-medium text-muted-foreground/80">Monitor live voter turnout, oversee vote recording, and manage the transparent tallying protocol.</PageDescription>
        </div>
        <PageActions>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-4 py-2 bg-green-500/5 border border-green-500/20 rounded-xl">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest leading-none">Blockchain Node Active</span>
             </div>
             <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#0ea5e9] text-white rounded-xl px-6 font-bold text-xs"><Plus className="mr-2" size={16} /> New Election</Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl rounded-[2rem] border-none shadow-2xl" {...({} as any)}>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-[#0f172a]" {...({} as any)}>Initialize New Election</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Election Title</label>
                    <Input className="rounded-xl border-border/40 focus:ring-[#0ea5e9]/20" placeholder="2024 Presidential Election" value={newElection.title} onChange={e => setNewElection(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Start Date</label>
                      <Input className="rounded-xl border-border/40" type="datetime-local" value={newElection.startTime} onChange={e => setNewElection(p => ({ ...p, startTime: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">End Date</label>
                      <Input className="rounded-xl border-border/40" type="datetime-local" value={newElection.endTime} onChange={e => setNewElection(p => ({ ...p, endTime: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button className="bg-[#0f172a] text-white rounded-xl px-8 font-bold" onClick={handleCreate} disabled={!newElection.title}>Create Protocol</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </PageActions>
      </PageHeader>

      <PageBody className="space-y-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-white border-border/50 shadow-sm rounded-2xl relative overflow-hidden group">
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 leading-none">Live Turnout</p>
              <div className="text-3xl font-bold text-[#0f172a] tabular-nums leading-none pt-1">{stats?.totalRegistered ?? '...'}</div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-6 p-2 rounded-xl bg-[#f0f9ff] text-[#0ea5e9]">
              <Users size={18} />
            </div>
          </Card>
          
          <Card className="p-6 bg-white border-border/50 shadow-sm rounded-2xl relative overflow-hidden group">
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 leading-none">Votes Recorded</p>
              <div className="text-3xl font-bold text-[#0f172a] tabular-nums leading-none pt-1">{stats?.totalVotes ?? '...'}</div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-6 p-2 rounded-xl bg-[#fff7ed] text-[#f97316]">
              <ShieldCheck size={18} />
            </div>
          </Card>

          <Card className="p-6 bg-white border-border/50 shadow-sm rounded-2xl relative overflow-hidden group">
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 leading-none">Active Ledgers</p>
              <div className="text-3xl font-bold text-[#0f172a] tabular-nums leading-none pt-1">{stats?.totalElections ?? '...'}</div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-6 p-2 rounded-xl bg-[#f5f3ff] text-[#7c3aed]">
              <Database size={18} />
            </div>
          </Card>

          <Card className="p-6 bg-white border-border/50 shadow-sm rounded-2xl relative overflow-hidden group">
            <div className="space-y-1 transition-all">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 leading-none">Transparent Tally</p>
              <div className="text-xl font-bold text-green-600 leading-none pt-2 flex items-center gap-2">
                <CheckCircle2 size={16} /> Verified
              </div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-6 p-2 rounded-xl bg-green-50 text-green-500">
              <BarChart3 size={18} />
            </div>
          </Card>
        </div>

        <Card className="bg-white border-border/50 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-bold text-[#0f172a]">Active Electoral Protocols</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <RefreshCw className="animate-spin text-[#0ea5e9]" size={24} />
              </div>
            ) : elections.length === 0 ? (
              <EmptyState icon={<Vote size={24} />} title="No Elections Yet" description="Initialize your first protocol to begin voting." />
            ) : (
              <DataTable columns={columns} data={elections} searchable searchColumn="title" />
            )}
          </CardContent>
        </Card>

        {selectedElectionId && <ElectionManagementPanel id={selectedElectionId} onClose={() => setSelectedElectionId(null)} />}
      </PageBody>
    </Page>
  )
}

function ElectionManagementPanel({ id, onClose }: { id: string, onClose: () => void }) {
  const { election, candidates, isLoading, addCandidate, publishResults } = useElection(id)
  const [newCandidate, setNewCandidate] = useState({ name: '', party: '', photoUrl: '' })
  const [isAddingCandidate, setIsAddingCandidate] = useState(false)

  if (isLoading) return null

  const handleAddCandidate = async () => {
    if (!newCandidate.name) return
    try {
      await addCandidate(newCandidate)
      setNewCandidate({ name: '', party: '', photoUrl: '' })
      setIsAddingCandidate(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleTally = async () => {
    try {
      await publishResults()
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Dialog open={!!id} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl" {...({} as any)}>
        <DialogHeader>
          <DialogTitle {...({} as any)}>Manage: {election?.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{election?.status.toUpperCase()} Election</p>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <Users size={18} className="text-accent" />
                Candidates ({candidates.length})
              </h3>
              {!isAddingCandidate && (
                <Button size="sm" variant="outline" onClick={() => setIsAddingCandidate(true)}>Add Candidate</Button>
              )}
            </div>

            {isAddingCandidate && (
              <div className="p-4 bg-muted/50 border border-border rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Full Name" value={newCandidate.name} onChange={e => setNewCandidate(p => ({ ...p, name: e.target.value }))} />
                  <Input placeholder="Party Affiliation" value={newCandidate.party} onChange={e => setNewCandidate(p => ({ ...p, party: e.target.value }))} />
                </div>
                <Input placeholder="Photo URL (Optional)" value={newCandidate.photoUrl} onChange={e => setNewCandidate(p => ({ ...p, photoUrl: e.target.value }))} />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsAddingCandidate(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleAddCandidate}>Save Candidate</Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {candidates.map(candidate => (
                <div key={candidate.id} className="p-3 border border-border rounded-lg flex items-center gap-3 bg-card shadow-sm">
                  <Persona name={candidate.name} subtitle={candidate.party || ''} src={candidate.photoUrl || ''} />
                </div>
              ))}
            </div>
          </section>

          <Separator {...({} as any)} />

          <section className="space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Settings size={18} className="text-accent" />
              Finalize Election
            </h3>
            {election?.status === 'active' ? (
              <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg space-y-3">
                <p className="text-xs text-accent leading-relaxed">Election is currently active. Once closed, votes can be securely tallied and the final cryptographic block can be verified.</p>
                <Button size="sm" className="w-full bg-accent text-accent-foreground" onClick={handleTally}>Close & Publish Results</Button>
              </div>
            ) : election?.status === 'closed' ? (
              <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg space-y-2">
                <p className="text-xs text-green-600 font-bold flex items-center gap-2">
                  <CheckCircle2 size={14} /> Results Published
                </p>
                <p className="text-[10px] text-muted-foreground">The election has been finalized and results are verifiable in the audit logs.</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Add candidates and launch the election to begin collecting votes.</p>
            )}
          </section>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="w-full">Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
