import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'

import { db } from '../firebase.js'

export const PRIZE_WINNERS_COLLECTION = 'prizeWinners'

/**
 * @returns {Promise<Array<{
 *   id: string,
 *   memberId: string,
 *   winnerEntryId: string,
 *   email: string,
 *   referrerMemberId?: string,
 *   drawOrder: number,
 *   drawnAt?: import('firebase/firestore').Timestamp
 * }>>}
 */
export async function listAllPrizeWinners() {
  const snap = await getDocs(collection(db, PRIZE_WINNERS_COLLECTION))
  const rows = snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }))
  rows.sort((a, b) => {
    const orderDiff = asNumber(a.drawOrder) - asNumber(b.drawOrder)
    if (orderDiff !== 0) return orderDiff
    const aTime = a.drawnAt?.toDate?.()?.getTime?.() ?? 0
    const bTime = b.drawnAt?.toDate?.()?.getTime?.() ?? 0
    return aTime - bTime
  })
  return rows
}

/**
 * @param {unknown} value
 * @returns {number}
 */
function asNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

/**
 * @returns {Promise<Array<{
 *   id: string,
 *   memberId: string,
 *   winnerEntryId: string,
 *   email: string,
 *   referrerMemberId?: string,
 *   drawOrder: number,
 *   drawnAt?: import('firebase/firestore').Timestamp
 * }>>}
 */
export async function listPrizeWinnersByMemberId(memberId) {
  const memberKey = (memberId || '').trim()
  if (!memberKey) return []

  const prizeQuery = query(
    collection(db, PRIZE_WINNERS_COLLECTION),
    where('memberId', '==', memberKey),
    orderBy('drawOrder', 'asc'),
  )
  const snap = await getDocs(prizeQuery)
  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }))
}

/**
 * @param {{
 *   memberId: string,
 *   winnerEntryId: string,
 *   email: string,
 *   referrerMemberId?: string,
 *   drawOrder: number
 * }} payload
 */
export async function createPrizeWinner(payload) {
  const memberId = (payload?.memberId || '').trim()
  const winnerEntryId = (payload?.winnerEntryId || '').trim()
  const email = (payload?.email || '').trim()

  if (!memberId || !winnerEntryId || !email) {
    throw new Error('Member, winner entry, and email are required.')
  }

  await addDoc(collection(db, PRIZE_WINNERS_COLLECTION), {
    memberId,
    winnerEntryId,
    email,
    referrerMemberId: (payload?.referrerMemberId || '').trim(),
    drawOrder: payload.drawOrder,
    drawnAt: serverTimestamp(),
  })
}
