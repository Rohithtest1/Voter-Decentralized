import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blink } from '../blink/client'
import { Election, Candidate, Block, castVote, tallyElection, getAuditLogs, VoterToken, AuditLog, createElectionOnChain, addCandidateOnChain } from '../services/voting'
import { toast } from '@blinkdotnew/ui'

export function useElections() {
  const queryClient = useQueryClient()

  const { data: elections, isLoading, error } = useQuery<Election[]>({
    queryKey: ['elections'],
    queryFn: async () => {
      const result = await blink.db.table<Election>('elections').list({
        orderBy: { createdAt: 'desc' }
      })
      return result
    }
  })

  const createElectionMutation = useMutation({
    mutationFn: async (election: Partial<Election>) => {
      if (!election.title || !election.createdBy) throw new Error('Missing title or creator')
      return await createElectionOnChain(election.title, election.createdBy)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elections'] })
      toast.success('Election Protocol successfully broadcast to Smart Contract')
    }
  })

  const updateElectionStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'draft' | 'active' | 'closed' }) => {
      return await blink.db.table<Election>('elections').update(id, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elections'] })
      toast.success('Election status updated')
    }
  })

  return {
    elections: elections || [],
    isLoading,
    error,
    createElection: createElectionMutation.mutateAsync,
    updateStatus: updateElectionStatusMutation.mutateAsync,
  }
}

export function useElection(electionId: string) {
  const queryClient = useQueryClient()

  const { data: election, isLoading } = useQuery<Election>({
    queryKey: ['election', electionId],
    queryFn: async () => {
      const result = await blink.db.table<Election>('elections').get(electionId)
      return result as Election
    },
    enabled: !!electionId
  })

  const { data: candidates, isLoading: isLoadingCandidates } = useQuery<Candidate[]>({
    queryKey: ['candidates', electionId],
    queryFn: async () => {
      const result = await blink.db.table<Candidate>('candidates').list({
        where: { electionId }
      })
      return result
    },
    enabled: !!electionId
  })

  const addCandidateMutation = useMutation({
    mutationFn: async (candidate: Partial<Candidate>) => {
      if (!election?.onChainId) throw new Error('Election not synced with on-chain record')
      return await addCandidateOnChain(
        electionId, 
        election.onChainId, 
        candidate.name || 'Unknown', 
        candidate.party || 'None'
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates', electionId] })
      toast.success('Candidate registered on-chain')
    }
  })

  const publishResultsMutation = useMutation({
    mutationFn: async () => {
      return await tallyElection(electionId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['election', electionId] })
      queryClient.invalidateQueries({ queryKey: ['elections'] })
      toast.success('Results published')
    }
  })

  return {
    election,
    candidates: candidates || [],
    isLoading: isLoading || isLoadingCandidates,
    addCandidate: addCandidateMutation.mutateAsync,
    publishResults: publishResultsMutation.mutateAsync,
  }
}

export function useVoting(userId: string | undefined, electionId: string) {
  const queryClient = useQueryClient()

  const { data: tokenRecord, isLoading: isLoadingToken } = useQuery<VoterToken | undefined>({
    queryKey: ['voterToken', userId, electionId],
    queryFn: async () => {
      if (!userId) return undefined
      const list = await blink.db.table<VoterToken>('voter_tokens').list({
        where: { userId, electionId }
      })
      return list[0]
    },
    enabled: !!userId && !!electionId
  })

  const castVoteMutation = useMutation({
    mutationFn: async ({ choice }: { choice: string }) => {
      if (!userId) throw new Error('User not authenticated')
      return await castVote(userId, electionId, choice)
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['voterToken', userId, electionId] })
        queryClient.invalidateQueries({ queryKey: ['votes', electionId] })
        queryClient.invalidateQueries({ queryKey: ['blocks', electionId] })
        toast.success('Vote cast successfully!')
      } else {
        toast.error(data.error || 'Failed to cast vote')
      }
    }
  })

  return {
    voterToken: tokenRecord?.token,
    isUsed: Number(tokenRecord?.isUsed) > 0,
    isLoadingToken,
    castVote: castVoteMutation.mutateAsync,
    isCasting: castVoteMutation.isPending
  }
}

export function useBlockchainExplorer(electionId?: string) {
  const { data: blocks, isLoading } = useQuery<Block[]>({
    queryKey: ['blocks', electionId],
    queryFn: async () => {
      const allLogs = await blink.db.table<AuditLog>('audit_logs').list({
        where: { action: 'VOTE_BLOCK_COMMITTED' }
      })

      return allLogs
        .map(log => {
          try {
             const d = typeof log.details === 'string' ? JSON.parse(log.details) : log.details
             if (electionId && d.electionId !== electionId) return null
             return {
               id: log.id,
               electionId: d.electionId,
               blockNumber: d.blockNumber,
               createdAt: new Date().toISOString(),
               payload: d.payload,
               previousHash: d.previousHash,
               hash: d.hash,
               txHash: d.txHash
             } as Block
          } catch(e) { return null }
        })
        .filter((b): b is Block => b !== null)
    }
  })

  const { data: logs, isLoading: isLoadingLogs } = useQuery<AuditLog[]>({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      return await getAuditLogs()
    }
  })

  return {
    blocks: blocks || [],
    logs: logs || [],
    isLoading: isLoading || isLoadingLogs
  }
}

export function useGlobalStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['globalStats'],
    queryFn: async () => {
      const elections = await blink.db.table<Election>('elections').list()
      const votes = await blink.db.table<AuditLog>('audit_logs').list({
        where: { action: 'VOTE_CAST' }
      })
      const voters = await blink.db.table<VoterToken>('voter_tokens').list()

      return {
        totalElections: elections.length,
        totalVotes: votes.length,
        totalRegistered: voters.length,
      }
    }
  })

  return {
    stats,
    isLoading
  }
}
