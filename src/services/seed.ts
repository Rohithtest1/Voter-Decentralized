import { blink } from '../blink/client'
import { Election, Candidate, Block } from './voting'
import { sha256 } from '../lib/crypto'

export async function seedDatabase() {
  const createGenesisBlock = async (electionId: string) => {
    const createdAt = new Date().toISOString()
    const payload = 'GENESIS_BLOCK'
    const previousHash = '0'.repeat(64)
    const blockContent = `0${createdAt}${payload}${previousHash}`
    const hash = await sha256(blockContent)

    await blink.db.table<Block>('vote_ledger').create({
      electionId,
      blockNumber: 0,
      createdAt,
      payload,
      previousHash,
      hash
    })
  }

  const electionsResult = await blink.db.table<Election>('elections').list()
  
  // If we already have elections, check if we need genesis blocks
  if (electionsResult.length > 0) {
    for (const e of electionsResult) {
      try {
        const blocks = await blink.db.table<Block>('vote_ledger').list({
          where: { electionId: e.id },
          limit: 1
        })
        if (blocks.length === 0) {
          await createGenesisBlock(e.id)
        }
      } catch (error) {
        console.log(`Table vote_ledger might not exist yet, creating genesis for ${e.id}`)
        await createGenesisBlock(e.id)
      }
    }
    return
  }

  // 1. Create the primary election from screenshots
  const election = await blink.db.table<Election>('elections').create({
    title: '2024 National Leadership Election',
    description: 'Select the next primary leaders for the national council. All votes are immutable and verified via SHA-256 blockchain.',
    startTime: new Date().toISOString(),
    endTime: '2027-01-01T00:00:00Z',
    status: 'active',
  })
  await createGenesisBlock(election.id)

  // 2. Create the candidates from screenshots
  const candidates = [
    {
      name: 'Sarah Jenkins',
      party: 'Progressive Alliance',
      photoUrl: 'sarah_jenkins_headshot_1774430814681.png'
    },
    {
      name: 'David Miller',
      party: 'Unity Coalition',
      photoUrl: 'david_miller_headshot_1774430843876.png'
    },
    {
      name: 'Elena Rodriguez',
      party: 'Independent Voice',
      photoUrl: 'elena_rodriguez_headshot_1774430871933.png'
    }
  ]

  for (const c of candidates) {
    await blink.db.table<Candidate>('candidates').create({
      ...c,
      electionId: election.id
    })
  }

  // 3. Create another election for "Total Elections: 2" and "Completed Polls: 1"
  await blink.db.table<Election>('elections').create({
    title: '2023 Municipal Vote',
    description: 'City council and municipal leadership selection.',
    startTime: '2023-01-01T00:00:00Z',
    endTime: '2023-12-31T23:59:59Z',
    status: 'closed',
  })

  console.log('Database seeded successfully')
}
