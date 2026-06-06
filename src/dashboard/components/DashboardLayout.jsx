import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  HiArrowDownTray,
  HiArrowPath,
  HiChevronDown,
  HiOutlineArrowRightOnRectangle,
  HiOutlineClock,
} from 'react-icons/hi2'

import blueLogo from '../../assets/blueLogo.png'
import { DASHBOARD_TABS } from '../constants/tabs.js'
import { DashboardRefreshBar } from './DashboardLoader.jsx'
import { useDashMotion } from '../motion/index.js'

/**
 * @param {{
 *   session: { fullName?: string, email: string },
 *   activeTab: string,
 *   onTabChange: (id: string) => void,
 *   fetchedAt: number | null,
 *   refreshing: boolean,
 *   onRefresh: () => void,
 *   onExport: () => void,
 *   onLogout: () => void,
 *   children: import('react').ReactNode
 * }} props
 */
export function DashboardLayout({
  session,
  activeTab,
  onTabChange,
  fetchedAt,
  refreshing,
  onRefresh,
  onExport,
  onLogout,
  children,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const { tabExit, menu } = useDashMotion()

  const initials = (session.fullName || session.email || 'A')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  useEffect(() => {
    if (!menuOpen) return undefined

    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <div className="dashboard-frame">
      <header className="dashboard-topnav">
        <div className="dashboard-topnav__brand">
          <img src={blueLogo} alt="WWISE" className="dashboard-topnav__logo" />
          <div className="dashboard-topnav__brand-text">
            <span className="dashboard-topnav__brand-title">Expo Analytics</span>
            <span className="dashboard-topnav__brand-sub">Admin Command</span>
          </div>
        </div>

        <nav className="dashboard-topnav__tabs-wrap" aria-label="Dashboard sections">
          <div className="dashboard-topnav__tabs">
            {DASHBOARD_TABS.map(({ id, label, Icon }) => {
              const isActive = activeTab === id
              return (
                <button
                  key={id}
                  type="button"
                  className={`dashboard-topnav__tab${isActive ? ' is-active' : ''}`}
                  onClick={() => onTabChange(id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="dashboard-topnav__tab-icon" aria-hidden />
                  <span>{label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        <div className="dashboard-topnav__actions" ref={menuRef}>
          <button
            type="button"
            className={`dashboard-topnav__icon-btn${refreshing ? ' is-refreshing' : ''}`}
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh analytics"
            title="Refresh"
          >
            <HiArrowPath className={refreshing ? 'is-spinning' : ''} />
          </button>

          <button
            type="button"
            className={`dashboard-topnav__avatar-btn${menuOpen ? ' is-open' : ''}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="dashboard-topnav__avatar">{initials}</span>
            <HiChevronDown className="dashboard-topnav__avatar-chevron" aria-hidden />
          </button>

          <AnimatePresence>
            {menuOpen ? (
              <>
                <motion.button
                  type="button"
                  className="dashboard-topnav__menu-backdrop"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <motion.div
                  className="dashboard-topnav__menu"
                  role="menu"
                  initial={menu.initial}
                  animate={menu.animate}
                  exit={menu.exit}
                  transition={menu.transition}
                >
                  <div className="dashboard-topnav__menu-head">
                    <p className="dashboard-topnav__menu-name">
                      {session.fullName || 'Administrator'}
                    </p>
                    <p className="dashboard-topnav__menu-email">{session.email}</p>
                  </div>

                  {fetchedAt ? (
                    <p className="dashboard-topnav__menu-meta">
                      <HiOutlineClock aria-hidden />
                      Updated {new Date(fetchedAt).toLocaleString()}
                    </p>
                  ) : null}

                  <div className="dashboard-topnav__menu-divider" />

                  <button
                    type="button"
                    className="dashboard-topnav__menu-item"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      onRefresh()
                    }}
                  >
                    <HiArrowPath aria-hidden />
                    Refresh data
                  </button>
                  <button
                    type="button"
                    className="dashboard-topnav__menu-item"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      onExport()
                    }}
                  >
                    <HiArrowDownTray aria-hidden />
                    Download report
                  </button>

                  <div className="dashboard-topnav__menu-divider" />

                  <button
                    type="button"
                    className="dashboard-topnav__menu-item dashboard-topnav__menu-item--danger"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      onLogout()
                    }}
                  >
                    <HiOutlineArrowRightOnRectangle aria-hidden />
                    Log out
                  </button>
                </motion.div>
              </>
            ) : null}
          </AnimatePresence>
        </div>
      </header>

      <main className="dashboard-main">
        <AnimatePresence>
          {refreshing ? <DashboardRefreshBar key="refresh-bar" /> : null}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} className="dashboard-tab-panel" exit={tabExit}>
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
