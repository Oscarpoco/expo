import {
  HiOutlineArrowPath,
  HiOutlineClock,
  HiOutlineLink,
  HiOutlineTrophy,
  HiOutlineUserGroup,
  HiOutlineUserPlus,
  HiOutlineUsers,
} from 'react-icons/hi2'

import {
  MotionGrid,
  MotionHero,
  MotionPage,
  MotionPanel,
  MotionSection,
} from '../components/MotionPrimitives.jsx'

const TIMELINE_TYPES = {
  connection: { label: 'Connection', icon: HiOutlineLink, tone: 'blue' },
  registration: { label: 'Registration', icon: HiOutlineUserPlus, tone: 'navy' },
  competition: { label: 'Competition', icon: HiOutlineTrophy, tone: 'sky' },
}

/** @param {string} name */
function memberInitials(name) {
  const parts = (name || '?').trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return (parts[0]?.slice(0, 2) || '?').toUpperCase()
}

/** @param {Date | null | undefined} date */
function formatTimelineDate(date) {
  if (!date) return '—'
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * @param {{
 *   icon: import('react').ComponentType,
 *   tone?: 'blue' | 'navy' | 'sky',
 *   title: string,
 *   subtitle?: string,
 *   children: import('react').ReactNode,
 *   wide?: boolean,
 * }} props
 */
function UserPanel({
  icon: Icon,
  tone = 'blue',
  title,
  subtitle,
  children,
  wide = false,
}) {
  return (
    <MotionPanel className={`users-panel${wide ? ' users-panel--wide' : ''}`}>
      <div className="users-panel__head">
        <span className={`users-panel__icon users-panel__icon--${tone}`}>
          <Icon aria-hidden />
        </span>
        <div>
          <h3 className="users-panel__title">{title}</h3>
          {subtitle ? <p className="users-panel__subtitle">{subtitle}</p> : null}
        </div>
      </div>
      <div className="users-panel__body">{children}</div>
    </MotionPanel>
  )
}

/** @param {{ rank: number, top?: boolean }} props */
function RankBadge({ rank, top = false }) {
  return (
    <span className={`users-rank-badge${top ? ' is-top' : ''}${rank <= 3 ? ' is-medal' : ''}`}>
      {rank}
    </span>
  )
}

/** @param {{ userAnalysis: object, overview?: object }} props */
export function UsersTab({ userAnalysis, overview }) {
  const { mostActiveMembers, memberRankings, repeatVisitors, timeline } = userAnalysis

  const topMember = mostActiveMembers[0]
  const topEngaged = memberRankings[0]
  const maxConnections = Math.max(...mostActiveMembers.map((m) => m.count), 1)

  return (
    <MotionPage className="users">
      <MotionHero className="users-hero">
        <div className="users-hero__main">
          <span className="users-hero__eyebrow">Member analytics · WWISE Expo</span>
          <h2 className="users-hero__title">User connection analysis</h2>
          <p className="users-hero__desc">
            Member performance rankings, repeat visitor patterns, and a live feed of recent
            registrations, connections, and competition activity.
          </p>
          <div className="users-hero__chips">
            {topMember ? (
              <span className="users-chip">
                <HiOutlineLink aria-hidden />
                Top connector: {topMember.memberName}
              </span>
            ) : null}
            {repeatVisitors.length > 0 ? (
              <span className="users-chip">
                <HiOutlineArrowPath aria-hidden />
                {repeatVisitors.length} repeat visitor{repeatVisitors.length === 1 ? '' : 's'}
              </span>
            ) : null}
            {(overview?.activeMembers ?? 0) > 0 ? (
              <span className="users-chip">
                <HiOutlineUsers aria-hidden />
                {overview.activeMembers} active member{overview.activeMembers === 1 ? '' : 's'}
              </span>
            ) : null}
            <span className="users-chip users-chip--live">
              <span className="users-chip__dot" aria-hidden />
              Live data
            </span>
          </div>
        </div>

        <div className="users-hero__stats">
          {topMember ? (
            <div className="users-hero__stat users-hero__stat--highlight">
              <strong>{topMember.memberName}</strong>
              <span>
                Most connections · {topMember.count.toLocaleString()}
              </span>
            </div>
          ) : null}
          {topEngaged ? (
            <div className="users-hero__stat">
              <strong>{topEngaged.totalEngagement.toLocaleString()}</strong>
              <span>
                Peak engagement · {topEngaged.memberName}
              </span>
            </div>
          ) : (
            <div className="users-hero__stat">
              <strong>{(overview?.totalRegistrations ?? 0).toLocaleString()}</strong>
              <span>Registered members</span>
            </div>
          )}
        </div>
      </MotionHero>

      <MotionSection className="users-section">
        <h3 className="users-section__label">
          <HiOutlineUserGroup aria-hidden />
          Member performance
        </h3>
        <MotionGrid className="users-grid">
          <UserPanel
            icon={HiOutlineLink}
            tone="blue"
            title="Most active members"
            subtitle="Ranked by connections received on their profile"
          >
            {mostActiveMembers.length === 0 ? (
              <div className="users-empty">
                <p>No connection data yet.</p>
              </div>
            ) : (
              <ul className="users-rank-list">
                {mostActiveMembers.map((member, index) => {
                  const width = Math.round((member.count / maxConnections) * 100)
                  return (
                    <li key={member.memberId} className="users-rank-row">
                      <RankBadge rank={index + 1} top={index === 0} />
                      <span className="users-rank-row__avatar" aria-hidden>
                        {memberInitials(member.memberName)}
                      </span>
                      <div className="users-rank-row__main">
                        <strong className="users-rank-row__name">{member.memberName}</strong>
                        <div className="users-rank-row__track">
                          <div
                            className="users-rank-row__fill users-rank-row__fill--blue"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                      <span className="users-rank-row__value">
                        {member.count}
                        <small>conn.</small>
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </UserPanel>

          <UserPanel
            icon={HiOutlineUsers}
            tone="navy"
            title="Engagement ranking"
            subtitle="Profile scans plus known connections per member"
          >
            {memberRankings.length === 0 ? (
              <div className="users-empty">
                <p>No engagement data yet.</p>
              </div>
            ) : (
              <ul className="users-rank-list">
                {memberRankings.slice(0, 10).map((member, index) => {
                  const scanShare =
                    member.totalEngagement > 0
                      ? Math.round((member.profileScans / member.totalEngagement) * 100)
                      : 0
                  return (
                    <li key={member.memberId} className="users-engage-row">
                      <RankBadge rank={index + 1} top={index === 0} />
                      <span className="users-rank-row__avatar" aria-hidden>
                        {memberInitials(member.memberName)}
                      </span>
                      <div className="users-engage-row__main">
                        <strong className="users-rank-row__name">{member.memberName}</strong>
                        <div className="users-engage-row__meta">
                          <span>{member.profileScans} scans</span>
                          <span>{member.knownConnections} connections</span>
                        </div>
                        <div className="users-rank-row__track users-engage-row__track">
                          <div
                            className="users-engage-row__fill-scan"
                            style={{ width: `${scanShare}%` }}
                          />
                          <div
                            className="users-engage-row__fill-conn"
                            style={{ width: `${100 - scanShare}%` }}
                          />
                        </div>
                      </div>
                      <span className="users-engage-row__total">{member.totalEngagement}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </UserPanel>
        </MotionGrid>
      </MotionSection>

      <MotionSection className="users-section">
        <h3 className="users-section__label">
          <HiOutlineArrowPath aria-hidden />
          Visitor engagement
        </h3>
        <MotionGrid className="users-grid">
          <UserPanel
            icon={HiOutlineArrowPath}
            tone="sky"
            title="Repeat visitor emails"
            subtitle="Visitors who submitted more than one connection"
          >
            {repeatVisitors.length === 0 ? (
              <div className="users-empty">
                <p>No repeat connections detected.</p>
              </div>
            ) : (
              <ul className="users-repeat-list">
                {repeatVisitors.slice(0, 10).map((row, index) => (
                  <li key={row.email} className="users-repeat-row">
                    <RankBadge rank={index + 1} />
                    <span className="users-repeat-row__email">{row.email}</span>
                    <span className="users-repeat-row__pill">
                      {row.count} connection{row.count === 1 ? '' : 's'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </UserPanel>

          <UserPanel
            icon={HiOutlineClock}
            tone="blue"
            title="Recent activity"
            subtitle="Latest connections, registrations, and competition entries"
          >
            {timeline.length === 0 ? (
              <div className="users-empty">
                <p>No recent activity.</p>
              </div>
            ) : (
              <ul className="users-timeline">
                {timeline.slice(0, 14).map((item, index) => {
                  const config = TIMELINE_TYPES[item.type] || TIMELINE_TYPES.connection
                  const TypeIcon = config.icon
                  return (
                    <li key={`${item.type}-${index}`} className="users-timeline-item">
                      <div className="users-timeline-item__rail" aria-hidden>
                        <span
                          className={`users-timeline-item__dot users-timeline-item__dot--${config.tone}`}
                        >
                          <TypeIcon />
                        </span>
                        {index < Math.min(timeline.length, 14) - 1 ? (
                          <span className="users-timeline-item__line" />
                        ) : null}
                      </div>
                      <div className="users-timeline-item__body">
                        <div className="users-timeline-item__head">
                          <strong>{item.label}</strong>
                          <span
                            className={`users-timeline-item__type users-timeline-item__type--${config.tone}`}
                          >
                            {config.label}
                          </span>
                        </div>
                        <p className="users-timeline-item__meta">
                          {item.memberName ? `via ${item.memberName} · ` : ''}
                          {formatTimelineDate(item.at)}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </UserPanel>
        </MotionGrid>
      </MotionSection>
    </MotionPage>
  )
}
