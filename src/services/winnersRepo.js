import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

import { db } from '../firebase.js'

export const WINNERS_COLLECTION = 'winners'

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase()
}

/**
 * @param {{
 *   email: string,
 *   browserId: string,
 *   memberId?: string,
 *   memberSlug?: string,
 *   milestones: Record<string, boolean>
 * }} payload
 */
export async function createWinnerEntry(payload) {
  const email = (payload?.email || '').trim()
  const browserId = (payload?.browserId || '').trim()
  if (!email || !browserId) {
    throw new Error('Email and browser ID are required to submit winner entry.')
  }

  await addDoc(collection(db, WINNERS_COLLECTION), {
    email,
    emailNormalized: normalizeEmail(email),
    browserId,
    memberId: (payload?.memberId || '').trim(),
    memberSlug: (payload?.memberSlug || '').trim(),
    milestones: payload?.milestones || {},
    createdAt: serverTimestamp(),
  })
}
