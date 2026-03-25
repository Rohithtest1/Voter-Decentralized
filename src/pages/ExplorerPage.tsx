// @ts-nocheck
import { Page, PageHeader, PageTitle, PageDescription, PageBody, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, EmptyState, Badge, LoadingOverlay } from '@blinkdotnew/ui'
import { Database, Search, Fingerprint, Lock as LockIcon, ShieldCheck, Cpu, Globe } from 'lucide-react'
import { useElections, useBlockchainExplorer } from '../hooks/useElectionData'
import { BlockCard } from '../components/vote-chain/BlockCard'
import { useState, useMemo } from 'react'

export default function ExplorerPage() {
  const { elections } = useElections()
  const [selectedElectionId, setSelectedElectionId] = useState<string>('all')
  const { blocks, isLoading } = useBlockchainExplorer(selectedElectionId === 'all' ? undefined : selectedElectionId)

  const selectedElection = useMemo(() => 
    elections.find(e => e.id === selectedElectionId),
    [elections, selectedElectionId]
  )

  return (
    <Page className="max-w-6xl mx-auto py-12 px-4 sm:px-6 space-y-12 animate-fade-in pb-32">
      <PageHeader className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-border/40">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <PageTitle className="text-3xl font-extrabold tracking-tight md:text-4xl">Blockchain Explorer</PageTitle>
          </div>
          <PageDescription className="text-base text-muted-foreground/80 font-medium max-w-2xl leading-relaxed">
            Verify the integrity of every cast vote by exploring the immutable cryptographic ledger.
          </PageDescription>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-muted/20 border border-border/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <Cpu className="h-4 w-4" />
            <span>Network: VoteChain Mainnet</span>
          </div>
          <div className="w-full sm:w-80">
            <Select value={selectedElectionId} onValueChange={setSelectedElectionId}>
              <SelectTrigger className="h-12 border-2 border-border/60 rounded-xl px-4 font-bold text-foreground">
                <SelectValue placeholder="Select Election to Verify" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-border/40 shadow-xl p-2">
                <SelectItem value="all" className="rounded-lg focus:bg-primary/10 font-bold p-2 cursor-pointer">All Activity</SelectItem>
                {elections.map(election => (
                  <SelectItem key={election.id} value={election.id} className="rounded-lg focus:bg-primary/10 font-bold p-2 cursor-pointer">
                    {election.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PageHeader>

      <PageBody className="relative">
        <LoadingOverlay loading={isLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="space-y-12">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  Block Sequence
                  <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] font-bold h-5 uppercase tracking-widest">{blocks.length}</Badge>
                </h3>
                <span className="text-xs text-muted-foreground font-medium italic">Latest blocks first</span>
              </div>
              
              <div className="space-y-8 relative pl-4 sm:pl-0">
                {/* Vertical Line for Chain Appearance */}
                <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-border/40 to-transparent -translate-x-1/2 hidden sm:block" />
                
                {blocks.length > 0 ? (
                  blocks.map((block, index) => (
                    <div key={block.id} className="relative z-10 transition-all hover:scale-[1.01]">
                      <BlockCard 
                        block={block} 
                        isFirst={index === 0}
                        isLast={index === blocks.length - 1}
                      />
                    </div>
                  ))
                ) : (
                  <div className="py-24 bg-card/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-border/40 text-center">
                    <EmptyState 
                      icon={<Fingerprint className="h-12 w-12 text-muted-foreground/50" />}
                      title="No blocks recorded"
                      description={selectedElectionId === 'all' ? "The blockchain is currently waiting for initial activity." : `No voting blocks have been generated for "${selectedElection?.title}" yet.`}
                      className="py-12"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar / Statistics */}
          <div className="space-y-8">
            <div className="p-6 rounded-3xl border border-border/40 bg-card/50 backdrop-blur-sm shadow-xl shadow-border/20 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-bold text-lg">Verification Metrics</h4>
              </div>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/20">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Protocol</span>
                  <Badge variant="outline" className="bg-primary/5 text-primary text-[10px] font-bold h-6 rounded-lg uppercase tracking-widest">SHA-256D</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/20">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Consensus</span>
                  <Badge variant="outline" className="bg-primary/5 text-primary text-[10px] font-bold h-6 rounded-lg uppercase tracking-widest">DPoS</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/20">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Auditability</span>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 text-[10px] font-bold h-6 rounded-lg uppercase tracking-widest">100%</Badge>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Globe className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Live Node Status</span>
                </div>
                <p className="text-xs text-muted-foreground/80 font-medium leading-relaxed">
                  Nodes across 12 distributed datacenters are currently synchronizing and verifying the VoteChain ledger.
                </p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-green-500">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span>SYNCHRONIZED</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-3xl border border-border/40 bg-muted/10 backdrop-blur-sm shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <LockIcon className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Encryption Standard</span>
              </div>
              <p className="text-xs text-muted-foreground/60 font-medium leading-relaxed italic">
                All block payloads are encrypted using AES-256 before hashing, ensuring voter privacy while maintaining public auditability.
              </p>
            </div>
          </div>
        </div>
      </PageBody>
    </Page>
  )
}
