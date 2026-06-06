import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import {
  HiOutlineArrowRight,
  HiOutlineChartBarSquare,
  HiOutlineKey,
  HiOutlineShieldCheck,
} from 'react-icons/hi2'

import blueLogo from '../../assets/blueLogo.png'
import { auth } from '../../firebase.js'
import { findMemberByCode } from '../../services/membersRepo.js'
import { signInMemberSession } from '../../services/sessionAuth.js'
import { DashboardLoader } from '../components/DashboardLoader.jsx'
import { useDashMotion } from '../motion/index.js'
import {
  clearDashboardSession,
  isDashboardAdminEmail,
  saveDashboardSession,
} from '../services/dashboardSession.js'

export function DashboardLoginPage() {
  const navigate = useNavigate()
  const { loginCard } = useDashMotion()
  const [memberCode, setMemberCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setBusy(true)

    try {
      const member = await findMemberByCode(memberCode)
      if (!member) {
        setError('Member code not found. Use your registered expo member code.')
        return
      }
      if (!isDashboardAdminEmail(member.email)) {
        setError('Access denied. This dashboard is restricted to authorized administrators.')
        return
      }

      await signInMemberSession()
      saveDashboardSession(member)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to sign in. Please try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="dashboard-login">
      <motion.div
        className="dashboard-login__shell"
        initial={loginCard.initial}
        animate={loginCard.animate}
        transition={loginCard.transition}
      >
        <aside className="dashboard-login__brand">
          <div className="dashboard-login__brand-glow" aria-hidden />
          <img src={blueLogo} alt="WWISE" className="dashboard-login__logo" />
          <span className="dashboard-login__eyebrow">WWISE Expo · 2–4 June 2026</span>
          <h1 className="dashboard-login__brand-title">Admin Command</h1>
          <p className="dashboard-login__brand-desc">
            Live analytics, connection records, and executive reporting for the expo event.
          </p>
          <ul className="dashboard-login__features">
            <li>
              <HiOutlineChartBarSquare aria-hidden />
              Real-time event metrics
            </li>
            <li>
              <HiOutlineShieldCheck aria-hidden />
              Authorized administrators only
            </li>
          </ul>
        </aside>

        <div className={`dashboard-login__panel${busy ? ' is-busy' : ''}`}>
          {busy ? (
            <DashboardLoader
              variant="inline"
              label="Signing in"
              hint="Verifying member code and session…"
            />
          ) : (
            <>
              <div className="dashboard-login__panel-head">
                <h2 className="dashboard-login__title">Sign in</h2>
                <p className="dashboard-login__subtitle">
                  Enter your registered member code to access the analytics dashboard.
                </p>
              </div>

              <form className="dashboard-login__form" onSubmit={handleSubmit}>
                <label className="dashboard-login__label" htmlFor="dashboard-member-code">
                  Member code
                </label>
                <div className="dashboard-login__field">
                  <HiOutlineKey className="dashboard-login__field-icon" aria-hidden />
                  <input
                    id="dashboard-member-code"
                    className="dashboard-login__input"
                    value={memberCode}
                    onChange={(event) => setMemberCode(event.target.value)}
                    placeholder="Enter member code"
                    autoComplete="off"
                    required
                  />
                </div>

                {error ? (
                  <div className="dashboard-login__error" role="alert">
                    {error}
                  </div>
                ) : null}

                <button type="submit" className="dashboard-login__btn">
                  Sign in to dashboard
                  <HiOutlineArrowRight aria-hidden />
                </button>
              </form>

              <p className="dashboard-login__footnote">
                Restricted access · Session expires after 12 hours
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export async function performDashboardLogout() {
  try {
    await signOut(auth)
  } catch {
    // ignore — session cleared locally regardless
  }
  clearDashboardSession()
}
