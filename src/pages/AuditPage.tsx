import { Page, PageHeader, PageTitle, PageDescription, PageBody, DataTable, Badge, LoadingOverlay, SearchInput } from '@blinkdotnew/ui'
import { Activity, ShieldCheck, Clock, Search, FilterX, AlertCircle, Database } from 'lucide-react'
import { useBlockchainExplorer } from '../hooks/useElectionData'
import { useState, useMemo } from 'react'

export default function AuditPage() {
  const { logs, isLoading } = useBlockchainExplorer()
  const [search, setSearch] = useState('')

  const filteredLogs = useMemo(() => {
    return logs.filter(log => 
      log.action.toLowerCase().includes(search.toLowerCase()) || 
      (log.details && log.details.toLowerCase().includes(search.toLowerCase()))
    )
  }, [logs, search])

  const columns = [
    { 
      accessorKey: 'action', 
      header: 'Operation',
      cell: ({ row }: any) => {
        const action = row.original.action
        const isCritical = action.toLowerCase().includes('create') || action.toLowerCase().includes('delete')
        return (
          <div className="flex items-center gap-3 py-2">
            <div className={`p-1.5 rounded-lg border ${isCritical ? 'bg-red-500/10 border-red-500/20 text-red-600' : 'bg-primary/10 border-primary/20 text-primary'}`}>
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="font-bold text-foreground text-sm tracking-tight">{action}</span>
          </div>
        )
      }
    },
    { 
      accessorKey: 'details', 
      header: 'Technical Details',
      cell: ({ row }: any) => (
        <div className="flex flex-col gap-1 py-1 max-w-md">
          <span className="text-xs text-muted-foreground font-medium leading-relaxed italic">{row.original.details}</span>
        </div>
      )
    },
    { 
      accessorKey: 'timestamp', 
      header: 'Verification Timestamp',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2 py-1 text-xs font-medium text-muted-foreground/80">
          <Clock className="h-3.5 w-3.5 opacity-60" />
          <span>{new Date(row.original.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
        </div>
      )
    },
    {
      accessorKey: 'txHash',
      header: 'On-Chain Transaction',
      cell: ({ row }: any) => {
        const details = row.original.details ? JSON.parse(row.original.details) : {}
        const txHash = details.txHash || row.original.id
        return (
          <Badge variant="outline" className="bg-blue-50/50 text-[#0ea5e9] border-[#0ea5e9]/20 px-2 py-0.5 text-[9px] font-mono lowercase tracking-widest rounded transition-colors hover:bg-blue-50 flex items-center gap-1.5">
            <Database size={10} />
            {txHash.slice(0, 16)}...
          </Badge>
        )
      }
    }
  ]

  return (
    <Page className="max-w-7xl mx-auto py-12 px-6 space-y-12 animate-fade-in pb-32">
      <PageHeader className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-border/40">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-3 py-1 bg-[#f0f9ff] border border-[#bae6fd] rounded-lg">
               <div className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9] animate-pulse" />
               <span className="text-[9px] font-bold text-[#0ea5e9] uppercase tracking-[0.2em] leading-none text-nowrap">Live Observer Stream</span>
             </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="p-3 rounded-2xl bg-[#0f172a] text-white shadow-xl shadow-blue-500/10">
              <Activity className="h-8 w-8" />
            </div>
            <div className="space-y-1">
               <PageTitle className="text-4xl font-black tracking-tighter text-[#0f172a]">Real-Time Audit Registry</PageTitle>
               <PageDescription className="text-base text-muted-foreground/80 font-medium max-w-2xl leading-relaxed">
                 Publicly verifiable ledger of all electoral operations. Every entry is cryptographically signed and chained to the immutable blockchain.
               </PageDescription>
            </div>
          </div>
        </div>

        <div className="relative w-full sm:w-80 group">
          <SearchInput 
            placeholder="Search audit trail..." 
            value={search} 
            onChange={(v: any) => setSearch(typeof v === 'string' ? v : v.target?.value || '')}
            className="pl-10 h-11 border-2 border-border/60 focus:border-primary/40 rounded-xl transition-all shadow-sm"
          />
        </div>
      </PageHeader>

      <PageBody>
        <div className="p-2 rounded-3xl border border-border/40 bg-card/50 backdrop-blur-sm shadow-xl shadow-border/20 overflow-hidden relative">
          {isLoading && <LoadingOverlay loading={true} />}
          
          {filteredLogs.length > 0 ? (
            <DataTable 
              columns={columns} 
              data={filteredLogs} 
              searchable={false}
            />
          ) : (
            <div className="py-24 text-center">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center border-2 border-dashed border-border/40">
                  <FilterX className="h-8 w-8 text-muted-foreground/50" />
                </div>
              </div>
              <h4 className="text-xl font-bold tracking-tight text-foreground">No audit entries found</h4>
              <p className="text-muted-foreground font-medium mt-2">Try adjusting your search to find specific operations.</p>
            </div>
          )}
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 flex items-start gap-4">
          <div className="mt-1 shrink-0 h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
          </div>
          <div className="space-y-1">
            <h5 className="font-bold text-amber-900 dark:text-amber-400">Security Note</h5>
            <p className="text-sm text-amber-800/70 dark:text-amber-300/60 leading-relaxed font-medium">
              The audit logs shown here are mirrored from the cryptographic ledger. Any attempt to modify these records would trigger a system-wide integrity alert and be immediately visible in the blockchain explorer.
            </p>
          </div>
        </div>
      </PageBody>
    </Page>
  )
}
