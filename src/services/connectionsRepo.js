import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'

import { db } from '../firebase.js'

export const CONNECTIONS_COLLECTION = 'connections'
export const MEMBER_CONNECTION_STATS_COLLECTION = 'memberConnectionStats'

/**
 * @param {{
 *   memberId: string,
 *   memberSlug?: string,
 *   memberName?: string
 * }} payload
 */
export async function incrementAnonymousConnection(payload) {
  const memberId = (payload?.memberId || '').trim()
  if (!memberId) return

  await setDoc(
    doc(db, MEMBER_CONNECTION_STATS_COLLECTION, memberId),
    {
      memberId,
      memberSlug: (payload?.memberSlug || '').trim(),
      memberName: (payload?.memberName || '').trim(),
      anonymousCount: increment(1),
      totalCount: increment(1),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

/**
 * @param {{
 *   memberId: string,
 *   memberSlug?: string,
 *   memberName?: string
 * }} payload
 */
export async function incrementKnownConnection(payload) {
  const memberId = (payload?.memberId || '').trim()
  if (!memberId) return

  await setDoc(
    doc(db, MEMBER_CONNECTION_STATS_COLLECTION, memberId),
    {
      memberId,
      memberSlug: (payload?.memberSlug || '').trim(),
      memberName: (payload?.memberName || '').trim(),
      knownCount: increment(1),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

/**
 * @param {{
 *   memberId: string,
 *   memberSlug?: string,
 *   memberName?: string,
 *   fullName: string,
 *   email: string,
 *   contactNumber: string,
 *   companyName: string,
 *   areaOfInterest: string
 * }} payload
 */
export async function createConnectionRecord(payload) {
  await addDoc(collection(db, CONNECTIONS_COLLECTION), {
    memberId: (payload?.memberId || '').trim(),
    memberSlug: (payload?.memberSlug || '').trim(),
    memberName: (payload?.memberName || '').trim(),
    fullName: (payload?.fullName || '').trim(),
    email: (payload?.email || '').trim(),
    contactNumber: (payload?.contactNumber || '').trim(),
    companyName: (payload?.companyName || '').trim(),
    areaOfInterest: (payload?.areaOfInterest || '').trim(),
    createdAt: serverTimestamp(),
  })
}

/**
 * @param {string} memberId
 * @returns {Promise<Array<{ id: string, fullName?: string, email?: string, contactNumber?: string, companyName?: string, areaOfInterest?: string, createdAt?: import('firebase/firestore').Timestamp }>>}
 */
export async function listConnectionsByMemberId(memberId) {
  const id = (memberId || '').trim()
  if (!id) return []

  const connectionsQuery = query(
    collection(db, CONNECTIONS_COLLECTION),
    where('memberId', '==', id),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(connectionsQuery)
  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }))
}
