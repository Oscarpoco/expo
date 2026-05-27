const COMPETITION_STORAGE_KEY = 'wwise.competition.v1'
const COMPETITION_EVENT = 'wwise:competition-updated'

const MILESTONE_IDS = Object.freeze({
  saveContact: 'saveContact',
  downloadTraining: 'downloadTraining',
  shareLinkedIn: 'shareLinkedIn',
})

function defaultState() {
  return {
    browserId: '',
    milestones: {
      [MILESTONE_IDS.saveContact]: false,
      [MILESTONE_IDS.downloadTraining]: false,
      [MILESTONE_IDS.shareLinkedIn]: false,
    },
    entrySubmitted: false,
    winnerEmail: '',
    submittedAtIso: '',
  }
}

function readStored() {
  if (typeof window === 'undefined') return defaultState()
  const raw = window.localStorage.getItem(COMPETITION_STORAGE_KEY)
  if (!raw) return defaultState()

  try {
    const parsed = JSON.parse(raw)
    const fallback = defaultState()
    return {
      browserId:
        typeof parsed?.browserId === 'string' ? parsed.browserId : fallback.browserId,
      milestones: {
        ...fallback.milestones,
        ...(parsed?.milestones || {}),
      },
      entrySubmitted: Boolean(parsed?.entrySubmitted),
      winnerEmail:
        typeof parsed?.winnerEmail === 'string'
          ? parsed.winnerEmail
          : fallback.winnerEmail,
      submittedAtIso:
        typeof parsed?.submittedAtIso === 'string'
          ? parsed.submittedAtIso
          : fallback.submittedAtIso,
    }
  } catch {
    return defaultState()
  }
}

function writeStored(state) {
  if (typeof window === 'undefined') return state
  window.localStorage.setItem(COMPETITION_STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent(COMPETITION_EVENT, { detail: state }))
  return state
}

function createBrowserId() {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }
  return `browser-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function getCompetitionProgress() {
  const state = readStored()
  if (state.browserId) return state
  state.browserId = createBrowserId()
  return writeStored(state)
}

export function subscribeCompetitionProgress(onChange) {
  if (typeof window === 'undefined') return () => {}

  const handler = (event) => {
    if (typeof onChange === 'function') {
      onChange(event?.detail || getCompetitionProgress())
    }
  }

  const storageHandler = (event) => {
    if (event.key === COMPETITION_STORAGE_KEY) {
      onChange(getCompetitionProgress())
    }
  }

  window.addEventListener(COMPETITION_EVENT, handler)
  window.addEventListener('storage', storageHandler)

  return () => {
    window.removeEventListener(COMPETITION_EVENT, handler)
    window.removeEventListener('storage', storageHandler)
  }
}

export function markCompetitionMilestone(milestoneId) {
  if (!milestoneId) return getCompetitionProgress()
  const current = getCompetitionProgress()
  if (current.milestones[milestoneId]) return current

  const updated = {
    ...current,
    milestones: {
      ...current.milestones,
      [milestoneId]: true,
    },
  }

  return writeStored(updated)
}

export function markCompetitionEntrySubmitted(email) {
  const current = getCompetitionProgress()
  const updated = {
    ...current,
    entrySubmitted: true,
    winnerEmail: (email || '').trim(),
    submittedAtIso: new Date().toISOString(),
  }
  return writeStored(updated)
}

export { MILESTONE_IDS }
