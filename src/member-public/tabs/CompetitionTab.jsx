import { useCallback, useEffect, useMemo, useState } from 'react'
import './PlaceholderTab.css'
import {
  MILESTONE_IDS,
  getCompetitionProgress,
  hasSubmittedEmail,
  markCompetitionMilestone,
  recordCompetitionEntry,
  subscribeCompetitionProgress,
} from '../services/competitionProgress.js'
import { createWinnerEntry } from '../../services/winnersRepo.js'
import { buildMemberProfilePath } from '../../utils/memberSlug.js'
import { getPublicAppOrigin } from '../../utils/publicAppUrl.js'
import { buildMemberVCard, downloadVCard } from '../../utils/vCard.js'

const LINKEDIN_FALLBACK_URL = 'https://www.linkedin.com/'
const SCHEDULE_PDF_PATH = '/training.pdf'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * @param {string} url
 * @returns {string}
 */
function normalizeExternalUrl(url) {
  const trimmed = (url || '').trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function CompetitionTab({ member }) {
  const [progress, setProgress] = useState(() => getCompetitionProgress())
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    return subscribeCompetitionProgress((next) => setProgress(next))
  }, [])

  const profileUrl = useMemo(() => {
    const origin = getPublicAppOrigin()
    const path = buildMemberProfilePath(member?.profileSlug || member?.id || '')
    return origin ? `${origin}${path}` : path
  }, [member?.id, member?.profileSlug])

  const handleSaveContact = useCallback(() => {
    if (!member) return
    const vCard = buildMemberVCard({
      fullName: member.fullName,
      roleTitle: member.roleTitle,
      companyName: member.companyName,
      phoneNumber: member.phoneNumber,
      email: member.email,
      website: member.website,
      companyAddress: member.companyAddress,
      bio: member.bio,
      profileUrl,
    })
    downloadVCard(vCard, member.profileSlug || member.fullName || 'contact')
    markCompetitionMilestone(MILESTONE_IDS.saveContact)
  }, [member, profileUrl])

  const handleDownloadSchedule = useCallback(() => {
    const anchor = document.createElement('a')
    anchor.href = SCHEDULE_PDF_PATH
    anchor.download = 'training.pdf'
    anchor.rel = 'noopener'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    markCompetitionMilestone(MILESTONE_IDS.downloadTraining)
  }, [])

  const handleOpenLinkedIn = useCallback(() => {
    const target =
      normalizeExternalUrl(member?.linkedInUrl) || LINKEDIN_FALLBACK_URL
    window.open(target, '_blank', 'noopener,noreferrer')
    markCompetitionMilestone(MILESTONE_IDS.shareLinkedIn)
  }, [member?.linkedInUrl])

  const milestones = useMemo(
    () => [
      {
        id: MILESTONE_IDS.saveContact,
        title: 'Save the Contact to your phone',
        actionLabel: 'Save Contact',
        doneLabel: 'Save Contact again',
        onAction: handleSaveContact,
      },
      {
        id: MILESTONE_IDS.downloadTraining,
        title: 'Download the Training Schedule',
        actionLabel: 'Download Schedule',
        doneLabel: 'Download Schedule again',
        onAction: handleDownloadSchedule,
      },
      {
        id: MILESTONE_IDS.shareLinkedIn,
        title: 'Open our LinkedIn and engage',
        actionLabel: 'Open LinkedIn',
        doneLabel: 'Done',
        onAction: handleOpenLinkedIn,
        lockWhenDone: true,
      },
    ],
    [handleSaveContact, handleDownloadSchedule, handleOpenLinkedIn],
  )

  const completedCount = milestones.filter(
    (item) => progress.milestones[item.id],
  ).length
  const allDone = completedCount === milestones.length
  const hasEntered = Boolean(progress.entrySubmitted)

  async function handleSubmitWinner(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const trimmedEmail = email.trim()
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError('Enter a valid email address before submitting.')
      return
    }

    if (hasSubmittedEmail(trimmedEmail)) {
      setError('This email has already entered the competition.')
      return
    }

    setBusy(true)
    try {
      await createWinnerEntry({
        email: trimmedEmail,
        browserId: progress.browserId,
        memberId: member?.id,
        memberSlug: member?.profileSlug || member?.id,
        milestones: progress.milestones,
      })
      recordCompetitionEntry(trimmedEmail)
      setSuccess(
        'Entry submitted — a confirmation email is on its way. Good luck!',
      )
      setEmail('')
    } catch (submitError) {
      const message =
        typeof submitError?.message === 'string'
          ? submitError.message
          : 'Could not submit your entry right now. Please try again.'
      setError(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="competition-tab">
      <h2>Competitions</h2>
      <p className="competition-tab__lead">
        Complete these milestones to win prizes.
      </p>
      <p className="competition-tab__detail">
        Finish all 3 steps to qualify, submit your email, and confirm your
        competition entry.
      </p>

      <ol className="competition-tab__milestones">
        {milestones.map((item, index) => {
          const done = Boolean(progress.milestones[item.id])
          const lockedDone = done && item.lockWhenDone
          return (
            <li
              key={item.id}
              className={`competition-tab__milestone${
                done ? ' competition-tab__milestone--done' : ''
              }`}
            >
              <div className="competition-tab__milestone-main">
                <p className="competition-tab__milestone-title">
                  {index + 1}/3 - {item.title}
                </p>
                <p className="competition-tab__milestone-state">
                  {done ? 'Completed' : 'Pending'}
                </p>
              </div>

              <button
                type="button"
                className={`${done ? 'ghost-btn' : 'primary-btn'} competition-tab__action-btn`}
                onClick={item.onAction}
                disabled={lockedDone}
              >
                {done ? item.doneLabel : item.actionLabel}
              </button>
            </li>
          )
        })}
      </ol>

      <p className="competition-tab__progress">
        Progress: {completedCount}/3 milestones completed
      </p>

      {!allDone ? null : hasEntered ? (
        <div className="competition-entry-card competition-entry-card--thanks">
          <h3>Thank you for entering!</h3>
          <p>
            Your competition entry is confirmed and a confirmation email has
            been sent. See you next time!
          </p>
        </div>
      ) : (
        <div className="competition-entry-card">
          <h3>
            Congratulations you have entered the competition to win prizes
          </h3>
          <p>Submit your email below to complete your entry.</p>

          <form
            className="competition-entry-card__form"
            onSubmit={handleSubmitWinner}
          >
            <label className="field-label" htmlFor="competition-email">
              Email address
            </label>
            <input
              id="competition-email"
              className="text-input text-input--tall"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              autoComplete="email"
              required
              disabled={busy}
            />

            {error ? <p className="form-error">{error}</p> : null}
            {success ? (
              <p className="competition-tab__success" role="status">
                {success}
              </p>
            ) : null}

            <button type="submit" className="primary-btn" disabled={busy}>
              {busy ? 'Submitting...' : 'Submit entry'}
            </button>
          </form>
        </div>
      )}
    </section>
  )
}
