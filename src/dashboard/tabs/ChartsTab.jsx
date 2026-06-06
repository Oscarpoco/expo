import {
  HiOutlineChartBarSquare,
  HiOutlineChartPie,
  HiOutlineClock,
  HiOutlineFire,
  HiOutlineMap,
  HiOutlinePresentationChartLine,
  HiOutlineSquares2X2,
} from 'react-icons/hi2'

import {
  ConnectionHeatmap,
  DailyActivityChart,
  EventDayBarChart,
  HourlyBarChart,
  InteractionDonutChart,
  InterestPieChart,
} from '../components/DashboardCharts.jsx'
import {
  MotionGrid,
  MotionHero,
  MotionPage,
  MotionPanel,
  MotionSection,
} from '../components/MotionPrimitives.jsx'

/**
 * @param {{
 *   icon: import('react').ComponentType,
 *   tone?: 'blue' | 'navy' | 'sky',
 *   title: string,
 *   subtitle?: string,
 *   children: import('react').ReactNode,
 *   wide?: boolean,
 *   tall?: boolean,
 * }} props
 */
function ChartPanel({
  icon: Icon,
  tone = 'blue',
  title,
  subtitle,
  children,
  wide = false,
  tall = false,
}) {
  return (
    <MotionPanel
      className={`charts-panel${wide ? ' charts-panel--wide' : ''}${tall ? ' charts-panel--tall' : ''}`}
    >
      <div className="charts-panel__head">
        <span className={`charts-panel__icon charts-panel__icon--${tone}`}>
          <Icon aria-hidden />
        </span>
        <div>
          <h3 className="charts-panel__title">{title}</h3>
          {subtitle ? <p className="charts-panel__subtitle">{subtitle}</p> : null}
        </div>
      </div>
      <div className="charts-panel__body">{children}</div>
    </MotionPanel>
  )
}

/** @param {{ charts: object, heatmap: object[], overview?: object }} props */
export function ChartsTab({ charts, heatmap, overview }) {
  const peakHourRow = charts.hourlyDistribution?.reduce(
    (best, row) => (row.count > (best?.count ?? -1) ? row : best),
    null,
  )
  const topInterest = charts.interestBreakdown?.[0]
  const trackedDays = charts.dailyActivity?.length ?? 0
  const interactionTotal = charts.interactionSplit?.reduce(
    (sum, row) => sum + row.value,
    0,
  )

  return (
    <MotionPage className="charts">
      <MotionHero className="charts-hero">
        <div className="charts-hero__main">
          <span className="charts-hero__eyebrow">Visual analytics · WWISE Expo</span>
          <h2 className="charts-hero__title">Charts & visualizations</h2>
          <p className="charts-hero__desc">
            Time-based trends, category breakdowns, and connection activity patterns across
            the event window.
          </p>
          <div className="charts-hero__chips">
            {overview?.peakConnectionHour && overview.peakConnectionHour !== '—' ? (
              <span className="charts-chip">
                <HiOutlineClock aria-hidden />
                Peak hour: {overview.peakConnectionHour}
              </span>
            ) : null}
            {topInterest ? (
              <span className="charts-chip">
                <HiOutlineFire aria-hidden />
                Top interest: {topInterest.name}
              </span>
            ) : null}
            {trackedDays > 0 ? (
              <span className="charts-chip">
                <HiOutlinePresentationChartLine aria-hidden />
                {trackedDays} day{trackedDays === 1 ? '' : 's'} tracked
              </span>
            ) : null}
            <span className="charts-chip charts-chip--live">
              <span className="charts-chip__dot" aria-hidden />
              Live data
            </span>
          </div>
        </div>

        <div className="charts-hero__stats">
          <div className="charts-hero__stat">
            <strong>{(overview?.totalKnownConnections ?? 0).toLocaleString()}</strong>
            <span>Total connections</span>
          </div>
          {peakHourRow?.count > 0 ? (
            <div className="charts-hero__stat charts-hero__stat--highlight">
              <strong>{peakHourRow.hour}</strong>
              <span>
                Busiest hour · {peakHourRow.count.toLocaleString()} connections
              </span>
            </div>
          ) : interactionTotal > 0 ? (
            <div className="charts-hero__stat charts-hero__stat--highlight">
              <strong>{interactionTotal.toLocaleString()}</strong>
              <span>Total profile interactions</span>
            </div>
          ) : null}
        </div>
      </MotionHero>

      <MotionSection className="charts-section">
        <h3 className="charts-section__label">
          <HiOutlinePresentationChartLine aria-hidden />
          Trends
        </h3>
        <MotionGrid className="charts-grid">
          <ChartPanel
            icon={HiOutlineChartBarSquare}
            tone="blue"
            title="Daily activity trend"
            subtitle="Connections, registrations, and competition entries over time"
            wide
          >
            <DailyActivityChart data={charts.dailyActivity} />
          </ChartPanel>
          <ChartPanel
            icon={HiOutlineSquares2X2}
            tone="navy"
            title="Event day comparison"
            subtitle="Side-by-side totals for each expo day"
          >
            <EventDayBarChart data={charts.eventDayBar} />
          </ChartPanel>
        </MotionGrid>
      </MotionSection>

      <MotionSection className="charts-section">
        <h3 className="charts-section__label">
          <HiOutlineChartPie aria-hidden />
          Breakdowns
        </h3>
        <MotionGrid className="charts-grid">
          <ChartPanel
            icon={HiOutlineChartPie}
            tone="sky"
            title="Interaction split"
            subtitle="Anonymous profile scans vs known connections"
          >
            <InteractionDonutChart data={charts.interactionSplit} />
          </ChartPanel>
          <ChartPanel
            icon={HiOutlineFire}
            tone="blue"
            title="Areas of interest"
            subtitle="Visitor interest categories from connection forms"
            tall
          >
            <InterestPieChart data={charts.interestBreakdown} />
          </ChartPanel>
          <ChartPanel
            icon={HiOutlineClock}
            tone="navy"
            title="Connections by hour"
            subtitle="Hourly distribution of connection submissions"
            tall
          >
            <HourlyBarChart data={charts.hourlyDistribution} />
          </ChartPanel>
        </MotionGrid>
      </MotionSection>

      <MotionSection className="charts-section">
        <h3 className="charts-section__label">
          <HiOutlineMap aria-hidden />
          Activity patterns
        </h3>
        <MotionGrid className="charts-grid">
          <ChartPanel
            icon={HiOutlineMap}
            tone="sky"
            title="Connection heatmap"
            subtitle="Event days × hour of day — darker cells indicate more connections"
            wide
          >
            <ConnectionHeatmap heatmap={heatmap} />
          </ChartPanel>
        </MotionGrid>
      </MotionSection>
    </MotionPage>
  )
}
