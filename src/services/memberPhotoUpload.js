import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

import { storage } from '../firebase.js'

export const PROFILE_PHOTO_MAX_BYTES = 2 * 1024 * 1024 // 2 MiB

const ALLOWED_IMAGE_TYPES = /^image\/(jpeg|jpg|png|webp)$/i

/**
 * Upload a member profile photo. Caller must authenticate (e.g. anonymous) first.
 *
 * @param {File} file
 * @param {string} [memberCodeHint]
 * @returns {Promise<string>} download URL
 */
export async function uploadMemberProfilePhoto(file, memberCodeHint = '') {
  if (!(file instanceof File)) {
    throw new Error('Invalid file.')
  }
  if (!ALLOWED_IMAGE_TYPES.test(file.type || '')) {
    throw new Error('Use JPG, PNG, or WebP for your photo.')
  }
  if (file.size > PROFILE_PHOTO_MAX_BYTES) {
    throw new Error('Photo must be 2 MB or smaller.')
  }

  const ext =
    file.type === 'image/png'
      ? 'png'
      : file.type === 'image/webp'
        ? 'webp'
        : 'jpg'

  const safe = String(memberCodeHint || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 32) || 'new'

  const path = `memberProfilePhotos/${safe}_${crypto.randomUUID()}.${ext}`
  const r = ref(storage, path)

  await uploadBytes(r, file, { contentType: file.type })

  return getDownloadURL(r)
}

export function validateProfilePhotoFile(file) {
  if (!file || !(file instanceof File)) return 'Choose an image file.'
  if (!ALLOWED_IMAGE_TYPES.test(file.type || '')) {
    return 'Use JPG, PNG, or WebP.'
  }
  if (file.size > PROFILE_PHOTO_MAX_BYTES) {
    return 'Photo must be 2 MB or smaller.'
  }
  return null
}
