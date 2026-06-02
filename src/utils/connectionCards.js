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
 *   createdAt?: import('firebase/firestore').Timestamp
 * }} connection
 * @returns {Array<Array<{ label: string, value: string }>>}
 */
export function buildConnectionCardGroups(connection) {
  const fields = [
    { label: 'NAME', value: (connection.fullName || '').trim() },
    { label: 'COMPANY', value: (connection.companyName || '').trim() },
    { label: 'PHONE NUMBER', value: (connection.contactNumber || '').trim() },
    {
      label: 'DATE',
      value: formatAnalyticsDate(connection.createdAt),
    },
    { label: 'EMAIL', value: (connection.email || '').trim() },
  ].filter((field) => field.value && field.value !== '—')

  const cards = []
  for (let index = 0; index < fields.length; index += 2) {
    cards.push(fields.slice(index, index + 2))
  }

  if (cards.length === 0) {
    return [[{ label: 'CONNECTION', value: 'No details recorded' }]]
  }

  return cards
}
