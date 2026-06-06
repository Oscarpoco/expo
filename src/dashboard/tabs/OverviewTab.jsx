import { motion } from 'framer-motion'
import {
  HiOutlineBolt,
  HiOutlineCalendarDays,
  HiOutlineChartPie,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineLink,
  HiOutlineTrophy,
  HiOutlineUserPlus,
  HiOutlineUsers,
} from 'react-icons/hi2'

import { StatCard } from '../components/StatCard.jsx'

/** @param {{ rate: number }} props */
function ConnectRateRing({ rate }) {
  const clamped = Math.min(Math.max(rate, 0), 100)

  return (
    <div
      className="overview-rate-ring"
      style={{ '--rate': `${clamped * 3.6}deg` }}
      aria-hidden
    >
      <div className="overview-rate-ring__inner">
        <span className="overview-rate-ring__value">{rate}%</span>
        <span className="overview-rate-ring__label">Connect rate</span>
      </div>
    </div>
  )
}

const GRID_MOTION = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const ITEM_MOTION = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
}

/**
 * @param {{
 *   overview: object,
 *   bestPerformingDay?: object,
 *   insightHighlight?: string
 * }} props
 */
export function OverviewTab({ overview, bestPerformingDay, insightHighlight }) {
  const stats = [
    {
      key: 'connections',
      label: 'Total connections',
      value: overview.totalKnownConnections.toLocaleString(),
      hint: 'Connect form submissions',
      icon: HiOutlineLink,
      accent: 'blue',
    },
    {
      key: 'registrations',
      label: 'Total registrations',
      value: overview.totalRegistrations.toLocaleString(),
      hint: 'Registered team members',
      icon: HiOutlineUserPlus,
      accent: 'navy',
    },
    {
      key: 'active',
      label: 'Active members',
      value: overview.activeMembers.toLocaleString(),
      hint: 'Members with profile activity',
      icon: HiOutlineUsers,
      accent: 'sky',
    },
    {
      key: 'scans',
      label: 'Total scans',
      value: overview.totalProfileScans.toLocaleString(),
      hint: 'Sum of totalCount across members',
      icon: HiOutlineEye,
      accent: 'blue',
    },
    {
      key: 'interactions',
      label: 'Total interactions',
      value: overview.totalInteractions.toLocaleString(),
      hint: 'Equals total scans',
      icon: HiOutlineBolt,
      accent: 'navy',
    },
    {
      key: 'peak',
      label: 'Peak connection hour',
      value: overview.peakConnectionHour,
      hint: 'Based on connection timestamps',
      icon: HiOutlineClock,
      accent: 'sky',
    },
    {
      key: 'rate',
      label: 'Connect rate',
      value: `${overview.engagementRate}%`,
      hint: 'Connections ÷ total scans',
      icon: HiOutlineChartPie,
      accent: 'blue',
    },
    {
      key: 'competition',
      label: 'Competition entries',
      value: overview.totalCompetitionEntries.toLocaleString(),
      hint: 'Submitted competition forms',
      icon: HiOutlineTrophy,
      accent: 'navy',
    },
  ]

  return (
    <div className="overview">
      <motion.section
        className="overview-hero"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="overview-hero__main">
          <span className="overview-hero__eyebrow">WWISE Expo · 2–4 June 2026</span>
          <h2 className="overview-hero__title">Event performance snapshot</h2>
          <p className="overview-hero__desc">
            {insightHighlight ||
              'Live summary of registrations, profile activity, and visitor connections across the event.'}
          </p>
          <div className="overview-hero__chips">
            {bestPerformingDay?.totalActivity > 0 ? (
              <span className="overview-chip">
                <HiOutlineCalendarDays aria-hidden />
                Top day: {bestPerformingDay.label} ({bestPerformingDay.totalActivity} interactions)
              </span>
            ) : null}
            {overview.peakConnectionHour !== '—' ? (
              <span className="overview-chip">
                <HiOutlineClock aria-hidden />
                Peak hour: {overview.peakConnectionHour}
              </span>
            ) : null}
            <span className="overview-chip overview-chip--live">
              <span className="overview-chip__dot" aria-hidden />
              Live data
            </span>
          </div>
        </div>

        <div className="overview-hero__metrics">
          <ConnectRateRing rate={overview.engagementRate} />
          <div className="overview-hero__stat-block">
            <strong>{overview.totalInteractions.toLocaleString()}</strong>
            <span>Total interactions</span>
          </div>
          <div className="overview-hero__stat-block">
            <strong>{overview.totalKnownConnections.toLocaleString()}</strong>
            <span>Known connections</span>
          </div>
        </div>
      </motion.section>

      <motion.div
        className="dashboard-stat-grid overview-stat-grid"
        variants={GRID_MOTION}
        initial="hidden"
        animate="show"
      >
        {stats.map((stat) => (
          <motion.div key={stat.key} variants={ITEM_MOTION}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
