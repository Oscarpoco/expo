import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  HiOutlineBuildingOffice2,
  HiOutlineLink,
  HiOutlineTableCells,
  HiOutlineUserPlus,
} from 'react-icons/hi2'

import { DataTable } from '../components/DataTable.jsx'
import {
  MotionFade,
  MotionHero,
  MotionPage,
} from '../components/MotionPrimitives.jsx'
import { useDashMotion } from '../motion/index.js'

const VIEW_OPTIONS = [
  { id: 'connections', label: 'Connections', icon: HiOutlineLink },
  { id: 'registrations', label: 'Registrations', icon: HiOutlineUserPlus },
]

/**
 * @param {{
 *   icon: import('react').ComponentType,
 *   tone?: 'blue' | 'navy' | 'sky',
 *   title: string,
 *   subtitle?: string,
 *   children: import('react').ReactNode,
 * }} props
 */
function ConnectionsPanel({
  icon: Icon,
  tone = 'blue',
  title,
  subtitle,
  children,
}) {
  const { panel, tabExit } = useDashMotion()

  return (
    <motion.article
      className="connections-panel"
      variants={panel.variants}
      initial="hidden"
      animate="show"
      exit={tabExit}
    >
      <div className="connections-panel__head">
        <span className={`connections-panel__icon connections-panel__icon--${tone}`}>
          <Icon aria-hidden />
        </span>
        <div>
          <h3 className="connections-panel__title">{title}</h3>
          {subtitle ? <p className="connections-panel__subtitle">{subtitle}</p> : null}
        </div>
      </div>
      <div className="connections-panel__body">{children}</div>
    </motion.article>
  )
}

/** @param {string} value */
function InterestPill({ value }) {
  const label = value?.trim() || 'Unspecified'
  return <span className="connections-pill">{label}</span>
}

/** @param {string} value */
function MemberTag({ value }) {
  const label = value?.trim() || '—'
  return <span className="connections-member">{label}</span>
}

/**
 * @param {{
 *   connectionRows: object[],
 *   memberRows: object[],
 *   overview?: object
 * }} props
 */
export function TablesTab({ connectionRows, memberRows, overview }) {
  const [activeView, setActiveView] = useState('connections')

  const stats = useMemo(() => {
    const companies = new Set(
      connectionRows.map((row) => row.companyName?.trim()).filter(Boolean),
    )
    const members = new Set(
      connectionRows.map((row) => row.memberName?.trim()).filter(Boolean),
    )
    const interestCounts = new Map()
    for (const row of connectionRows) {
      const interest = (row.areaOfInterest || 'Unspecified').trim()
      interestCounts.set(interest, (interestCounts.get(interest) || 0) + 1)
    }
    const topInterest = [...interestCounts.entries()].sort((a, b) => b[1] - a[1])[0]

    return {
      connections: connectionRows.length,
      registrations: memberRows.length,
      companies: companies.size,
      members: members.size,
      topInterest: topInterest ? { name: topInterest[0], count: topInterest[1] } : null,
    }
  }, [connectionRows, memberRows])

  const connectionColumns = [
    { key: 'fullName', label: 'Name' },
    {
      key: 'email',
      label: 'Email',
      render: (row) => <span className="connections-email">{row.email || '—'}</span>,
    },
    { key: 'companyName', label: 'Company' },
    {
      key: 'areaOfInterest',
      label: 'Interest',
      render: (row) => <InterestPill value={row.areaOfInterest} />,
    },
    {
      key: 'memberName',
      label: 'Member',
      render: (row) => <MemberTag value={row.memberName} />,
    },
    { key: 'date', label: 'Date' },
  ]

  const registrationColumns = [
    { key: 'fullName', label: 'Name' },
    {
      key: 'email',
      label: 'Email',
      render: (row) => <span className="connections-email">{row.email || '—'}</span>,
    },
    { key: 'companyName', label: 'Company' },
    {
      key: 'memberCode',
      label: 'Code',
      render: (row) => (
        <span className="connections-code">{row.memberCode || '—'}</span>
      ),
    },
    { key: 'date', label: 'Registered' },
  ]

  return (
    <MotionPage className="connections">
      <MotionHero className="connections-hero">
        <div className="connections-hero__main">
          <span className="connections-hero__eyebrow">Records · WWISE Expo</span>
          <h2 className="connections-hero__title">Connection records</h2>
          <p className="connections-hero__desc">
            Searchable, sortable visitor connections and team registrations with CSV export
            for reporting and follow-up.
          </p>
          <div className="connections-hero__chips">
            <span className="connections-chip">
              <HiOutlineLink aria-hidden />
              {stats.connections.toLocaleString()} connection{stats.connections === 1 ? '' : 's'}
            </span>
            <span className="connections-chip">
              <HiOutlineUserPlus aria-hidden />
              {stats.registrations.toLocaleString()} registration{stats.registrations === 1 ? '' : 's'}
            </span>
            {stats.companies > 0 ? (
              <span className="connections-chip">
                <HiOutlineBuildingOffice2 aria-hidden />
                {stats.companies} compan{stats.companies === 1 ? 'y' : 'ies'}
              </span>
            ) : null}
            <span className="connections-chip connections-chip--live">
              <span className="connections-chip__dot" aria-hidden />
              Export ready
            </span>
          </div>
        </div>

        <div className="connections-hero__stats">
          <div className="connections-hero__stat connections-hero__stat--highlight">
            <strong>{stats.connections.toLocaleString()}</strong>
            <span>Visitor connections</span>
          </div>
          <div className="connections-hero__stat">
            <strong>{stats.registrations.toLocaleString()}</strong>
            <span>Team registrations</span>
          </div>
        </div>
      </MotionHero>

      <MotionFade className="connections-mini-stats">
        <div className="connections-mini-stat">
          <strong>{stats.members.toLocaleString()}</strong>
          <span>Members with connections</span>
        </div>
        <div className="connections-mini-stat">
          <strong>{stats.companies.toLocaleString()}</strong>
          <span>Unique companies</span>
        </div>
        {stats.topInterest ? (
          <div className="connections-mini-stat">
            <strong>{stats.topInterest.name}</strong>
            <span>Top interest · {stats.topInterest.count} entries</span>
          </div>
        ) : null}
        {(overview?.totalCompetitionEntries ?? 0) > 0 ? (
          <div className="connections-mini-stat">
            <strong>{overview.totalCompetitionEntries.toLocaleString()}</strong>
            <span>Competition entries</span>
          </div>
        ) : null}
      </MotionFade>

      <MotionFade className="connections-view-toggle" role="tablist" aria-label="Record type">
        {VIEW_OPTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeView === id}
            className={`connections-view-toggle__btn${activeView === id ? ' is-active' : ''}`}
            onClick={() => setActiveView(id)}
          >
            <Icon aria-hidden />
            {label}
            <span className="connections-view-toggle__count">
              {id === 'connections' ? stats.connections : stats.registrations}
            </span>
          </button>
        ))}
      </MotionFade>

      <AnimatePresence mode="wait">
        {activeView === 'connections' ? (
          <ConnectionsPanel
            key="connections"
            icon={HiOutlineLink}
            tone="blue"
            title="Visitor connections"
            subtitle="Connect form submissions with member attribution and interest areas"
          >
            <DataTable
              columns={connectionColumns}
              rows={connectionRows}
              searchKeys={['fullName', 'email', 'companyName', 'memberName', 'areaOfInterest', 'date']}
              exportFilename="wwise-connections.csv"
              searchPlaceholder="Search connections…"
              emptyMessage="No connections recorded yet."
            />
          </ConnectionsPanel>
        ) : (
          <ConnectionsPanel
            key="registrations"
            icon={HiOutlineUserPlus}
            tone="navy"
            title="Team registrations"
            subtitle="Registered expo members with company and member code"
          >
            <DataTable
              columns={registrationColumns}
              rows={memberRows}
              searchKeys={['fullName', 'email', 'companyName', 'memberCode', 'date']}
              exportFilename="wwise-registrations.csv"
              searchPlaceholder="Search registrations…"
              emptyMessage="No registrations recorded yet."
            />
          </ConnectionsPanel>
        )}
      </AnimatePresence>

      <MotionFade className="connections-footnote">
        <HiOutlineTableCells aria-hidden />
        Use the view toggle to switch datasets. Sort any column by clicking its header. CSV
        export includes your current search filter.
      </MotionFade>
    </MotionPage>
  )
}
