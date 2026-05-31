import { formatAnalyticsDate } from './connectionCards.js'

/**
 * @param {unknown} value
 * @returns {string}
 */
function escapeCsvCell(value) {
  const text = String(value ?? '')
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

/**
 * @param {string[][]} rows
 * @returns {string}
 */
function rowsToCsv(rows) {
  return rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n')
}

/**
 * @param {string} csv
 * @param {string} filename
 */
export function downloadCsvFile(csv, filename) {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

const CONNECTION_HEADERS = [
  'Section',
  'Full Name',
  'Email',
  'Phone',
  'Company',
  'Interest',
  'Member ID',
  'Member Slug',
  'Member Name',
  'Date',
]

const WINNER_HEADERS = [
  'Section',
  'Email',
  'Member ID',
  'Member Slug',
  'Browser ID',
  'Date',
]

/**
 * @param {object} connection
 * @param {string} section
 * @returns {string[]}
 */
function connectionToRow(connection, section) {
  return [
    section,
    connection.fullName || '',
    connection.email || '',
    connection.contactNumber || '',
    connection.companyName || '',
    connection.areaOfInterest || '',
    connection.memberId || '',
    connection.memberSlug || '',
    connection.memberName || '',
    formatAnalyticsDate(connection.createdAt),
  ]
}

/**
 * @param {object} winner
 * @returns {string[]}
 */
function winnerToRow(winner) {
  return [
    'Winner',
    winner.email || '',
    winner.memberId || '',
    winner.memberSlug || '',
    winner.browserId || '',
    formatAnalyticsDate(winner.createdAt),
  ]
}

/**
 * @param {{
 *   myConnections: object[],
 *   allConnections: object[],
 *   winners: object[],
 *   memberName?: string
 * }} payload
 * @returns {string}
 */
export function buildAnalyticsExportCsv(payload) {
  const rows = []

  rows.push(CONNECTION_HEADERS)
  for (const connection of payload.myConnections) {
    rows.push(connectionToRow(connection, 'My Connection'))
  }

  rows.push([])
  rows.push(['--- All Connections ---'])
  rows.push(CONNECTION_HEADERS)
  for (const connection of payload.allConnections) {
    rows.push(connectionToRow(connection, 'All Connection'))
  }

  rows.push([])
  rows.push(['--- Winners ---'])
  rows.push(WINNER_HEADERS)
  for (const winner of payload.winners) {
    rows.push(winnerToRow(winner))
  }

  rows.push([])
  rows.push(['Exported for', payload.memberName || 'Member'])
  rows.push(['Exported at', new Date().toLocaleString()])

  return rowsToCsv(rows)
}

/**
 * @param {string} memberSlug
 * @returns {string}
 */
export function buildAnalyticsExportFilename(memberSlug) {
  const safeSlug = (memberSlug || 'member').replace(/[^\w-]+/g, '-')
  const stamp = new Date().toISOString().slice(0, 10)
  return `wwise-analytics-${safeSlug}-${stamp}.csv`
}
