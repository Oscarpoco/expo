/** Event days — June 2–4, 2026 (local). */
export const EVENT_DAYS = [
  { day: 1, label: 'Day 1', date: new Date(2026, 5, 2) },
  { day: 2, label: 'Day 2', date: new Date(2026, 5, 3) },
  { day: 3, label: 'Day 3', date: new Date(2026, 5, 4) },
]

const EVENT_DAY_KEYS = EVENT_DAYS.map((d) => dateKey(d.date))

/**
 * @param {import('firebase/firestore').Timestamp | undefined} ts
 * @returns {Date | null}
 */
export function timestampToDate(ts) {
  if (!ts || typeof ts.toDate !== 'function') return null
  return ts.toDate()
}

/**
 * @param {Date} value
 * @returns {string}
 */
export function dateKey(value) {
  const d = new Date(value)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

/**
 * @param {Date | null} value
 * @returns {number | null}
 */
function eventDayIndex(value) {
  if (!value) return null
  const key = dateKey(value)
  const index = EVENT_DAY_KEYS.indexOf(key)
  return index >= 0 ? index + 1 : null
}

/**
 * @param {unknown} value
 * @returns {number}
 */
function asNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

/**
 * @param {{
 *   members: object[],
 *   connections: object[],
 *   stats: object[],
 *   winners: object[],
 * }} dataset
 */
export function computeDashboardMetrics(dataset) {
  const { members, connections, stats, winners } = dataset

  let totalProfileScans = 0
  let totalKnownFromStats = 0
  let activeMembers = 0

  for (const row of stats) {
    const anonymous = asNumber(row.anonymousCount)
    const known = asNumber(row.knownCount)
    const rowTotal = asNumber(row.totalCount) || anonymous + known
    totalProfileScans += rowTotal
    totalKnownFromStats += known
    if (rowTotal > 0) activeMembers += 1
  }

  const totalKnownConnections = connections.length
  const totalRegistrations = members.length
  const totalCompetitionEntries = winners.length
  const totalInteractions = totalProfileScans
  const totalAnonymousScans = Math.max(0, totalProfileScans - totalKnownConnections)
  const engagementRate =
    totalProfileScans > 0
      ? Math.round((totalKnownConnections / totalProfileScans) * 1000) / 10
      : 0

  const dailyMap = new Map()
  const hourCounts = Array.from({ length: 24 }, () => 0)
  const heatmap = EVENT_DAYS.map((day) => ({
    day: day.day,
    label: day.label,
    hours: Array.from({ length: 24 }, () => 0),
  }))

  const addDaily = (key, field) => {
    if (!key) return
    const entry = dailyMap.get(key) || {
      date: key,
      connections: 0,
      registrations: 0,
      competitionEntries: 0,
    }
    entry[field] += 1
    dailyMap.set(key, entry)
  }

  for (const connection of connections) {
    const created = timestampToDate(connection.createdAt)
    if (!created) continue
    addDaily(dateKey(created), 'connections')
    hourCounts[created.getHours()] += 1
    const dayIdx = eventDayIndex(created)
    if (dayIdx) {
      heatmap[dayIdx - 1].hours[created.getHours()] += 1
    }
  }

  for (const member of members) {
    const created = timestampToDate(member.createdAt)
    if (!created) continue
    addDaily(dateKey(created), 'registrations')
  }

  for (const winner of winners) {
    const created = timestampToDate(winner.createdAt)
    if (!created) continue
    addDaily(dateKey(created), 'competitionEntries')
  }

  const dailyTotals = [...dailyMap.values()].sort((a, b) =>
    a.date.localeCompare(b.date),
  )

  const peakHourIndex = hourCounts.indexOf(Math.max(...hourCounts))
  const peakHour =
    hourCounts[peakHourIndex] > 0
      ? `${String(peakHourIndex).padStart(2, '0')}:00`
      : '—'

  const eventDayComparison = EVENT_DAYS.map((eventDay) => {
    const key = dateKey(eventDay.date)
    const dayConnections = connections.filter((c) => {
      const d = timestampToDate(c.createdAt)
      return d && dateKey(d) === key
    }).length
    const dayRegistrations = members.filter((m) => {
      const d = timestampToDate(m.createdAt)
      return d && dateKey(d) === key
    }).length
    const dayWinners = winners.filter((w) => {
      const d = timestampToDate(w.createdAt)
      return d && dateKey(d) === key
    }).length
    const dayActivity = dayConnections + dayRegistrations + dayWinners

    return {
      day: eventDay.day,
      label: eventDay.label,
      dateLabel: eventDay.date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      connections: dayConnections,
      registrations: dayRegistrations,
      competitionEntries: dayWinners,
      totalActivity: dayActivity,
    }
  })

  const bestDay = [...eventDayComparison].sort(
    (a, b) => b.totalActivity - a.totalActivity,
  )[0]

  const growthRates = eventDayComparison.map((day, index) => {
    if (index === 0) return { ...day, activityChange: null }
    const prev = eventDayComparison[index - 1].totalActivity
    const change =
      prev > 0
        ? Math.round(((day.totalActivity - prev) / prev) * 1000) / 10
        : day.totalActivity > 0
          ? 100
          : 0
    return { ...day, activityChange: change }
  })

  const memberConnectionCounts = new Map()
  for (const connection of connections) {
    const id = connection.memberId || 'unknown'
    const current = memberConnectionCounts.get(id) || {
      memberId: id,
      memberName: connection.memberName || 'Unknown',
      memberSlug: connection.memberSlug || '',
      count: 0,
    }
    current.count += 1
    memberConnectionCounts.set(id, current)
  }

  const mostActiveMembers = [...memberConnectionCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const emailCounts = new Map()
  for (const connection of connections) {
    const email = (connection.email || '').trim().toLowerCase()
    if (!email) continue
    emailCounts.set(email, (emailCounts.get(email) || 0) + 1)
  }
  const repeatVisitors = [...emailCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([email, count]) => ({ email, count }))
    .sort((a, b) => b.count - a.count)

  const interestBreakdown = new Map()
  for (const connection of connections) {
    const interest = (connection.areaOfInterest || 'Unspecified').trim()
    interestBreakdown.set(interest, (interestBreakdown.get(interest) || 0) + 1)
  }

  const interestChart = [...interestBreakdown.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const interactionSplit = [
    { name: 'Anonymous scans', value: totalAnonymousScans },
    { name: 'Known connections', value: totalKnownConnections },
  ].filter((item) => item.value > 0)

  const memberRankings = stats
    .map((row) => {
      const anonymous = asNumber(row.anonymousCount)
      const known = asNumber(row.knownCount)
      const totalEngagement = asNumber(row.totalCount) || anonymous + known
      return {
        memberId: row.memberId || row.id,
        memberName: row.memberName || 'Unknown',
        memberSlug: row.memberSlug || '',
        profileScans: anonymous,
        knownConnections: known,
        totalEngagement,
      }
    })
    .filter((row) => row.totalEngagement > 0)
    .sort((a, b) => b.totalEngagement - a.totalEngagement)
    .slice(0, 15)

  const timeline = [
    ...connections.map((c) => ({
      type: 'connection',
      label: c.fullName || c.email || 'Connection',
      memberName: c.memberName || '',
      at: timestampToDate(c.createdAt),
    })),
    ...members.map((m) => ({
      type: 'registration',
      label: m.fullName || m.email || 'Registration',
      memberName: '',
      at: timestampToDate(m.createdAt),
    })),
    ...winners.map((w) => ({
      type: 'competition',
      label: w.email || 'Competition entry',
      memberName: w.memberSlug || '',
      at: timestampToDate(w.createdAt),
    })),
  ]
    .filter((item) => item.at)
    .sort((a, b) => b.at - a.at)
    .slice(0, 25)

  const insights = buildInsights({
    totalRegistrations,
    totalKnownConnections,
    totalAnonymousScans,
    totalProfileScans,
    totalCompetitionEntries,
    engagementRate,
    bestDay,
    eventDayComparison,
    interestChart,
    repeatVisitors,
    activeMembers,
  })

  return {
    overview: {
      totalRegistrations,
      totalKnownConnections,
      totalAnonymousScans,
      totalProfileScans,
      totalCompetitionEntries,
      totalInteractions,
      activeMembers,
      engagementRate,
      peakConnectionHour: peakHour,
      totalKnownFromStats,
    },
    dailyTotals,
    eventDayComparison: growthRates,
    bestPerformingDay: bestDay,
    charts: {
      dailyActivity: dailyTotals.map((row) => ({
        date: row.date,
        connections: row.connections,
        registrations: row.registrations,
        competitionEntries: row.competitionEntries,
      })),
      eventDayBar: eventDayComparison.map((row) => ({
        name: row.label,
        connections: row.connections,
        registrations: row.registrations,
        competition: row.competitionEntries,
      })),
      interestBreakdown: interestChart,
      interactionSplit,
      hourlyDistribution: hourCounts.map((count, hour) => ({
        hour: `${String(hour).padStart(2, '0')}:00`,
        count,
      })),
    },
    heatmap,
    userAnalysis: {
      mostActiveMembers,
      repeatVisitors,
      memberRankings,
      timeline,
    },
    insights,
  }
}

/**
 * @param {object} input
 */
function buildInsights(input) {
  const lines = []
  const {
    totalRegistrations,
    totalKnownConnections,
    totalAnonymousScans,
    totalProfileScans,
    totalCompetitionEntries,
    engagementRate,
    bestDay,
    eventDayComparison,
    interestChart,
    repeatVisitors,
    activeMembers,
  } = input

  lines.push(
    `${totalRegistrations} team members registered and ${totalKnownConnections} visitor connections were captured during the event.`,
  )

  if (totalProfileScans > 0) {
    lines.push(
      `${totalProfileScans.toLocaleString()} total profile scans (${totalAnonymousScans.toLocaleString()} anonymous, ${totalKnownConnections.toLocaleString()} known). Connect rate: ${engagementRate}%.`,
    )
  }

  if (bestDay?.totalActivity > 0) {
    lines.push(
      `${bestDay.label} (${bestDay.dateLabel}) was the highest-performing event day with ${bestDay.totalActivity} combined interactions.`,
    )
  }

  const lowestDay = [...eventDayComparison].sort(
    (a, b) => a.totalActivity - b.totalActivity,
  )[0]
  if (
    lowestDay &&
    bestDay &&
    lowestDay.day !== bestDay.day &&
    lowestDay.totalActivity < bestDay.totalActivity
  ) {
    lines.push(
      `${lowestDay.label} had the lowest activity (${lowestDay.totalActivity} interactions) — consider stronger booth engagement tactics on quieter days.`,
    )
  }

  if (interestChart[0]) {
    lines.push(
      `"${interestChart[0].name}" was the top area of interest with ${interestChart[0].value} connection${interestChart[0].value === 1 ? '' : 's'}.`,
    )
  }

  if (totalCompetitionEntries > 0) {
    lines.push(
      `${totalCompetitionEntries} competition entries were submitted across the event.`,
    )
  }

  if (repeatVisitors.length > 0) {
    lines.push(
      `${repeatVisitors.length} visitor email${repeatVisitors.length === 1 ? '' : 's'} appear in multiple connections, indicating repeat engagement.`,
    )
  }

  lines.push(
    `${activeMembers} of ${totalRegistrations || activeMembers} registered members received measurable profile activity.`,
  )

  const recommendations = []
  if (engagementRate < 25 && totalProfileScans > 0) {
    recommendations.push(
      'Connect conversion is below 25%. Review the connect form placement and call-to-action on public profiles.',
    )
  }
  if (interestChart.length > 0) {
    const topThreeShare =
      interestChart.slice(0, 3).reduce((sum, item) => sum + item.value, 0) /
      Math.max(
        interestChart.reduce((sum, item) => sum + item.value, 0),
        1,
      )
    if (topThreeShare > 0.7) {
      recommendations.push(
        'Interest is concentrated in a few categories. Ensure booth staff can speak to secondary service lines.',
      )
    }
  }
  if (eventDayComparison.some((d) => d.totalActivity === 0)) {
    recommendations.push(
      'One or more event days show zero recorded activity. Confirm data collection was active on all days.',
    )
  }
  if (recommendations.length === 0) {
    recommendations.push(
      'Engagement metrics look healthy. Continue monitoring connection quality and follow up on captured leads promptly.',
    )
  }

  return { summary: lines, recommendations }
}
