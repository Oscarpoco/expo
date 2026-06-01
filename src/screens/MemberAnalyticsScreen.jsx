import { useCallback, useEffect, useMemo, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'

import { CircuitFrame } from '../components/CircuitFrame.jsx'
import {
  listAllConnections,
  listConnectionsByMemberId,
  MEMBER_CONNECTION_STATS_COLLECTION,
} from '../services/connectionsRepo.js'
import { normalizeMemberEmail } from '../services/membersRepo.js'
import { listWinnerEntries } from '../services/winnersRepo.js'
import {
  createPrizeWinner,
  listPrizeWinnersByMemberId,
} from '../services/prizeWinnersRepo.js'
import { buildConnectionCardGroups, formatAnalyticsDate } from '../utils/connectionCards.js'
import {
  buildAnalyticsExportCsv,
  buildAnalyticsExportFilename,
  downloadCsvFile,
} from '../utils/exportAnalyticsCsv.js'
import { db } from '../firebase.js'

import './MemberQrScreen.css'

const TOP_RING_PATH = 'M 16,100 A 84,84 0 0,1 184,100'
const ANALYTICS_ADMIN_EMAIL = normalizeMemberEmail(
  import.meta.env.VITE_ANALYTICS_ADMIN_EMAIL ?? '',
)

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
  const pathId = `analytics-ring-top-${id}`

  return (
    <li className="qr-analytics__stat-ring">
      <div className="qr-analytics__stat-ring-body">
        <svg
          className="qr-analytics__stat-ring-svg"
          viewBox="0 0 200 200"
          aria-hidden
        >
          <defs>
            <path id={pathId} fill="none" d={TOP_RING_PATH} />
          </defs>
          <text>
            <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
              {label}
            </textPath>
          </text>
          <g transform="translate(100, 100) scale(1, -1) translate(-100, -100)">
            <text>
              <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
                {label}
              </textPath>
            </text>
          </g>
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

function WinnerListRow({ winner, index, memberId, metaLabel = 'Entry' }) {
  const isMine = winner.memberId === memberId

  return (
    <li
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
          {isMine ? 'Your referral' : metaLabel}
          {' · '}
          {formatAnalyticsDate(winner.createdAt)}
        </span>
      </div>
    </li>
  )
}

export function MemberAnalyticsScreen({ member, onBack }) {
  const isKausarAdmin = useMemo(
    () =>
      Boolean(ANALYTICS_ADMIN_EMAIL) &&
      normalizeMemberEmail(member.email) === ANALYTICS_ADMIN_EMAIL,
    [member.email],
  )
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
  const [prizeWinners, setPrizeWinners] = useState([])
  const [prizeWinnersLoading, setPrizeWinnersLoading] = useState(true)
  const [drawBusy, setDrawBusy] = useState(false)
  const [drawError, setDrawError] = useState('')

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

  useEffect(() => {
    if (!isKausarAdmin) {
      setPrizeWinners([])
      setPrizeWinnersLoading(false)
      return undefined
    }

    let cancelled = false

    async function loadPrizeWinners() {
      setPrizeWinnersLoading(true)
      try {
        const entries = await listPrizeWinnersByMemberId(member.id)
        if (cancelled) return
        setPrizeWinners(entries)
      } catch (loadError) {
        if (cancelled) return
        setDrawError(
          typeof loadError?.message === 'string'
            ? loadError.message
            : 'Could not load prize winners.',
        )
      } finally {
        if (!cancelled) setPrizeWinnersLoading(false)
      }
    }

    loadPrizeWinners()
    return () => {
      cancelled = true
    }
  }, [isKausarAdmin, member.id])

  const anonymous = stats?.anonymousCount ?? 0
  const known = stats?.knownCount ?? 0
  const total = stats?.totalCount ?? anonymous + known
  const statItems = [
    { id: 'total', label: 'Total scans', value: total },
    { id: 'anonymous', label: 'Anonymous visits', value: anonymous },
    { id: 'known', label: 'Known connections', value: known },
  ]
  const drawnWinnerIds = useMemo(
    () => new Set(prizeWinners.map((record) => record.winnerEntryId)),
    [prizeWinners],
  )
  const drawnWinners = useMemo(
    () =>
      prizeWinners.map((record) => {
        const entry = winners.find((winner) => winner.id === record.winnerEntryId)
        if (entry) return entry
        return {
          id: record.winnerEntryId,
          email: record.email,
          memberId: record.referrerMemberId,
          createdAt: record.drawnAt,
        }
      }),
    [prizeWinners, winners],
  )
  const winnersRemaining = winners.filter((entry) => !drawnWinnerIds.has(entry.id))
  const allWinnersDrawn =
    winners.length > 0 && winnersRemaining.length === 0

  const handleGetWinner = useCallback(async () => {
    const pool = winners.filter((entry) => !drawnWinnerIds.has(entry.id))

    if (pool.length === 0) {
      setDrawError(
        winners.length === 0
          ? 'No competition entries yet.'
          : 'All winners have already been drawn.',
      )
      return
    }

    const randomIndex = Math.floor(Math.random() * pool.length)
    const picked = pool[randomIndex]

    setDrawBusy(true)
    setDrawError('')

    try {
      await createPrizeWinner({
        memberId: member.id,
        winnerEntryId: picked.id,
        email: picked.email || '',
        referrerMemberId: picked.memberId,
        drawOrder: prizeWinners.length + 1,
      })

      const entries = await listPrizeWinnersByMemberId(member.id)
      setPrizeWinners(entries)
    } catch (drawErr) {
      setDrawError(
        typeof drawErr?.message === 'string'
          ? drawErr.message
          : 'Could not save prize winner.',
      )
    } finally {
      setDrawBusy(false)
    }
  }, [drawnWinnerIds, member.id, prizeWinners.length, winners])

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

          {isKausarAdmin ? (
            <section
              className="qr-analytics__winners qr-analytics__winners--draw"
              aria-labelledby="draw-winners-heading"
            >
              <h2 id="draw-winners-heading" className="qr-analytics__section-title">
                Winners
              </h2>

              <button
                type="button"
                className="primary-btn qr-analytics__draw-btn"
                onClick={handleGetWinner}
                disabled={winnersLoading || prizeWinnersLoading || drawBusy || allWinnersDrawn}
              >
                {drawBusy ? 'Drawing…' : 'GET THE WINNER'}
              </button>

              {drawError ? (
                <p className="form-error qr-analytics__status">{drawError}</p>
              ) : null}

              {drawnWinners.length > 0 ? (
                <ul className="qr-analytics__winner-list">
                  {drawnWinners.map((winner, index) => (
                    <WinnerListRow
                      key={prizeWinners[index]?.id ?? winner.id}
                      winner={winner}
                      index={index}
                      memberId={member.id}
                      metaLabel="Winner"
                    />
                  ))}
                </ul>
              ) : winnersLoading || prizeWinnersLoading ? (
                <p className="qr-analytics__status">Loading winners…</p>
              ) : winnersError ? (
                <p className="form-error qr-analytics__status">{winnersError}</p>
              ) : (
                <p className="qr-analytics__status">
                  Press the button to draw a random winner.
                </p>
              )}
            </section>
          ) : null}

          <section
            className="qr-analytics__winners"
            aria-labelledby="participants-heading"
          >
            <h2 id="participants-heading" className="qr-analytics__section-title">
              Participants
            </h2>

            {winnersLoading ? (
              <p className="qr-analytics__status">Loading participants…</p>
            ) : winnersError ? (
              <p className="form-error qr-analytics__status">{winnersError}</p>
            ) : winners.length === 0 ? (
              <p className="qr-analytics__status">No competition entries yet.</p>
            ) : (
              <ul className="qr-analytics__winner-list">
                {winners.map((winner, index) => (
                  <WinnerListRow
                    key={winner.id}
                    winner={winner}
                    index={index}
                    memberId={member.id}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="qr-analytics__footer">
          <div className="qr-analytics__footer-actions">
            <button type="button" className="ghost-btn" onClick={onBack}>
              Back to QR
            </button>
            {isKausarAdmin ? (
              <button
                type="button"
                className="primary-btn"
                onClick={handleExport}
                disabled={exportBusy}
              >
                {exportBusy ? 'Exporting…' : 'Export'}
              </button>
            ) : null}
          </div>
          {isKausarAdmin && exportError ? (
            <p className="form-error qr-analytics__export-error">{exportError}</p>
          ) : null}
        </div>
      </div>
    </CircuitFrame>
  )
}
