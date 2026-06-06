import { collection, getDocs } from 'firebase/firestore'

import { db } from '../firebase.js'
import { listAllConnections, MEMBER_CONNECTION_STATS_COLLECTION } from './connectionsRepo.js'
import { MEMBERS_COLLECTION } from './membersRepo.js'
import { listWinnerEntries } from './winnersRepo.js'
import { listAllPrizeWinners } from './prizeWinnersRepo.js'

/**
 * @returns {Promise<Array<Record<string, unknown> & { id: string }>>}
 */
export async function listAllMembers() {
  const snap = await getDocs(collection(db, MEMBERS_COLLECTION))
  const rows = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
  rows.sort((a, b) => {
    const aTime = a.createdAt?.toDate?.()?.getTime?.() ?? 0
    const bTime = b.createdAt?.toDate?.()?.getTime?.() ?? 0
    return bTime - aTime
  })
  return rows
}

/**
 * @returns {Promise<Array<Record<string, unknown> & { id: string }>>}
 */
export async function listAllMemberConnectionStats() {
  const snap = await getDocs(collection(db, MEMBER_CONNECTION_STATS_COLLECTION))
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
}

/**
 * @returns {Promise<{
 *   members: Array<Record<string, unknown> & { id: string }>,
 *   connections: Array<Record<string, unknown> & { id: string }>,
 *   stats: Array<Record<string, unknown> & { id: string }>,
 *   winners: Array<Record<string, unknown> & { id: string }>,
 *   prizeWinners: Array<Record<string, unknown> & { id: string }>,
 *   fetchedAt: number
 * }>}
 */
export async function fetchDashboardDataset() {
  const [members, connections, stats, winners, prizeWinners] = await Promise.all([
    listAllMembers(),
    listAllConnections(),
    listAllMemberConnectionStats(),
    listWinnerEntries(),
    listAllPrizeWinners(),
  ])

  return {
    members,
    connections,
    stats,
    winners,
    prizeWinners,
    fetchedAt: Date.now(),
  }
}
