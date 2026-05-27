import { useEffect, useMemo, useState } from 'react'
import './PlaceholderTab.css'
import {
  MILESTONE_IDS,
  getCompetitionProgress,
  markCompetitionEntrySubmitted,
  markCompetitionMilestone,
  subscribeCompetitionProgress,
} from '../services/competitionProgress.js'
import { createWinnerEntry } from '../../services/winnersRepo.js'

const LINKEDIN_URL = 'https://www.linkedin.com/'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function CompetitionTab({ member }) {
  const [progress, setProgress] = useState(() => getCompetitionProgress())
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    return subscribeCompetitionProgress((next) => setProgress(next))
  }, [])

  const milestones = useMemo(
    () => [
      {
        id: MILESTONE_IDS.saveContact,
        title: 'Save the Contact to your phone',
      },
      {
        id: MILESTONE_IDS.downloadTraining,
        title: 'Download the Training Schedule',
      },
      {
        id: MILESTONE_IDS.shareLinkedIn,
        title: 'Share any of our posts on LinkedIn',
      },
    ],
    [],
  )

  const completedCount = milestones.filter(
    (item) => progress.milestones[item.id],
  ).length
  const allDone = completedCount === milestones.length
  const hasSubmitted = progress.entrySubmitted
  const showPopup = allDone && !hasSubmitted

  async function handleSubmitWinner(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const trimmedEmail = email.trim()
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError('Enter a valid email address before submitting.')
      return
    }

    if (progress.entrySubmitted) {
      setError('This browser has already submitted a competition entry.')
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
      markCompetitionEntrySubmitted(trimmedEmail)
      setSuccess('Entry submitted successfully. Good luck!')
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

              {item.id === MILESTONE_IDS.shareLinkedIn ? (
                <div className="competition-tab__actions">
                  <a
                    className="ghost-btn competition-tab__action-btn"
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open LinkedIn
                  </a>
                  <button
                    type="button"
                    className="primary-btn competition-tab__action-btn"
                    onClick={() => markCompetitionMilestone(item.id)}
                    disabled={done}
                  >
                    {done ? 'Done' : 'Mark as completed'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="ghost-btn competition-tab__action-btn"
                  onClick={() => markCompetitionMilestone(item.id)}
                  disabled={done}
                >
                  {done ? 'Done' : 'Mark as completed'}
                </button>
              )}
            </li>
          )
        })}
      </ol>

      <p className="competition-tab__progress">
        Progress: {completedCount}/3 milestones completed
      </p>

      {hasSubmitted ? (
        <p className="competition-tab__submitted">
          This browser has already entered the competition with{' '}
          {progress.winnerEmail || 'a submitted email'}.
        </p>
      ) : null}

      {showPopup ? (
        <div className="competition-popup" role="dialog" aria-modal="true">
          <div className="competition-popup__panel">
            <h3>
              Congratulations you have entered the competition to win prizes
            </h3>
            <p>
              Submit your email below to complete your entry. One entry is
              allowed per browser.
            </p>

            <form
              className="competition-popup__form"
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
        </div>
      ) : null}
    </section>
  )
}
