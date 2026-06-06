import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'

import blueLogo from '../../assets/blueLogo.png'
import { auth } from '../../firebase.js'
import { findMemberByCode } from '../../services/membersRepo.js'
import { signInMemberSession } from '../../services/sessionAuth.js'
import {
  clearDashboardSession,
  isDashboardAdminEmail,
  saveDashboardSession,
} from '../services/dashboardSession.js'

export function DashboardLoginPage() {
  const navigate = useNavigate()
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
        className="dashboard-login__card"
        initial={{ opacity: 0, y: 12, scale: 0.992 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <img src={blueLogo} alt="WWISE" className="dashboard-login__logo" />
        <h1 className="dashboard-login__title">Admin Dashboard</h1>
        <p className="dashboard-login__subtitle">
          Sign in with your member code to access event analytics and reporting.
        </p>
        <form onSubmit={handleSubmit}>
          <label className="dashboard-login__label" htmlFor="dashboard-member-code">
            Member code
          </label>
          <input
            id="dashboard-member-code"
            className="dashboard-login__input"
            value={memberCode}
            onChange={(event) => setMemberCode(event.target.value)}
            placeholder="Enter member code"
            autoComplete="off"
            required
          />
          {error ? <p className="dashboard-login__error">{error}</p> : null}
          <button type="submit" className="dashboard-login__btn" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
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
