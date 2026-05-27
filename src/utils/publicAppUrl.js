/**
 * Canonical public site origin for QR links (production domain).
 * Falls back to the current browser origin during local dev.
 *
 * @returns {string}
 */
export function getPublicAppOrigin() {
  const fromEnv = import.meta.env.VITE_APP_PUBLIC_URL
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.trim().replace(/\/+$/, '')
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }

  return ''
}
