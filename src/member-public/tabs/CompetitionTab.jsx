import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FaLinkedinIn,
  FaXTwitter,
  FaInstagram,
  FaFacebookF,
} from 'react-icons/fa6'
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

const SCHEDULE_PDF_PATH = '/training.pdf'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const SOCIAL_LINKS = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/company/wwise/posts/?feedView=all',
    Icon: FaLinkedinIn,
  },
  {
    id: 'x',
    label: 'X',
    url: 'https://x.com/wwiseofficial',
    Icon: FaXTwitter,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    url: 'https://www.instagram.com/wwise_sa',
    Icon: FaInstagram,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    url: 'https://web.facebook.com/WorldWideIndustrialandSystemsEngineers',
    Icon: FaFacebookF,
  },
]

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

  const handleOpenSocial = useCallback((url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
    markCompetitionMilestone(MILESTONE_IDS.shareLinkedIn)
  }, [])

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
        title: 'Follow or engage with us on social media',
        type: 'social',
      },
    ],
    [handleSaveContact, handleDownloadSchedule],
  )

  const completedCount = milestones.filter(
    (item) => progress.milestones[item.id],
  ).length
  const allDone = completedCount === milestones.length
  const hasEntered = Boolean(progress.entrySubmitted)

  const entryRef = useRef(null)

  useEffect(() => {
    if (!allDone) return
    const id = window.setTimeout(() => {
      entryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 120)
    return () => window.clearTimeout(id)
  }, [allDone, hasEntered])

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

              {item.type === 'social' ? (
                <div
                  className="competition-tab__socials"
                  role="group"
                  aria-label="Open a WWISE social channel to complete this step"
                >
                  {SOCIAL_LINKS.map((social) => (
                    <button
                      key={social.id}
                      type="button"
                      className="competition-tab__social"
                      onClick={() => handleOpenSocial(social.url)}
                      aria-label={`Open WWISE ${social.label}`}
                    >
                      <social.Icon aria-hidden />
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  className={`${done ? 'ghost-btn' : 'primary-btn'} competition-tab__action-btn`}
                  onClick={item.onAction}
                >
                  {done ? item.doneLabel : item.actionLabel}
                </button>
              )}
            </li>
          )
        })}
      </ol>

      <p className="competition-tab__progress">
        Progress: {completedCount}/3 milestones completed
      </p>

      {!allDone ? null : hasEntered ? (
        <div
          ref={entryRef}
          className="competition-entry-card competition-entry-card--thanks"
        >
          <h3>Thank you for entering!</h3>
          <p>
            Your competition entry is confirmed and a confirmation email has
            been sent. See you next time!
          </p>
        </div>
      ) : (
        <div ref={entryRef} className="competition-entry-card">
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
