import { Page, PageHeader, PageTitle, PageDescription, PageBody, Card, CardHeader, CardTitle, CardContent, Badge, Button, EmptyState } from '@blinkdotnew/ui'
import { useElections } from '../hooks/useElectionData'
import { Vote, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'

export default function ElectionsPage() {
  const { elections, isLoading } = useElections()

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )

  const activeElections = elections.filter(e => e.status === 'active')
  const closedElections = elections.filter(e => e.status === 'closed')

  return (
    <Page>
      <PageHeader>
        <PageTitle>Active Elections</PageTitle>
        <PageDescription>Browse current elections and cast your vote securely via blockchain integration.</PageDescription>
      </PageHeader>
      <PageBody className="space-y-12">
        {/* Active Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Vote className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold">Currently Active</h2>
          </div>
          {activeElections.length === 0 ? (
            <EmptyState icon={<AlertCircle />} title="No Elections Running" description="There are currently no elections open for voting. Please check the upcoming list." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeElections.map(election => (
                <Card key={election.id} className="hover:border-accent/50 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="bg-accent/10 text-accent font-bold">OPEN</Badge>
                    </div>
                    <CardTitle className="text-lg font-bold">{election.title}</CardTitle>
                    <p className="text-xs text-muted-foreground line-clamp-2">{election.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock size={14} />
                      <span>Ends {format(new Date(election.endTime), 'PPP')}</span>
                    </div>
                    <Link to="/elections/$electionId" params={{ electionId: election.id }}>
                      <Button className="w-full bg-accent text-accent-foreground">Cast Vote</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Closed/Results Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-bold">Past & Closed</h2>
          </div>
          {closedElections.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No historical elections found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80 hover:opacity-100 transition-opacity">
              {closedElections.map(election => (
                <Card key={election.id} className="bg-muted/50 border-muted">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-muted-foreground uppercase font-bold">CLOSED</Badge>
                    </div>
                    <CardTitle className="text-lg font-bold">{election.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock size={14} />
                      <span>Ended {format(new Date(election.endTime), 'PPP')}</span>
                    </div>
                    <Link to="/elections/$electionId" params={{ electionId: election.id }}>
                      <Button variant="outline" className="w-full">View Results</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </PageBody>
    </Page>
  )
}
