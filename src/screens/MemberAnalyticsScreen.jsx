import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'

import { CircuitFrame } from '../components/CircuitFrame.jsx'
import {
  listAllConnections,
  listConnectionsByMemberId,
  MEMBER_CONNECTION_STATS_COLLECTION,
} from '../services/connectionsRepo.js'
import { listWinnerEntries } from '../services/winnersRepo.js'
import { buildConnectionCardGroups, formatAnalyticsDate } from '../utils/connectionCards.js'
import {
  buildAnalyticsExportCsv,
  buildAnalyticsExportFilename,
  downloadCsvFile,
} from '../utils/exportAnalyticsCsv.js'
import { db } from '../firebase.js'

import './MemberQrScreen.css'

const RING_CIRCUMFERENCE = 527
const RING_PATH =
  'M 100,100 m -84,0 a 84,84 0 1,0 168,0 a 84,84 0 1,0 -168,0'

function ConnectionCard({ fields }) {
  const [primary, secondary] = fields

  return (
    <div className="qr-analytics__winner qr-analytics__winner--connection">
      <span className="qr-analytics__winner-email">
        {primary?.value || 'Unknown'}
      </span>
      {secondary ? (
        <span className="qr-analytics__winner-meta">{secondary.value}</span>
      ) : null}
    </div>
  )
}

function StatRing({ id, label, value }) {
  return (
    <li className="qr-analytics__stat-ring">
      <div className="qr-analytics__stat-ring-body">
        <svg
          className="qr-analytics__stat-ring-svg"
          viewBox="0 0 200 200"
          aria-hidden
        >
          <defs>
            <path id={`analytics-ring-${id}`} fill="none" d={RING_PATH} />
          </defs>
          <text textAnchor="middle">
            <textPath
              href={`#analytics-ring-${id}`}
              startOffset="25%"
              textLength={RING_CIRCUMFERENCE}
              lengthAdjust="spacing"
            >
              {label}
            </textPath>
          </text>
        </svg>
        <span className="qr-analytics__stat-ring-value" aria-hidden>
          {value}
        </span>
        <span className="sr-only">
          {label}: {value}
        </span>
      </div>
    </li>
  )
}

export function MemberAnalyticsScreen({ member, onBack }) {
  const [stats, setStats] = useState(null)
  const [connections, setConnections] = useState([])
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)
  const [connectionsLoading, setConnectionsLoading] = useState(true)
  const [winnersLoading, setWinnersLoading] = useState(true)
  const [error, setError] = useState('')
  const [connectionsError, setConnectionsError] = useState('')
  const [winnersError, setWinnersError] = useState('')
  const [exportBusy, setExportBusy] = useState(false)
  const [exportError, setExportError] = useState('')

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

    async function loadConnections() {
      setConnectionsLoading(true)
      setConnectionsError('')
      try {
        const entries = await listConnectionsByMemberId(member.id)
        if (cancelled) return
        setConnections(entries)
      } catch (loadError) {
        if (cancelled) return
        setConnectionsError(
          typeof loadError?.message === 'string'
            ? loadError.message
            : 'Could not load connections.',
        )
      } finally {
        if (!cancelled) setConnectionsLoading(false)
      }
    }

    loadConnections()
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
  const statItems = [
    { id: 'total', label: 'Total scans', value: total },
    { id: 'anonymous', label: 'Anonymous visits', value: anonymous },
    { id: 'known', label: 'Known connections', value: known },
  ]

  const handleExport = useCallback(async () => {
    setExportBusy(true)
    setExportError('')
    try {
      const [myConnections, allConnections, winnerEntries] = await Promise.all([
        listConnectionsByMemberId(member.id),
        listAllConnections(),
        listWinnerEntries(),
      ])

      const csv = buildAnalyticsExportCsv({
        myConnections,
        allConnections,
        winners: winnerEntries,
        memberName: member.fullName || member.profileSlug || member.id,
      })
      const filename = buildAnalyticsExportFilename(
        member.profileSlug || member.id,
      )
      downloadCsvFile(csv, filename)
    } catch (exportErr) {
      setExportError(
        typeof exportErr?.message === 'string'
          ? exportErr.message
          : 'Could not export analytics.',
      )
    } finally {
      setExportBusy(false)
    }
  }, [member.fullName, member.id, member.profileSlug])

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
            <ul className="qr-analytics__stats" aria-label="Profile scan statistics">
              {statItems.map((item) => (
                <StatRing key={item.id} {...item} />
              ))}
            </ul>
          )}

          <section
            className="qr-analytics__connections"
            aria-labelledby="connections-heading"
          >
            <h2 id="connections-heading" className="qr-analytics__section-title">
              My Connections
            </h2>

            {connectionsLoading ? (
              <p className="qr-analytics__status">Loading connections…</p>
            ) : connectionsError ? (
              <p className="form-error qr-analytics__status">{connectionsError}</p>
            ) : connections.length === 0 ? (
              <p className="qr-analytics__status">No connections yet.</p>
            ) : (
              <ul className="qr-analytics__connection-list">
                {connections.map((connection, index) => {
                  const cardGroups = buildConnectionCardGroups(connection)
                  const [firstCard, ...extraCards] = cardGroups

                  return (
                    <li
                      key={connection.id}
                      className="qr-analytics__connection-entry"
                    >
                      <div className="qr-analytics__connection-row">
                        <ConnectionCard fields={firstCard} />
                        <div className="qr-analytics__connection-rank-wrap">
                          <span className="qr-analytics__connection-rank" aria-hidden>
                            {index + 1}
                          </span>
                        </div>
                      </div>

                      {extraCards.map((fields, cardIndex) => (
                        <div
                          key={`${connection.id}-row-${cardIndex + 1}`}
                          className="qr-analytics__connection-row--continued"
                        >
                          <ConnectionCard fields={fields} />
                        </div>
                      ))}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

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
                {winners.map((winner, index) => {
                  const isMine = winner.memberId === member.id
                  return (
                    <li
                      key={winner.id}
                      className={`qr-analytics__winner-row${
                        isMine ? ' qr-analytics__winner-row--mine' : ''
                      }`}
                    >
                      <div className="qr-analytics__winner-rank-wrap">
                        <span className="qr-analytics__winner-rank" aria-hidden>
                          {index + 1}
                        </span>
                      </div>
                      <div
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
                          {formatAnalyticsDate(winner.createdAt)}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="qr-analytics__footer">
          <div className="qr-analytics__footer-actions">
            <button type="button" className="ghost-btn" onClick={onBack}>
              Back to QR
            </button>
            <button
              type="button"
              className="primary-btn"
              onClick={handleExport}
              disabled={exportBusy}
            >
              {exportBusy ? 'Exporting…' : 'Export'}
            </button>
          </div>
          {exportError ? (
            <p className="form-error qr-analytics__export-error">{exportError}</p>
          ) : null}
        </div>
      </div>
    </CircuitFrame>
  )
}
