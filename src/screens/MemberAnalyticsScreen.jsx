import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'

import { CircuitFrame } from '../components/CircuitFrame.jsx'
import { MEMBER_CONNECTION_STATS_COLLECTION } from '../services/connectionsRepo.js'
import { db } from '../firebase.js'

import './MemberQrScreen.css'

export function MemberAnalyticsScreen({ member, onBack }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const snap = await getDoc(
          doc(db, MEMBER_CONNECTION_STATS_COLLECTION, member.id),
        )
        if (cancelled) return
        setStats(snap.exists() ? snap.data() : null)
      } catch (loadError) {
        if (cancelled) return
        setError(
          typeof loadError?.message === 'string'
            ? loadError.message
            : 'Could not load analytics.',
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [member.id])

  const anonymous = stats?.anonymousCount ?? 0
  const known = stats?.knownCount ?? 0
  const total = stats?.totalCount ?? anonymous + known

  return (
    <CircuitFrame variant="accent">
      <div className="qr-screen qr-screen--analytics">
        <header className="qr-screen__profile" aria-label="Analytics">
          <p className="qr-screen__eyebrow">Profile analytics</p>
          <p className="qr-screen__name">{member.fullName ?? 'Member'}</p>
        </header>

        {loading ? (
          <p className="qr-analytics__status">Loading analytics…</p>
        ) : error ? (
          <p className="form-error qr-analytics__status">{error}</p>
        ) : (
          <ul className="qr-analytics__stats">
            <li>
              <span className="qr-analytics__label">Total scans</span>
              <span className="qr-analytics__value">{total}</span>
            </li>
            <li>
              <span className="qr-analytics__label">Anonymous visits</span>
              <span className="qr-analytics__value">{anonymous}</span>
            </li>
            <li>
              <span className="qr-analytics__label">Known connections</span>
              <span className="qr-analytics__value">{known}</span>
            </li>
          </ul>
        )}

        <div className="qr-screen__actions">
          <button type="button" className="ghost-btn" onClick={onBack}>
            Back to QR
          </button>
        </div>
      </div>
    </CircuitFrame>
  )
}
