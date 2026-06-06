import { StatCard } from '../components/StatCard.jsx'

/** @param {{ overview: object }} props */
export function OverviewTab({ overview }) {
  return (
    <>
      <header className="dashboard-section-head">
        <h2 className="dashboard-section-head__title">Overview</h2>
        <p className="dashboard-section-head__desc">
          Key metrics from registrations, profile activity, and visitor connections.
        </p>
      </header>
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
    </>
  )
}
