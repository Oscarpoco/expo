/**
 * @param {import('firebase/firestore').Timestamp | undefined} value
 * @returns {string}
 */
export function formatAnalyticsDate(value) {
  if (!value || typeof value.toDate !== 'function') return '—'
  return value.toDate().toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * @param {{
 *   fullName?: string,
 *   email?: string,
 *   contactNumber?: string,
 *   companyName?: string,
 *   areaOfInterest?: string,
 *   createdAt?: import('firebase/firestore').Timestamp
 * }} connection
 * @returns {Array<Array<{ label: string, value: string }>>}
 */
export function buildConnectionCardGroups(connection) {
  const fields = [
    { label: 'Name', value: (connection.fullName || '').trim() },
    { label: 'Email', value: (connection.email || '').trim() },
    { label: 'Phone', value: (connection.contactNumber || '').trim() },
    { label: 'Company', value: (connection.companyName || '').trim() },
    { label: 'Interest', value: (connection.areaOfInterest || '').trim() },
    {
      label: 'Date',
      value: formatAnalyticsDate(connection.createdAt),
    },
  ].filter((field) => field.value && field.value !== '—')

  const cards = []
  for (let index = 0; index < fields.length; index += 2) {
    cards.push(fields.slice(index, index + 2))
  }

  if (cards.length === 0) {
    return [[{ label: 'Connection', value: 'No details recorded' }]]
  }

  return cards
}
