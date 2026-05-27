import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MdClose, MdOutlineLocationOn } from 'react-icons/md'

import { CircuitFrame } from '../components/CircuitFrame.jsx'
import {
  BRAND_ENGINEERING_LOCKUP,
  BRAND_ISO_STANDARDS_LINE,
  BRAND_MISSION_TAGLINE,
  BRAND_PRIMARY_NAME,
  EXPO_CONNECT_LINE,
  EXPO_SHORT_LABEL,
  PLACEHOLDER_COMPANY_ADDRESS,
} from '../constants/companyDefaults.js'
import { findMemberBySlug } from '../services/membersRepo.js'
import { ContactTab } from './tabs/ContactTab.jsx'
import { CategoriesTab } from './tabs/CategoriesTab.jsx'
import { ScheduleTab } from './tabs/ScheduleTab.jsx'
import { CompetitionTab } from './tabs/CompetitionTab.jsx'

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
  { id: TAB.categories, label: 'Categories' },
  { id: TAB.schedule, label: 'Schedule' },
  { id: TAB.competition, label: 'Competition' },
]

/**
 * @param {string} [memberAddress]
 * @returns {string}
 */
function resolveMenuAddress(memberAddress) {
  const fromMember = (memberAddress || '').trim()
  if (fromMember) return fromMember
  return PLACEHOLDER_COMPANY_ADDRESS
}

export function MemberPublicApp() {
  const { memberSlug = '' } = useParams()
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(TAB.contact)
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      setMember(null)

      try {
        const record = await findMemberBySlug(memberSlug)
        if (cancelled) return

        if (!record) {
          setError('This member profile could not be found.')
          return
        }

        setMember(record)
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

  useEffect(() => {
    if (!menuOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen, closeMenu])

  function renderContent() {
    if (loading) {
      return (
        <div className="member-public__state">
          <div className="member-public__spinner" aria-hidden />
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
    return <CompetitionTab />
  }

  const menuAddress = resolveMenuAddress(member?.companyAddress)

  return (
    <div className={`app member-public-app${menuOpen ? ' member-public-app--menu-open' : ''}`}>
      <header className="app-header">
        <div className="app-header__row">
          <div className="app-header__brand-stack">
            <strong className="app-header__org">{BRAND_PRIMARY_NAME}</strong>
            <p className="app-header__lockup">{BRAND_ENGINEERING_LOCKUP}</p>
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

      {menuOpen ? (
        <button
          type="button"
          className="member-public-menu-backdrop"
          onClick={closeMenu}
          aria-label="Close menu"
        />
      ) : null}

      {menuOpen ? (
        <aside
          id="member-public-menu"
          className="member-public-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Profile navigation"
        >
          <div className="member-public-menu__head">
            <p className="member-public-menu__title">Navigate</p>
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
              {TAB_MENU.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`member-public-menu__tab${activeTab === tab.id ? ' member-public-menu__tab--active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.id)
                    closeMenu()
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="member-public-menu__meta">
              <p className="member-public-menu__iso">{BRAND_ISO_STANDARDS_LINE}</p>
              <p className="member-public-menu__address">
                <MdOutlineLocationOn aria-hidden />
                {menuAddress}
              </p>
            </div>

            <button type="button" className="primary-btn member-public-menu__subscribe">
              Subscribe
            </button>
          </div>
        </aside>
      ) : null}

      <CircuitFrame variant="accent">
        <div className="member-public-screen">
          <header className="member-public-screen__invite">
            <p className="member-public-screen__welcome">{EXPO_SHORT_LABEL}</p>
            <p className="member-public-screen__connect">{EXPO_CONNECT_LINE}</p>
            <div className="member-public-screen__shine" aria-hidden />
            <p className="member-public-screen__mission">{BRAND_MISSION_TAGLINE}</p>
          </header>

          <main className="member-public-screen__main">{renderContent()}</main>
        </div>
      </CircuitFrame>
    </div>
  )
}
