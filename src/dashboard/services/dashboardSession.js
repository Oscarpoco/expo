import { normalizeMemberEmail } from '../../services/membersRepo.js'

const SESSION_KEY = 'wwise.dashboard.session'
const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000

/**
 * @returns {{ memberId: string, email: string, fullName: string, loggedInAt: number } | null}
 */
export function readDashboardSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (
      !parsed?.memberId ||
      !parsed?.email ||
      typeof parsed.loggedInAt !== 'number'
    ) {
      clearDashboardSession()
      return null
    }
    if (Date.now() - parsed.loggedInAt > SESSION_MAX_AGE_MS) {
      clearDashboardSession()
      return null
    }
    if (!isDashboardAdminEmail(parsed.email)) {
      clearDashboardSession()
      return null
    }
    return parsed
  } catch {
    clearDashboardSession()
    return null
  }
}

/**
 * @param {{ id: string, email: string, fullName?: string }} member
 */
export function saveDashboardSession(member) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      memberId: member.id,
      email: member.email,
      fullName: member.fullName || '',
      loggedInAt: Date.now(),
    }),
  )
}

export function clearDashboardSession() {
  localStorage.removeItem(SESSION_KEY)
}

/**
 * @param {string} email
 */
export function isDashboardAdminEmail(email) {
  const adminEmail = normalizeMemberEmail(
    import.meta.env.VITE_ANALYTICS_ADMIN_EMAIL ?? '',
  )
  if (!adminEmail) return false
  return normalizeMemberEmail(email) === adminEmail
}
