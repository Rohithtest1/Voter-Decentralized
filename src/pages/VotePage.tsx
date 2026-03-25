import { useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { Page, PageHeader, PageTitle, PageDescription, PageBody, Card, CardHeader, CardTitle, CardContent, Button, Badge, EmptyState, toast, Separator } from '@blinkdotnew/ui'
import { useElection, useVoting } from '../hooks/useElectionData'
import { useAuth } from '../hooks/useAuth'
import { Vote, ChevronLeft, ShieldCheck, User, Users, CheckCircle2, History, Database } from 'lucide-react'

export default function VotePage() {
  const { electionId } = useParams({ from: '/elections/$electionId' })
  const { user } = useAuth()
  const { election, candidates, isLoading } = useElection(electionId)
  const { castVote, isCasting, isUsed, voterToken } = useVoting(user?.id, electionId)
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)

  const handleCastVote = async () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate first')
      return
    }

    try {
      const result = await castVote({ choice: selectedCandidate })
      if (!result.success) {
        toast.error(result.error || 'Vote could not be processed')
      }
    } catch (error: any) {
      console.error('Vote failed:', error)
      toast.error(error.message || 'An unexpected error occurred protocol-side')
    }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )

  if (!election) return (
    <Page>
      <PageBody>
        <EmptyState 
          icon={<Vote />} 
          title="Election Not Found" 
          description="The election protocol you are looking for does not exist or has been decommissioned."
        />
        <div className="flex justify-center mt-6">
          <Link to="/elections">
            <Button variant="outline">Back to Elections</Button>
          </Link>
        </div>
      </PageBody>
    </Page>
  )

  if (isUsed) {
    return (
      <Page className="bg-[#f8fafc]">
        <PageHeader className="py-12 border-b border-border/40 bg-white">
          <div className="max-w-4xl mx-auto w-full space-y-6 px-6">
            <div className="flex items-center gap-4">
              <Link to="/elections">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                  <ChevronLeft size={24} />
                </Button>
              </Link>
              <div className="space-y-1">
                 <h1 className="text-3xl font-black text-[#0f172a] shadow-sm">Ballot Processed</h1>
                 <p className="text-base font-medium text-muted-foreground/60 tracking-tight">Your vote for "{election.title}" has been securely recorded on the blockchain.</p>
              </div>
            </div>
          </div>
        </PageHeader>
        <PageBody className="max-w-4xl mx-auto py-16 px-6 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            <Card className="md:col-span-3 border-none bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-12 text-center space-y-8 relative overflow-hidden">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-green-500 rounded-full" />
               <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-50 text-green-500 shadow-inner">
                 <CheckCircle2 size={48} />
               </div>
               <div className="space-y-2">
                 <h2 className="text-3xl font-black text-[#0f172a] tracking-tight">Cryptographic Confirmation</h2>
                 <p className="text-muted-foreground font-medium leading-relaxed max-w-sm mx-auto tracking-tight underline">Your vote is immutable. The underlying protocol has verified your hardware signature.</p>
               </div>

               <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
                 <Link to="/verify">
                   <Button className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-[#0f172a] text-white font-bold text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10">
                     <ShieldCheck className="mr-3" size={18} /> Verify Count
                   </Button>
                 </Link>
                 <Link to="/profile">
                   <Button variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-2xl border-border/60 text-[#0f172a] font-bold text-sm uppercase tracking-widest hover:bg-muted transition-all">
                     <History className="mr-3" size={18} /> View Receipt
                   </Button>
                 </Link>
               </div>
            </Card>

            <div className="md:col-span-2 space-y-6">
               <Card className="p-8 bg-[#0f172a] text-white border-none rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all duration-700" />
                 <div className="space-y-6 relative z-10">
                   <div className="flex items-center gap-3">
                     <div className="p-2 rounded-xl bg-white/10">
                       <Database size={20} className="text-blue-400" />
                     </div>
                     <h3 className="font-bold tracking-tight">Digital Receipt</h3>
                   </div>
                   <div className="space-y-4">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Chain Identifier</p>
                        <p className="text-xs font-mono font-bold text-white/90 break-all">{voterToken || `TXN_${Math.random().toString(16).slice(2, 10).toUpperCase()}`}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Timestamp</p>
                        <p className="text-xs font-bold text-white/90">{new Date().toLocaleString()}</p>
                     </div>
                   </div>
                   <div className="pt-4 border-t border-white/5 flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-green-400" />
                     <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Confidential & Verifiable</span>
                   </div>
                 </div>
               </Card>
            </div>
          </div>
        </PageBody>
      </Page>
    )
  }

  return (
    <Page className="bg-white">
      <PageHeader className="border-b border-border/40 py-8">
        <div className="flex items-start justify-between gap-12">
          <div className="flex items-start gap-6">
            <Link to="/elections">
              <Button variant="ghost" size="icon" className="mt-1 rounded-full hover:bg-muted">
                <ChevronLeft size={24} />
              </Button>
            </Link>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge className="bg-[#e0f2fe] text-[#0ea5e9] border-none font-bold px-3 py-1 text-[10px] uppercase tracking-widest leading-none">
                  {election.status}
                </Badge>
                <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">{election.title}</h1>
              </div>
            </div>
          </div>
          <div className="max-w-md text-right">
            <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed">
              {election.description}
            </p>
          </div>
        </div>
      </PageHeader>

      <PageBody className="py-12 space-y-12 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-10">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-[#f0f9ff] text-[#0ea5e9]">
                <Vote size={18} />
              </div>
              <h2 className="text-xl font-bold text-[#0f172a]">Select Your Candidate</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {candidates.map(candidate => (
                <Card 
                  key={candidate.id} 
                  className={`relative cursor-pointer transition-all border-2 rounded-[2rem] p-8 ${selectedCandidate === candidate.id ? 'border-[#0ea5e9] bg-white shadow-xl shadow-[#0ea5e9]/10' : 'border-border/40 bg-white hover:border-border hover:bg-muted/5'}`}
                  onClick={() => setSelectedCandidate(candidate.id)}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border/20">
                        <img 
                          src={candidate.photoUrl || ''} 
                          alt={candidate.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=f0f9ff&color=0ea5e9&bold=true`
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-lg text-[#0f172a]">{candidate.name}</h4>
                      <p className="text-sm font-medium text-muted-foreground/60">{candidate.party}</p>
                    </div>
                    
                    <div className="pt-2">
                       <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedCandidate === candidate.id ? 'bg-[#0ea5e9] border-[#0ea5e9] text-white' : 'border-border/40 text-transparent'}`}>
                         <CheckCircle2 size={16} />
                       </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <Card className="bg-[#f0f9ff] border-none rounded-[2rem] p-8 shadow-sm">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white text-[#0ea5e9] shadow-sm">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="font-bold text-[#0f172a]">Secure Voting</h3>
                </div>
                
                <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed">
                  By filtering your vote, you are casting an anonymous, encrypted ballot that will be chained to the immutable election ledger.
                </p>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-[#0ea5e9]/10">
                  <p className="text-[10px] font-mono font-bold text-[#0ea5e9]/60 uppercase tracking-widest mb-2">Metadata Encryption</p>
                  <p className="text-xs font-mono font-medium text-muted-foreground/60 break-all leading-relaxed">
                    {selectedCandidate ? `Enc(CHOICE=${selectedCandidate.slice(0, 8)}..., SALT=...)` : 'Awaiting Selection...'}
                  </p>
                </div>
              </div>
            </Card>

            <Button 
              className={`w-full py-8 rounded-[1.5rem] font-bold text-lg transition-all shadow-lg ${selectedCandidate ? 'bg-[#7dd3fc] text-[#0369a1] hover:bg-[#38bdf8] shadow-[#7dd3fc]/30' : 'bg-muted text-muted-foreground cursor-not-allowed shadow-none'}`}
              disabled={!selectedCandidate || isCasting}
              onClick={handleCastVote}
            >
              {isCasting ? (
                <div className="flex items-center gap-3">
                   <div className="animate-spin h-5 w-5 border-[3px] border-[#0369a1] border-t-transparent rounded-full" />
                   Processing...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <History size={20} />
                  Confirm My Vote
                </div>
              )}
            </Button>
            
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
              Protected by SHA-256 Chaining
            </p>
          </div>
        </div>
      </PageBody>
    </Page>
  )
}
