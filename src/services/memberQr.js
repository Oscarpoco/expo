import { buildMemberProfilePath } from '../utils/memberSlug.js'
import { getPublicAppOrigin } from '../utils/publicAppUrl.js'

/**
 * HTTPS URL encoded in the member QR — opens the public profile when scanned.
 *
 * @param {string} profileSlug
 * @returns {string}
 */
export function buildMemberQrPayload(profileSlug) {
  const origin = getPublicAppOrigin()
  const path = buildMemberProfilePath(profileSlug)
  return origin ? `${origin}${path}` : path
}

/**
 * Legacy custom-scheme payloads and plain paths still resolve to a slug or id.
 *
 * @param {string} raw
 * @returns {string|null}
 */
export function parseMemberQrTarget(raw) {
  const value = (raw || '').trim()
  if (!value) return null

  const legacy = value.match(/^wwise-expo:\/\/member\/([^/?#]+)/i)
  if (legacy) return legacy[1]

  try {
    const asUrl = new URL(value)
    const segment = asUrl.pathname.replace(/^\/+|\/+$/g, '').split('/')[0]
    return segment || null
  } catch {
    const pathSegment = value.replace(/^\/+|\/+$/g, '').split('/')[0]
    return pathSegment || null
  }
}
