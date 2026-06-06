import {
  ConnectionHeatmap,
  DailyActivityChart,
  EventDayBarChart,
  HourlyBarChart,
  InteractionDonutChart,
  InterestPieChart,
} from '../components/DashboardCharts.jsx'

/** @param {{ charts: object, heatmap: object[] }} props */
export function ChartsTab({ charts, heatmap }) {
  return (
    <>
      <header className="dashboard-section-head">
        <h2 className="dashboard-section-head__title">Charts & Visualizations</h2>
        <p className="dashboard-section-head__desc">
          Time-based trends, category breakdowns, and connection activity patterns.
        </p>
      </header>
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
        <div className="dashboard-panel dashboard-panel--chart-tall">
          <h3 className="dashboard-panel__title">Areas of interest</h3>
          <InterestPieChart data={charts.interestBreakdown} />
        </div>
        <div className="dashboard-panel dashboard-panel--chart-tall">
          <h3 className="dashboard-panel__title">Connections by hour</h3>
          <HourlyBarChart data={charts.hourlyDistribution} />
        </div>
        <div className="dashboard-panel dashboard-panel--wide">
          <h3 className="dashboard-panel__title">Connection heatmap</h3>
          <p className="dashboard-panel__subtitle">
            Event days × hour of day (connection submissions)
          </p>
          <ConnectionHeatmap heatmap={heatmap} />
        </div>
      </div>
    </>
  )
}
