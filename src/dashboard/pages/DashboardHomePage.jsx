import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  buildAnalyticsExportCsv,
  buildAnalyticsExportFilename,
  downloadCsvFile,
} from '../../utils/exportAnalyticsCsv.js'
import { formatAnalyticsDate } from '../../utils/connectionCards.js'
import { DashboardLayout } from '../components/DashboardLayout.jsx'
import {
  ConnectionHeatmap,
  DailyActivityChart,
  EventDayBarChart,
  HourlyBarChart,
  InteractionDonutChart,
  InterestPieChart,
} from '../components/DashboardCharts.jsx'
import { DataTable } from '../components/DataTable.jsx'
import { StatCard } from '../components/StatCard.jsx'
import { useDashboardData } from '../hooks/useDashboardData.js'
import {
  DashboardLoginPage,
  performDashboardLogout,
} from './DashboardLoginPage.jsx'

/**
 * @param {{ session: { fullName?: string, email: string } }} props
 */
export function DashboardHomePage({ session }) {
  const navigate = useNavigate()
  const { metrics, raw, loading, refreshing, error, fetchedAt, refresh } =
    useDashboardData()

  const connectionRows = useMemo(() => {
    if (!raw?.connections) return []
    return raw.connections.map((row) => ({
      id: row.id,
      fullName: row.fullName || '',
      email: row.email || '',
      companyName: row.companyName || '',
      areaOfInterest: row.areaOfInterest || '',
      memberName: row.memberName || '',
      date: formatAnalyticsDate(row.createdAt),
      dateSort: row.createdAt?.toDate?.()?.getTime?.() ?? 0,
    }))
  }, [raw])

  const memberRows = useMemo(() => {
    if (!raw?.members) return []
    return raw.members.map((row) => ({
      id: row.id,
      fullName: row.fullName || '',
      email: row.email || '',
      companyName: row.companyName || '',
      memberCode: row.memberCode || '',
      date: formatAnalyticsDate(row.createdAt),
    }))
  }, [raw])

  const handleLogout = async () => {
    await performDashboardLogout()
    navigate('/dashboard/login', { replace: true })
  }

  const exportFullReport = () => {
    if (!raw) return
    const csv = buildAnalyticsExportCsv({
      myConnections: raw.connections,
      allConnections: raw.connections,
      winners: raw.winners,
      memberName: 'Admin Dashboard',
    })
    downloadCsvFile(csv, buildAnalyticsExportFilename('admin-dashboard'))
  }

  if (loading && !metrics) {
    return (
      <DashboardLayout session={session} onLogout={handleLogout}>
        <div className="dashboard-state">Loading analytics…</div>
      </DashboardLayout>
    )
  }

  if (error && !metrics) {
    return (
      <DashboardLayout session={session} onLogout={handleLogout}>
        <div className="dashboard-state dashboard-state--error">
          <p>{error}</p>
          <button type="button" className="dashboard-btn dashboard-btn--primary" onClick={refresh}>
            Retry
          </button>
        </div>
      </DashboardLayout>
    )
  }

  if (!metrics) {
    return (
      <DashboardLayout session={session} onLogout={handleLogout}>
        <div className="dashboard-state">No analytics data available.</div>
      </DashboardLayout>
    )
  }

  const { overview, eventDayComparison, bestPerformingDay, charts, userAnalysis, insights } =
    metrics

  return (
    <DashboardLayout session={session} onLogout={handleLogout}>
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Event Analytics Dashboard</h1>
          <p className="dashboard-header__meta">
            WWISE Expo performance overview
            {fetchedAt
              ? ` · Last updated ${new Date(fetchedAt).toLocaleString()}`
              : ''}
            {refreshing ? ' · Refreshing…' : ''}
          </p>
        </div>
        <div className="dashboard-header__actions">
          <span className="dashboard-badge">Auto-refresh 5 min</span>
          <button type="button" className="dashboard-btn" onClick={refresh} disabled={refreshing}>
            Refresh
          </button>
          <button type="button" className="dashboard-btn dashboard-btn--primary" onClick={exportFullReport}>
            Download report
          </button>
        </div>
      </header>

      <section id="overview" className="dashboard-section">
        <h2 className="dashboard-section__title">Overview</h2>
        <p className="dashboard-section__desc">
          Key metrics from registrations, profile activity, and visitor connections.
        </p>
        <div className="dashboard-stat-grid">
          <StatCard
            label="Total connections"
            value={overview.totalKnownConnections.toLocaleString()}
            hint="Connect form submissions"
          />
          <StatCard
            label="Total registrations"
            value={overview.totalRegistrations.toLocaleString()}
            hint="Registered team members"
          />
          <StatCard
            label="Active members"
            value={overview.activeMembers.toLocaleString()}
            hint="Members with profile activity"
          />
          <StatCard
            label="Profile scans"
            value={overview.totalProfileScans.toLocaleString()}
            hint="Anonymous profile visits"
          />
          <StatCard
            label="Total interactions"
            value={overview.totalInteractions.toLocaleString()}
            hint="Scans + connections"
          />
          <StatCard
            label="Peak connection hour"
            value={overview.peakConnectionHour}
            hint="Based on connection timestamps"
          />
          <StatCard
            label="Connect rate"
            value={`${overview.engagementRate}%`}
            hint="Connections ÷ total interactions"
          />
          <StatCard
            label="Competition entries"
            value={overview.totalCompetitionEntries.toLocaleString()}
            hint="Submitted competition forms"
          />
        </div>
      </section>

      <section id="comparison" className="dashboard-section">
        <h2 className="dashboard-section__title">3-Day Event Comparison</h2>
        <p className="dashboard-section__desc">
          Side-by-side activity for Day 1–3 (2–4 June 2026). Profile scans are aggregate-only and not split by day.
        </p>
        <div className="dashboard-comparison-grid">
          {eventDayComparison.map((day) => (
            <article
              key={day.day}
              className={`dashboard-day-card${bestPerformingDay?.day === day.day ? ' is-best' : ''}`}
            >
              <p className="dashboard-day-card__label">
                {day.label}
                {bestPerformingDay?.day === day.day ? ' · Top day' : ''}
              </p>
              <p className="dashboard-day-card__date">{day.dateLabel}</p>
              <div className="dashboard-day-card__metrics">
                <div className="dashboard-day-card__metric">
                  <span>Connections</span>
                  <strong>{day.connections}</strong>
                </div>
                <div className="dashboard-day-card__metric">
                  <span>Registrations</span>
                  <strong>{day.registrations}</strong>
                </div>
                <div className="dashboard-day-card__metric">
                  <span>Competition</span>
                  <strong>{day.competitionEntries}</strong>
                </div>
                <div className="dashboard-day-card__metric">
                  <span>Total activity</span>
                  <strong>{day.totalActivity}</strong>
                </div>
              </div>
              {day.activityChange != null ? (
                <p
                  className={`dashboard-day-card__change ${day.activityChange >= 0 ? 'is-up' : 'is-down'}`}
                >
                  {day.activityChange >= 0 ? '+' : ''}
                  {day.activityChange}% vs previous day
                </p>
              ) : (
                <p className="dashboard-day-card__change">Baseline day</p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section id="charts" className="dashboard-section">
        <h2 className="dashboard-section__title">Charts & Visualizations</h2>
        <p className="dashboard-section__desc">
          Time-based trends, category breakdowns, and connection activity patterns.
        </p>
        <div className="dashboard-panel-grid">
          <div className="dashboard-panel dashboard-panel--wide">
            <h3 className="dashboard-panel__title">Daily activity trend</h3>
            <DailyActivityChart data={charts.dailyActivity} />
          </div>
          <div className="dashboard-panel">
            <h3 className="dashboard-panel__title">Event day comparison</h3>
            <EventDayBarChart data={charts.eventDayBar} />
          </div>
          <div className="dashboard-panel">
            <h3 className="dashboard-panel__title">Interaction split</h3>
            <InteractionDonutChart data={charts.interactionSplit} />
          </div>
          <div className="dashboard-panel">
            <h3 className="dashboard-panel__title">Areas of interest</h3>
            <InterestPieChart data={charts.interestBreakdown} />
          </div>
          <div className="dashboard-panel">
            <h3 className="dashboard-panel__title">Connections by hour</h3>
            <HourlyBarChart data={charts.hourlyDistribution} />
          </div>
          <div className="dashboard-panel dashboard-panel--wide">
            <h3 className="dashboard-panel__title">Connection heatmap</h3>
            <p className="dashboard-panel__subtitle">Event days × hour of day (connection submissions)</p>
            <ConnectionHeatmap heatmap={metrics.heatmap} />
          </div>
        </div>
      </section>

      <section id="users" className="dashboard-section">
        <h2 className="dashboard-section__title">User Connection Analysis</h2>
        <p className="dashboard-section__desc">
          Member performance, repeat visitors, and recent activity timeline.
        </p>
        <div className="dashboard-panel-grid">
          <div className="dashboard-panel">
            <h3 className="dashboard-panel__title">Most active members (by connections received)</h3>
            <ul className="dashboard-insight-list">
              {userAnalysis.mostActiveMembers.length === 0 ? (
                <li>No connection data yet.</li>
              ) : (
                userAnalysis.mostActiveMembers.map((member) => (
                  <li key={member.memberId}>
                    <strong>{member.memberName}</strong> — {member.count} connection
                    {member.count === 1 ? '' : 's'}
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="dashboard-panel">
            <h3 className="dashboard-panel__title">Engagement ranking (scans + connections)</h3>
            <ul className="dashboard-insight-list">
              {userAnalysis.memberRankings.length === 0 ? (
                <li>No engagement data yet.</li>
              ) : (
                userAnalysis.memberRankings.slice(0, 8).map((member) => (
                  <li key={member.memberId}>
                    <strong>{member.memberName}</strong> — {member.profileScans} scans,{' '}
                    {member.knownConnections} connections
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="dashboard-panel">
            <h3 className="dashboard-panel__title">Repeat visitor emails</h3>
            <ul className="dashboard-insight-list">
              {userAnalysis.repeatVisitors.length === 0 ? (
                <li>No repeat connections detected.</li>
              ) : (
                userAnalysis.repeatVisitors.slice(0, 8).map((row) => (
                  <li key={row.email}>
                    {row.email} — {row.count} connections
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="dashboard-panel">
            <h3 className="dashboard-panel__title">Recent activity timeline</h3>
            <ul className="dashboard-timeline">
              {userAnalysis.timeline.length === 0 ? (
                <li>No recent activity.</li>
              ) : (
                userAnalysis.timeline.slice(0, 12).map((item, index) => (
                  <li key={`${item.type}-${index}`}>
                    <strong>{item.label}</strong>
                    {item.memberName ? ` · via ${item.memberName}` : ''} —{' '}
                    {item.at?.toLocaleString?.() || '—'}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>

      <section id="tables" className="dashboard-section">
        <h2 className="dashboard-section__title">Data Tables</h2>
        <p className="dashboard-section__desc">Searchable, sortable records with CSV export.</p>
        <div className="dashboard-panel dashboard-panel--wide">
          <h3 className="dashboard-panel__title">Connections</h3>
          <DataTable
            columns={[
              { key: 'fullName', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'companyName', label: 'Company' },
              { key: 'areaOfInterest', label: 'Interest' },
              { key: 'memberName', label: 'Member' },
              { key: 'date', label: 'Date' },
            ]}
            rows={connectionRows}
            searchKeys={['fullName', 'email', 'companyName', 'memberName', 'date']}
            exportFilename="wwise-connections.csv"
          />
        </div>
        <div className="dashboard-panel dashboard-panel--wide" style={{ marginTop: '1rem' }}>
          <h3 className="dashboard-panel__title">Registrations</h3>
          <DataTable
            columns={[
              { key: 'fullName', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'companyName', label: 'Company' },
              { key: 'memberCode', label: 'Code' },
              { key: 'date', label: 'Registered' },
            ]}
            rows={memberRows}
            searchKeys={['fullName', 'email', 'companyName', 'memberCode', 'date']}
            exportFilename="wwise-registrations.csv"
          />
        </div>
      </section>

      <section id="summary" className="dashboard-section">
        <h2 className="dashboard-section__title">Executive Summary</h2>
        <p className="dashboard-section__desc">
          Auto-generated insights from available event data.
        </p>
        <div className="dashboard-panel-grid">
          <div className="dashboard-panel">
            <h3 className="dashboard-panel__title">Key insights</h3>
            <ul className="dashboard-insight-list">
              {insights.summary.map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          </div>
          <div className="dashboard-panel">
            <h3 className="dashboard-panel__title">Recommendations</h3>
            <ul className="dashboard-insight-list">
              {insights.recommendations.map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </DashboardLayout>
  )
}

export { DashboardLoginPage }
