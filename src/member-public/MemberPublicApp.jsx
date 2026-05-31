import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MdClose, MdOutlineLocationOn } from 'react-icons/md'

import { CircuitFrame } from '../components/CircuitFrame.jsx'
import { Toast } from '../components/Toast.jsx'
import {
  BRAND_ENGINEERING_LOCKUP,
  BRAND_MISSION_TAGLINE,
  CONNECT_AREA_OF_INTEREST_OPTIONS,
  EXPO_CONNECT_LINE,
  EXPO_SHORT_LABEL,
  PLACEHOLDER_COMPANY_ADDRESS,
} from '../constants/companyDefaults.js'
import { findMemberBySlug } from '../services/membersRepo.js'
import {
  createConnectionRecord,
  incrementAnonymousConnection,
  incrementKnownConnection,
} from '../services/connectionsRepo.js'
import { signInMemberSession } from '../services/sessionAuth.js'
import { ContactTab } from './tabs/ContactTab.jsx'
import { CategoriesTab } from './tabs/CategoriesTab.jsx'
import { ScheduleTab } from './tabs/ScheduleTab.jsx'
import { CompetitionTab } from './tabs/CompetitionTab.jsx'
import logo from '../assets/logo.png'

import '../App.css'
import '../styles/forms.css'
import './MemberPublicApp.css'

const TAB = Object.freeze({
  contact: 'contact',
  categories: 'categories',
  schedule: 'schedule',
  competition: 'competition',
})

const TAB_MENU = [
  { id: TAB.contact, label: 'Contact' },
  { id: TAB.categories, label: 'Catalogues' },
  { id: TAB.schedule, label: 'Schedule' },
  { id: TAB.competition, label: 'Competition' },
]

function seenPromptKey(memberId) {
  return `wwise.connect.seen.${memberId}`
}

function knownCountedKey(memberId) {
  return `wwise.connect.known.${memberId}`
}

export function MemberPublicApp() {
  const { memberSlug = '' } = useParams()
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(TAB.contact)
  const [menuOpen, setMenuOpen] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)
  const [connectClosing, setConnectClosing] = useState(false)
  const [connectBusy, setConnectBusy] = useState(false)
  const [connectError, setConnectError] = useState('')
  /** @type {[null | { message: string, variant?: 'success' | 'error' | 'info' }, function]} */
  const [toast, setToast] = useState(null)
  const [connectForm, setConnectForm] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    companyName: '',
    areaOfInterest: '',
  })

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useEffect(() => {
    if (!toast) return undefined
    const id = window.setTimeout(() => setToast(null), 5200)
    return () => window.clearTimeout(id)
  }, [toast])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      setMember(null)

      try {
        await signInMemberSession()
        const record = await findMemberBySlug(memberSlug)
        if (cancelled) return

        if (!record) {
          setError('This member profile could not be found.')
          return
        }

        setMember(record)

        const key = seenPromptKey(record.id)
        const alreadySeen = window.localStorage.getItem(key) === '1'

        if (!alreadySeen) {
          window.localStorage.setItem(key, '1')
          setConnectOpen(true)
          incrementAnonymousConnection({
            memberId: record.id,
            memberSlug: record.profileSlug || record.id,
            memberName: record.fullName,
          }).catch(() => {})
        }
      } catch (loadError) {
        if (cancelled) return
        const message =
          typeof loadError?.message === 'string'
            ? loadError.message
            : 'Unable to load this profile right now.'
        setError(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [memberSlug])

  const setConnectField = useCallback((key, value) => {
    setConnectForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const openConnectModal = useCallback(() => {
    setConnectError('')
    setConnectClosing(false)
    setConnectOpen(true)
  }, [])

  const closeConnectModal = useCallback(() => {
    setConnectError('')
    setConnectClosing(true)
    window.setTimeout(() => {
      setConnectOpen(false)
      setConnectClosing(false)
    }, 230)
  }, [])

  useEffect(() => {
    if (!menuOpen && !connectOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      if (connectOpen) {
        closeConnectModal()
        return
      }
      closeMenu()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen, connectOpen, closeMenu, closeConnectModal])

  const submitConnection = useCallback(
    async (event) => {
      event.preventDefault()
      if (!member) return

      const payload = {
        fullName: connectForm.fullName.trim(),
        email: connectForm.email.trim(),
        contactNumber: connectForm.contactNumber.trim(),
        companyName: connectForm.companyName.trim(),
        areaOfInterest: connectForm.areaOfInterest.trim(),
      }

      if (
        !payload.fullName ||
        !payload.email ||
        !payload.contactNumber ||
        !payload.companyName ||
        !payload.areaOfInterest
      ) {
        setConnectError('Please complete all fields before submitting.')
        return
      }

      setConnectBusy(true)
      setConnectError('')

      try {
        await createConnectionRecord({
          memberId: member.id,
          memberSlug: member.profileSlug || member.id,
          memberName: member.fullName,
          ...payload,
        })

        const knownKey = knownCountedKey(member.id)
        const knownAlreadyCounted = window.localStorage.getItem(knownKey) === '1'
        if (!knownAlreadyCounted) {
          await incrementKnownConnection({
            memberId: member.id,
            memberSlug: member.profileSlug || member.id,
            memberName: member.fullName,
          })
          window.localStorage.setItem(knownKey, '1')
        }

        const savedEmail = payload.email
        setConnectForm({
          fullName: '',
          email: '',
          contactNumber: '',
          companyName: '',
          areaOfInterest: '',
        })
        closeConnectModal()
        setToast({
          message: `Contact saved — a confirmation email is on its way to ${savedEmail}.`,
          variant: 'success',
        })
      } catch (submitError) {
        const message =
          typeof submitError?.message === 'string'
            ? submitError.message
            : 'Could not submit your details right now.'
        setConnectError(message)
      } finally {
        setConnectBusy(false)
      }
    },
    [connectForm, member],
  )

  const contentKey = loading
    ? 'loading'
    : error || !member
      ? 'error'
      : activeTab

  function renderContent() {
    if (loading) {
      return (
        <div className="member-public__state" role="status" aria-live="polite">
          <div className="member-public__loader" aria-hidden>
            <span className="member-public__loader-pulse" />
            <span className="member-public__loader-pulse member-public__loader-pulse--delay" />
            <img className="member-public__loader-logo" src={logo} alt="" />
          </div>
          <p className="member-public__state-label">Loading profile…</p>
        </div>
      )
    }

    if (error || !member) {
      return (
        <div className="member-public__state member-public__state--error">
          <p className="member-public__state-label">{error ?? 'Profile unavailable.'}</p>
        </div>
      )
    }

    if (activeTab === TAB.contact) return <ContactTab member={member} />
    if (activeTab === TAB.categories) return <CategoriesTab />
    if (activeTab === TAB.schedule) return <ScheduleTab />
    return <CompetitionTab member={member} />
  }

  const menuAddress = PLACEHOLDER_COMPANY_ADDRESS

  return (
    <div className={`app member-public-app${menuOpen ? ' member-public-app--menu-open' : ''}`}>
      <header className="app-header">
        <div className="app-header__row">
          <div className="app-header__brand-stack">
            <img className="app-header__logo" src={logo} alt="WWISE" />
          </div>
          <button
            type="button"
            className={`member-public-menu-btn${menuOpen ? ' member-public-menu-btn--open' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="member-public-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="member-public-menu-btn__pulse" aria-hidden />
            <span className="member-public-menu-btn__line member-public-menu-btn__line--short" aria-hidden />
            <span className="member-public-menu-btn__line member-public-menu-btn__line--medium" aria-hidden />
            <span className="member-public-menu-btn__line member-public-menu-btn__line--long" aria-hidden />
          </button>
        </div>
      </header>

      <button
        type="button"
        className={`member-public-menu-backdrop${menuOpen ? ' is-open' : ''}`}
        onClick={closeMenu}
        aria-label="Close menu"
        aria-hidden={!menuOpen}
        tabIndex={menuOpen ? 0 : -1}
      />

      <aside
        id="member-public-menu"
        className={`member-public-menu${menuOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Profile navigation"
        aria-hidden={!menuOpen}
        inert={menuOpen ? undefined : ''}
      >
          <div className="member-public-menu__head">
            <p className="member-public-menu__title">EXPO</p>
            <img
              className="member-public-menu__logo"
              src={logo}
              alt="WWISE"
            />
            <button
              type="button"
              className="member-public-menu__close"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <MdClose aria-hidden />
            </button>
          </div>

          <div className="member-public-menu__body">
            <div className="member-public-menu__tabs">
              {TAB_MENU.map((tab, index) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`member-public-menu__tab${activeTab === tab.id ? ' member-public-menu__tab--active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.id)
                    closeMenu()
                  }}
                >
                  <span className="member-public-menu__tab-num" aria-hidden>
                    {index + 1}
                  </span>
                  <span className="member-public-menu__tab-label">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="member-public-menu__meta">
              <p className="member-public-menu__address">
                <MdOutlineLocationOn aria-hidden />
                {menuAddress}
              </p>
            </div>

            <button
              type="button"
              className="primary-btn member-public-menu__subscribe"
              onClick={() => {
                closeMenu()
                openConnectModal()
              }}
            >
              Connect
            </button>
          </div>
      </aside>

      {connectOpen || connectClosing ? (
        <div
          className={`member-connect-modal${connectClosing ? ' is-closing' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Connect form"
        >
          <div className="member-connect-modal__panel">
            <div className="member-connect-modal__head">
              <h3>Connect</h3>
              <button
                type="button"
                className="member-connect-modal__close"
                onClick={closeConnectModal}
                aria-label="Close connect form"
              >
                <MdClose aria-hidden />
              </button>
            </div>

            <p className="member-connect-modal__note">
              Share your details if you want this member to follow up with you.
            </p>

            <form className="member-connect-modal__form" onSubmit={submitConnection}>
              <label className="field-label" htmlFor="connect-full-name">
                Full name
              </label>
              <input
                id="connect-full-name"
                className="text-input text-input--tall"
                value={connectForm.fullName}
                onChange={(event) => setConnectField('fullName', event.target.value)}
                disabled={connectBusy}
                required
              />

              <label className="field-label" htmlFor="connect-email">
                Email
              </label>
              <input
                id="connect-email"
                type="email"
                className="text-input text-input--tall"
                value={connectForm.email}
                onChange={(event) => setConnectField('email', event.target.value)}
                disabled={connectBusy}
                required
              />

              <label className="field-label" htmlFor="connect-contact-number">
                Contact number
              </label>
              <input
                id="connect-contact-number"
                type="tel"
                className="text-input text-input--tall"
                value={connectForm.contactNumber}
                onChange={(event) => setConnectField('contactNumber', event.target.value)}
                disabled={connectBusy}
                required
              />

              <label className="field-label" htmlFor="connect-company-name">
                Company name
              </label>
              <input
                id="connect-company-name"
                className="text-input text-input--tall"
                value={connectForm.companyName}
                onChange={(event) => setConnectField('companyName', event.target.value)}
                disabled={connectBusy}
                required
              />

              <label className="field-label" htmlFor="connect-area-of-interest">
                Area of interest
              </label>
              <select
                id="connect-area-of-interest"
                className="text-input text-input--tall"
                value={connectForm.areaOfInterest}
                onChange={(event) => setConnectField('areaOfInterest', event.target.value)}
                disabled={connectBusy}
                required
              >
                <option value="">Select an option</option>
                {CONNECT_AREA_OF_INTEREST_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              {connectError ? <p className="form-error">{connectError}</p> : null}

              <div className="member-connect-modal__actions">
                <button type="button" className="ghost-btn" onClick={closeConnectModal} disabled={connectBusy}>
                  Skip for now
                </button>
                <button type="submit" className="primary-btn" disabled={connectBusy}>
                  {connectBusy ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <CircuitFrame variant="accent">
        <div className="member-public-screen">
          <header className="member-public-screen__invite">
            <p className="member-public-screen__welcome">{EXPO_SHORT_LABEL}</p>
            <p className="member-public-screen__connect">{EXPO_CONNECT_LINE}</p>
            <div className="member-public-screen__shine" aria-hidden />
            <p className="member-public-screen__mission">{BRAND_MISSION_TAGLINE}</p>
          </header>

          <main className="member-public-screen__main">
            <div key={contentKey} className="morph-surface morph-surface--panel">
              {renderContent()}
            </div>
          </main>
        </div>
      </CircuitFrame>

      {toast ? (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      ) : null}
    </div>
  )
}
