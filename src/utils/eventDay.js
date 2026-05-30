/** Expo event calendar — local dates (month is 0-indexed). */
const EVENT_DAY_ONE = new Date(2026, 5, 2)
const EVENT_DAY_TWO = new Date(2026, 5, 3)
const EVENT_DAY_THREE = new Date(2026, 5, 4)

/**
 * @param {Date} value
 * @returns {Date}
 */
function startOfLocalDay(value) {
  const next = new Date(value)
  next.setHours(0, 0, 0, 0)
  return next
}

/**
 * @param {Date} [now]
 * @returns {{ type: 'not-started' } | { type: 'ended' } | { type: 'active', day: number }}
 */
export function getEventDayStatus(now = new Date()) {
  const today = startOfLocalDay(now).getTime()
  const firstDay = startOfLocalDay(EVENT_DAY_ONE).getTime()
  const lastDay = startOfLocalDay(EVENT_DAY_THREE).getTime()

  if (today < firstDay) {
    return { type: 'not-started' }
  }

  if (today > lastDay) {
    return { type: 'ended' }
  }

  if (today === startOfLocalDay(EVENT_DAY_ONE).getTime()) {
    return { type: 'active', day: 1 }
  }

  if (today === startOfLocalDay(EVENT_DAY_TWO).getTime()) {
    return { type: 'active', day: 2 }
  }

  return { type: 'active', day: 3 }
}
