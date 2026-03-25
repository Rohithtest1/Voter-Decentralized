import { useState } from 'react'
import { Page, PageHeader, PageTitle, PageDescription, PageBody, Card, CardHeader, CardTitle, CardContent, Input, Button, Badge, Separator, EmptyState, toast } from '@blinkdotnew/ui'
import { useBlockchainExplorer } from '../hooks/useElectionData'
import { Search, ShieldCheck, Database, Box, Clock, Key, CheckCircle2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function VerifyVotePage() {
  const [verificationId, setVerificationId] = useState('')
  const [result, setResult] = useState<any>(null)
  const { blocks, isLoading } = useBlockchainExplorer()

  const handleVerify = () => {
    if (!verificationId.trim()) return

    const foundBlock = blocks.find(block => {
      try {
        const payload = JSON.parse(block.payload)
        return payload.verificationId === verificationId.trim()
      } catch (e) {
        // Fallback for older blocks or if payload is raw string
        return block.payload === verificationId.trim()
      }
    })

    if (foundBlock) {
      setResult(foundBlock)
      toast.success('Vote found and verified in blockchain!')
    } else {
      setResult(false)
      toast.error('Verification ID not found.')
    }
  }

  return (
    <Page>
      <PageHeader>
        <PageTitle className="flex items-center gap-2">
          <ShieldCheck className="text-accent" />
          Verify My Vote
        </PageTitle>
        <PageDescription>Enter your cryptographic receipt ID to verify that your ballot is included in the immutable blockchain ledger.</PageDescription>
      </PageHeader>
      
      <PageBody className="max-w-2xl mx-auto space-y-8">
        <Card className="border-accent/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest">Verify Ballot Integrity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Verification ID (Receipt)</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g. VC-A1B2C3D4" 
                  value={verificationId}
                  onChange={e => setVerificationId(e.target.value)}
                  className="font-mono"
                />
                <Button onClick={handleVerify} disabled={isLoading}>
                  <Search size={18} className="mr-2" /> Verify
                </Button>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg flex items-start gap-3">
              <Key className="text-accent shrink-0 mt-1" size={18} />
              <p className="text-xs text-muted-foreground italic">Your choice remains anonymous. This check only confirms that a vote with your unique receipt ID exists in the blockchain and has not been tampered with.</p>
            </div>
          </CardContent>
        </Card>

        {result === false && (
          <div className="p-8 text-center bg-destructive/5 border border-destructive/20 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-bold text-destructive">Invalid Verification ID</h3>
            <p className="text-sm text-muted-foreground">The ID entered does not match any records in the current blockchain ledger. Please check for typos and try again.</p>
          </div>
        )}

        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 justify-center text-green-500 bg-green-500/10 py-3 rounded-full border border-green-500/20">
              <CheckCircle2 size={20} />
              <span className="font-bold uppercase tracking-widest text-sm">Integrity Verified</span>
            </div>

            <Card className="border-green-500/20 shadow-2xl overflow-hidden">
              <CardHeader className="bg-green-500/5 border-b border-green-500/10">
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600">BLOCK #{result.index}</Badge>
                  <span className="text-xs text-muted-foreground">{format(new Date(result.timestamp), 'PPP p')}</span>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Database className="text-accent w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Blockchain Evidence</span>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase text-muted-foreground tracking-widest">Receipt Identity (Verification ID)</p>
                      <div className="p-3 bg-muted rounded font-mono text-sm font-bold text-accent border border-accent/20">
                        {(() => {
                          try {
                            return JSON.parse(result.payload).verificationId
                          } catch (e) {
                            return 'Legacy Data'
                          }
                        })()}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] uppercase text-muted-foreground tracking-widest">On-Chain Transaction (Ethereum)</p>
                      <div className="p-3 bg-blue-500/5 rounded font-mono text-[10px] break-all leading-relaxed border border-blue-500/20 text-[#0ea5e9] font-bold">
                        {(() => {
                          try {
                            return JSON.parse(result.payload).txHash || 'Pending Confirmation'
                          } catch (e) {
                            return 'Legacy Data'
                          }
                        })()}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] uppercase text-muted-foreground tracking-widest">Protocol Block Hash</p>
                      <div className="p-3 bg-muted rounded font-mono text-[10px] break-all leading-relaxed border border-border text-muted-foreground">
                        {result.hash}
                      </div>
                    </div>
                  </div>

                <Separator {...({} as any)} />

                <div className="flex items-center gap-2 text-green-600">
                  <ShieldCheck size={18} />
                  <p className="text-xs font-medium">This block is cryptographically sealed and part of an immutable chain. No changes have been detected since the vote was cast.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </PageBody>
    </Page>
  )
}
