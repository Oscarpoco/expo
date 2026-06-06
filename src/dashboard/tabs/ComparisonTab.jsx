import { motion } from 'framer-motion'
import {
  HiArrowTrendingDown,
  HiArrowTrendingUp,
  HiOutlineCalendarDays,
  HiOutlineLink,
  HiOutlineTrophy,
  HiOutlineUserPlus,
} from 'react-icons/hi2'

import { EventDayBarChart } from '../components/DashboardCharts.jsx'

const CARD_MOTION = {
  hidden: { opacity: 0, y: 16 },
  show: (index) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
}

const METRIC_CONFIG = [
  { key: 'connections', label: 'Connections', icon: HiOutlineLink, tone: 'blue' },
  { key: 'registrations', label: 'Registrations', icon: HiOutlineUserPlus, tone: 'navy' },
  { key: 'competitionEntries', label: 'Competition', icon: HiOutlineTrophy, tone: 'sky' },
]

/**
 * @param {{
 *   eventDayComparison: object[],
 *   bestPerformingDay?: object,
 *   eventDayBar?: object[]
 * }} props
 */
export function ComparisonTab({ eventDayComparison, bestPerformingDay, eventDayBar = [] }) {
  const maxActivity = Math.max(
    ...eventDayComparison.map((day) => day.totalActivity),
    1,
  )
  const maxConnections = Math.max(
    ...eventDayComparison.map((day) => day.connections),
    1,
  )
  const maxRegistrations = Math.max(
    ...eventDayComparison.map((day) => day.registrations),
    1,
  )
  const maxCompetition = Math.max(
    ...eventDayComparison.map((day) => day.competitionEntries),
    1,
  )
  const metricMax = {
    connections: maxConnections,
    registrations: maxRegistrations,
    competitionEntries: maxCompetition,
  }

  const eventTotal = eventDayComparison.reduce(
    (sum, day) => sum + day.totalActivity,
    0,
  )

  return (
    <div className="comparison">
      <motion.section
        className="comparison-hero"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="comparison-hero__main">
          <span className="comparison-hero__eyebrow">2–4 June 2026 · Event days</span>
          <h2 className="comparison-hero__title">3-day performance comparison</h2>
          <p className="comparison-hero__desc">
            Side-by-side view of connections, registrations, and competition entries for
            each expo day. Profile scans are aggregate-only and not split by day.
          </p>
        </div>
        <div className="comparison-hero__stats">
          <div className="comparison-hero__stat">
            <strong>{eventTotal.toLocaleString()}</strong>
            <span>Combined activity</span>
          </div>
          {bestPerformingDay?.totalActivity > 0 ? (
            <div className="comparison-hero__stat comparison-hero__stat--highlight">
              <strong>{bestPerformingDay.label}</strong>
              <span>
                Top day · {bestPerformingDay.totalActivity.toLocaleString()} interactions
              </span>
            </div>
          ) : null}
        </div>
      </motion.section>

      <div className="comparison-grid">
        {eventDayComparison.map((day, index) => {
          const isBest = bestPerformingDay?.day === day.day
          const activityWidth = Math.round((day.totalActivity / maxActivity) * 100)

          return (
            <motion.article
              key={day.day}
              className={`comparison-day${isBest ? ' is-best' : ''}`}
              custom={index}
              variants={CARD_MOTION}
              initial="hidden"
              animate="show"
            >
              <div className="comparison-day__head">
                <div className="comparison-day__badge">{day.day}</div>
                <div>
                  <p className="comparison-day__label">{day.label}</p>
                  <p className="comparison-day__date">{day.dateLabel}</p>
                </div>
                {isBest ? <span className="comparison-day__top-tag">Top day</span> : null}
              </div>

              <div className="comparison-day__total">
                <strong>{day.totalActivity.toLocaleString()}</strong>
                <span>Total activity</span>
                <div className="comparison-day__total-bar">
                  <div
                    className="comparison-day__total-fill"
                    style={{ width: `${activityWidth}%` }}
                  />
                </div>
              </div>

              <div className="comparison-day__metrics">
                {METRIC_CONFIG.map(({ key, label, icon: Icon, tone }) => {
                  const value = day[key]
                  const width = Math.round((value / metricMax[key]) * 100)
                  return (
                    <div key={key} className="comparison-metric">
                      <div className="comparison-metric__row">
                        <span className={`comparison-metric__icon comparison-metric__icon--${tone}`}>
                          <Icon aria-hidden />
                        </span>
                        <span className="comparison-metric__label">{label}</span>
                        <strong className="comparison-metric__value">{value}</strong>
                      </div>
                      <div className="comparison-metric__track">
                        <div
                          className={`comparison-metric__fill comparison-metric__fill--${tone}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div
                className={`comparison-day__change${
                  day.activityChange == null
                    ? ''
                    : day.activityChange >= 0
                      ? ' is-up'
                      : ' is-down'
                }`}
              >
                {day.activityChange != null ? (
                  <>
                    {day.activityChange >= 0 ? (
                      <HiArrowTrendingUp aria-hidden />
                    ) : (
                      <HiArrowTrendingDown aria-hidden />
                    )}
                    {day.activityChange >= 0 ? '+' : ''}
                    {day.activityChange}% vs previous day
                  </>
                ) : (
                  <>
                    <HiOutlineCalendarDays aria-hidden />
                    Baseline day
                  </>
                )}
              </div>
            </motion.article>
          )
        })}
      </div>

      {eventDayBar.length > 0 ? (
        <motion.section
          className="dashboard-panel comparison-chart"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <h3 className="dashboard-panel__title">Visual comparison</h3>
          <p className="dashboard-panel__subtitle">
            Bar chart view of daily connections, registrations, and competition entries
          </p>
          <EventDayBarChart data={eventDayBar} />
        </motion.section>
      ) : null}
    </div>
  )
}
