import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

import { db } from '../firebase.js'

export const QR_CODES_COLLECTION = 'qrCodes'

/**
 * Persist metadata for generated member QR payloads.
 *
 * @param {{ memberId: string, qrValue: string }} param
 */
export async function saveQrCodeRecord({ memberId, qrValue }) {
  await addDoc(collection(db, QR_CODES_COLLECTION), {
    memberId,
    qrValue,
    createdAt: serverTimestamp(),
  })
}
