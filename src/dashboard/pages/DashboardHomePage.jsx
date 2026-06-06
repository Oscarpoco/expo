import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  buildAnalyticsExportCsv,
  buildAnalyticsExportFilename,
  downloadCsvFile,
} from '../../utils/exportAnalyticsCsv.js'
import { formatAnalyticsDate } from '../../utils/connectionCards.js'
import { DashboardLayout } from '../components/DashboardLayout.jsx'
import { useDashboardData } from '../hooks/useDashboardData.js'
import { ChartsTab } from '../tabs/ChartsTab.jsx'
import { ComparisonTab } from '../tabs/ComparisonTab.jsx'
import { OverviewTab } from '../tabs/OverviewTab.jsx'
import { SummaryTab } from '../tabs/SummaryTab.jsx'
import { TablesTab } from '../tabs/TablesTab.jsx'
import { UsersTab } from '../tabs/UsersTab.jsx'
import {
  DashboardLoginPage,
  performDashboardLogout,
} from './DashboardLoginPage.jsx'

/**
 * @param {{ session: { fullName?: string, email: string } }} props
 */
export function DashboardHomePage({ session }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
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

  const layoutProps = {
    session,
    activeTab,
    onTabChange: setActiveTab,
    fetchedAt,
    refreshing,
    onRefresh: refresh,
    onExport: exportFullReport,
    onLogout: handleLogout,
  }

  if (loading && !metrics) {
    return (
      <DashboardLayout {...layoutProps}>
        <div className="dashboard-state">Loading analytics…</div>
      </DashboardLayout>
    )
  }

  if (error && !metrics) {
    return (
      <DashboardLayout {...layoutProps}>
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
      <DashboardLayout {...layoutProps}>
        <div className="dashboard-state">No analytics data available.</div>
      </DashboardLayout>
    )
  }

  const { overview, eventDayComparison, bestPerformingDay, charts, userAnalysis, insights } =
    metrics

  let tabContent = null
  switch (activeTab) {
    case 'comparison':
      tabContent = (
        <ComparisonTab
          eventDayComparison={eventDayComparison}
          bestPerformingDay={bestPerformingDay}
        />
      )
      break
    case 'charts':
      tabContent = <ChartsTab charts={charts} heatmap={metrics.heatmap} />
      break
    case 'users':
      tabContent = <UsersTab userAnalysis={userAnalysis} />
      break
    case 'tables':
      tabContent = (
        <TablesTab connectionRows={connectionRows} memberRows={memberRows} />
      )
      break
    case 'summary':
      tabContent = <SummaryTab insights={insights} />
      break
    default:
      tabContent = (
        <OverviewTab
          overview={overview}
          bestPerformingDay={bestPerformingDay}
          insightHighlight={insights.summary[0]}
        />
      )
  }

  return <DashboardLayout {...layoutProps}>{tabContent}</DashboardLayout>
}

export { DashboardLoginPage }
