import { Card, CardContent, Badge } from '@blinkdotnew/ui'
import { Box, CheckCircle2, Link as LinkIcon, ShieldCheck } from 'lucide-react'
import { format } from 'date-fns'

import type { Block } from '../../services/voting'

interface BlockCardProps {
  block: Block;
  isFirst: boolean;
  isLast: boolean;
}

export function BlockCard({ block, isFirst, isLast }: BlockCardProps) {
  return (
    <div className="relative group flex items-start sm:block">
      {/* Mobile Timeline Connector */}
      {!isLast && (
        <div className="absolute left-[1.3rem] top-12 bottom-[-1rem] w-0.5 bg-border/40 sm:hidden" />
      )}
      
      {/* Mobile Icon */}
      <div className="sm:hidden relative z-10 shrink-0 mt-2 mr-4 bg-background p-1">
        <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
          {isFirst ? <Box size={14} /> : <LinkIcon size={14} />}
        </div>
      </div>

      <Card className={`relative overflow-hidden transition-all duration-300 w-full hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 bg-card ${isFirst ? 'ring-2 ring-primary/20 shadow-lg shadow-primary/10' : ''}`}>
        
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-[100px] -mr-16 -mt-16 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
        
        <CardContent className="p-0 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-4 sm:p-0">
            {/* Desktop Center Icon (Absolute) */}
            <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 -ml-[1px] w-12 h-12 rounded-full bg-background border-4 border-border/40 items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all z-20 shadow-sm">
              <Box className={`w-5 h-5 ${isFirst ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant={isFirst ? "default" : "secondary"} className="h-6 px-2 font-mono font-bold tracking-widest text-xs">
                  BLOCK #{block.blockNumber}
                </Badge>
                {isFirst && (
                  <Badge variant="outline" className="h-6 bg-green-500/10 text-green-600 border-green-500/20 gap-1 font-bold text-[10px] uppercase tracking-widest">
                    <CheckCircle2 size={10} /> Latest Verify
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground ml-auto hidden sm:block">
                  {format(new Date(block.createdAt), 'MMM d, yyyy HH:mm:ss')}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-muted/30 rounded-xl border border-border/40 group-hover:border-primary/20 transition-colors">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Block Hash</span>
                  </div>
                  <div className="font-mono text-xs break-all text-primary/80 font-medium leading-relaxed">
                    {block.hash}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-4 pt-4 sm:pt-0 border-t border-border/40 sm:border-0">
              <span className="text-xs text-muted-foreground sm:hidden block mb-4">
                {format(new Date(block.createdAt), 'MMM d, yyyy HH:mm:ss')}
              </span>
              
              <div className="p-3 bg-muted/10 rounded-xl border border-border/20">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Previous Block Link</span>
                  <LinkIcon size={12} className="text-muted-foreground/60" />
                </div>
                <div className="font-mono text-xs break-all text-muted-foreground/80 leading-relaxed">
                  {block.blockNumber === 0 ? <span className="text-green-500/60 font-bold italic">GENESIS BLOCK</span> : block.previousHash}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2.5 bg-green-500/5 rounded-lg border border-green-500/10">
                <div className="flex items-center gap-2 text-green-600">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted Payload</span>
                </div>
                <Badge variant="outline" className="text-[8px] h-4 bg-background border-green-500/20 text-green-600/60 font-mono">
                  AES-256
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
