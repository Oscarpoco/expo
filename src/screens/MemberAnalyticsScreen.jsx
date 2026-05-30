import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'

import { CircuitFrame } from '../components/CircuitFrame.jsx'
import { MEMBER_CONNECTION_STATS_COLLECTION } from '../services/connectionsRepo.js'
import { listWinnerEntries } from '../services/winnersRepo.js'
import { db } from '../firebase.js'

import './MemberQrScreen.css'

/**
 * @param {import('firebase/firestore').Timestamp | undefined} value
 * @returns {string}
 */
function formatWinnerDate(value) {
  if (!value || typeof value.toDate !== 'function') return '—'
  return value.toDate().toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function MemberAnalyticsScreen({ member, onBack }) {
  const [stats, setStats] = useState(null)
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)
  const [winnersLoading, setWinnersLoading] = useState(true)
  const [error, setError] = useState('')
  const [winnersError, setWinnersError] = useState('')

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

  useEffect(() => {
    let cancelled = false

    async function loadWinners() {
      setWinnersLoading(true)
      setWinnersError('')
      try {
        const entries = await listWinnerEntries()
        if (cancelled) return
        setWinners(entries)
      } catch (loadError) {
        if (cancelled) return
        setWinnersError(
          typeof loadError?.message === 'string'
            ? loadError.message
            : 'Could not load winners.',
        )
      } finally {
        if (!cancelled) setWinnersLoading(false)
      }
    }

    loadWinners()
    return () => {
      cancelled = true
    }
  }, [])

  const anonymous = stats?.anonymousCount ?? 0
  const known = stats?.knownCount ?? 0
  const total = stats?.totalCount ?? anonymous + known

  return (
    <CircuitFrame variant="accent">
      <div className="qr-screen qr-screen--analytics">
        <div className="qr-analytics__scroll">
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

          <section className="qr-analytics__winners" aria-labelledby="winners-heading">
            <h2 id="winners-heading" className="qr-analytics__section-title">
              Winners
            </h2>

            {winnersLoading ? (
              <p className="qr-analytics__status">Loading winners…</p>
            ) : winnersError ? (
              <p className="form-error qr-analytics__status">{winnersError}</p>
            ) : winners.length === 0 ? (
              <p className="qr-analytics__status">No competition entries yet.</p>
            ) : (
              <ul className="qr-analytics__winner-list">
                {winners.map((winner) => {
                  const isMine = winner.memberId === member.id
                  return (
                    <li
                      key={winner.id}
                      className={`qr-analytics__winner${
                        isMine ? ' qr-analytics__winner--mine' : ''
                      }`}
                    >
                      <span className="qr-analytics__winner-email">
                        {winner.email || 'Unknown email'}
                      </span>
                      <span className="qr-analytics__winner-meta">
                        {isMine ? 'Your referral' : 'Entry'}
                        {' · '}
                        {formatWinnerDate(winner.createdAt)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="qr-analytics__footer">
          <button type="button" className="ghost-btn" onClick={onBack}>
            Back to QR
          </button>
        </div>
      </div>
    </CircuitFrame>
  )
}
