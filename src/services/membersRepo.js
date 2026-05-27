import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'

import { db } from '../firebase.js'
import {
  buildProfileSlug,
  normalizeProfileSlug,
  profileSlugLookupVariants,
  profileSlugToEmail,
} from '../utils/memberSlug.js'

export const MEMBERS_COLLECTION = 'members'

/**
 * @param {string} email
 * @returns {string}
 */
export function normalizeMemberEmail(email) {
  return (email || '').trim().toLowerCase()
}

/**
 * Digits-only for duplicate phone checks (handles spaces, symbols, prefixes).
 *
 * @param {string} phone
 * @returns {string}
 */
export function normalizeMemberPhoneDigits(phone) {
  return (phone || '').replace(/\D/g, '')
}

/**
 * Snapshot shape returned to UI (includes Firestore doc id).
 * @typedef {Object} Member
 * @property {string} id
 * @property {string} memberCode
 * @property {string} fullName
 * @property {string} roleTitle
 * @property {string} companyName
 * @property {string} phoneNumber
 * @property {string} email
 * @property {string} website
 * @property {string} linkedInUrl
 * @property {string} whatsAppLink
 * @property {string} companyAddress
 * @property {string} [profilePhotoUrl]
 * @property {string} [bio]
 * @property {string} [profileSlug]
 */

/**
 * @param {string} memberCode
 * @returns {Promise<Member|null>}
 */
export async function findMemberByCode(memberCode) {
  const code = memberCode.trim()
  if (!code) return null

  const q = query(
    collection(db, MEMBERS_COLLECTION),
    where('memberCode', '==', code),
    limit(1),
  )
  const snap = await getDocs(q)
  if (snap.empty) return null

  const docSnap = snap.docs[0]
  return hydrateMember(docSnap.id, docSnap.data())
}

/**
 * @param {string} memberId
 * @returns {Promise<Member|null>}
 */
export async function findMemberById(memberId) {
  const id = (memberId || '').trim()
  if (!id) return null

  const snap = await getDoc(doc(db, MEMBERS_COLLECTION, id))
  if (!snap.exists()) return null
  return hydrateMember(snap.id, snap.data())
}

export async function findMemberByEmail(email) {
  const norm = normalizeMemberEmail(email)
  const trimmed = (email || '').trim()
  if (!norm && !trimmed) return null

  const values = [...new Set([norm, trimmed].filter(Boolean))]

  for (const value of values) {
    for (const field of ['emailNormalized', 'email']) {
      const q = query(
        collection(db, MEMBERS_COLLECTION),
        where(field, '==', value),
        limit(1),
      )
      const snap = await getDocs(q)
      if (!snap.empty) {
        const docSnap = snap.docs[0]
        return hydrateMember(docSnap.id, docSnap.data())
      }
    }
  }

  return null
}

/**
 * @param {string} profileSlug
 * @returns {Promise<Member|null>}
 */
export async function findMemberBySlug(profileSlug) {
  const variants = profileSlugLookupVariants(profileSlug)
  if (!variants.length) return null

  for (const slug of variants) {
    const q = query(
      collection(db, MEMBERS_COLLECTION),
      where('profileSlug', '==', slug),
      limit(1),
    )
    const snap = await getDocs(q)
    if (!snap.empty) {
      const docSnap = snap.docs[0]
      return hydrateMember(docSnap.id, docSnap.data())
    }
  }

  for (const variant of variants) {
    const email = profileSlugToEmail(variant)
    if (email) {
      const byEmail = await findMemberByEmail(email)
      if (byEmail) return byEmail
    }
  }

  const canonical = normalizeProfileSlug(profileSlug)
  if (canonical) {
    return findMemberById(canonical)
  }

  return null
}

/**
 * @param {string} id
 * @param {Record<string, unknown>} data
 * @returns {Member}
 */
function hydrateMember(id, data) {
  const fullName = typeof data.fullName === 'string' ? data.fullName : ''
  const memberCode = typeof data.memberCode === 'string' ? data.memberCode : ''
  const email = typeof data.email === 'string' ? data.email : ''
  const storedSlug =
    typeof data.profileSlug === 'string' ? data.profileSlug.trim() : ''
  const canonicalFromEmail = buildProfileSlug(email, fullName, memberCode)
  const profileSlug = storedSlug
    ? normalizeProfileSlug(storedSlug) || canonicalFromEmail
    : canonicalFromEmail

  return {
    id,
    ...data,
    profileSlug,
  }
}

/**
 * Returns whether email or phone is already used by any member document.
 * Checks normalized fields (new records) and raw email / phone (legacy records).
 *
 * @param {{ email: string, phoneNumber: string }} params
 * @returns {Promise<{ emailTaken: boolean, phoneTaken: boolean }>}
 */
export async function checkMemberContactAvailability({
  email,
  phoneNumber,
}) {
  const emailNorm = normalizeMemberEmail(email)
  const phoneRaw = (phoneNumber || '').trim()
  const phoneDigits = normalizeMemberPhoneDigits(phoneNumber)

  const emailQueries = [
    query(
      collection(db, MEMBERS_COLLECTION),
      where('emailNormalized', '==', emailNorm),
      limit(1),
    ),
    query(
      collection(db, MEMBERS_COLLECTION),
      where('email', '==', emailNorm),
      limit(1),
    ),
    query(
      collection(db, MEMBERS_COLLECTION),
      where('email', '==', (email || '').trim()),
      limit(1),
    ),
  ]

  const phoneQueries = []
  if (phoneDigits.length >= 6) {
    phoneQueries.push(
      query(
        collection(db, MEMBERS_COLLECTION),
        where('phoneDigits', '==', phoneDigits),
        limit(1),
      ),
    )
  }
  if (phoneRaw) {
    phoneQueries.push(
      query(
        collection(db, MEMBERS_COLLECTION),
        where('phoneNumber', '==', phoneRaw),
        limit(1),
      ),
    )
  }

  const [emailSnaps, phoneSnaps] = await Promise.all([
    Promise.all(emailQueries.map((q) => getDocs(q))),
    phoneQueries.length
      ? Promise.all(phoneQueries.map((q) => getDocs(q)))
      : Promise.resolve([]),
  ])

  const emailTaken = emailSnaps.some((s) => !s.empty)
  const phoneTaken = phoneSnaps.some((s) => !s.empty)

  return { emailTaken, phoneTaken }
}

/**
 * @param {Omit<Member, 'id'> & { memberCode: string, bio?: string, profilePhotoUrl?: string }} data
 * @returns {Promise<string>} new document id
 */
export async function createMemberRecord(data) {
  const emailNorm = normalizeMemberEmail(data.email)
  const phoneDigits = normalizeMemberPhoneDigits(data.phoneNumber)
  const profileSlug = buildProfileSlug(
    data.email,
    data.fullName,
    data.memberCode,
  )

  const payload = {
    memberCode: data.memberCode.trim(),
    profileSlug,
    fullName: data.fullName.trim(),
    roleTitle: data.roleTitle.trim(),
    companyName: data.companyName.trim(),
    phoneNumber: data.phoneNumber.trim(),
    email: data.email.trim(),
    emailNormalized: emailNorm,
    phoneDigits,
    website: data.website.trim(),
    linkedInUrl: data.linkedInUrl.trim(),
    whatsAppLink: data.whatsAppLink.trim(),
    companyAddress: data.companyAddress.trim(),
    bio: typeof data.bio === 'string' ? data.bio.trim() : '',
    createdAt: serverTimestamp(),
  }

  if (data.profilePhotoUrl && String(data.profilePhotoUrl).trim()) {
    payload.profilePhotoUrl = String(data.profilePhotoUrl).trim()
  }

  const ref = await addDoc(collection(db, MEMBERS_COLLECTION), payload)
  return ref.id
}

/**
 * Ensures the public profile slug is stored for QR / deep links.
 *
 * @param {string} memberId
 * @param {string} profileSlug
 */
export async function persistMemberProfileSlug(memberId, profileSlug) {
  const id = (memberId || '').trim()
  const slug = normalizeProfileSlug(profileSlug)
  if (!id || !slug) return

  await updateDoc(doc(db, MEMBERS_COLLECTION, id), { profileSlug: slug })
}
