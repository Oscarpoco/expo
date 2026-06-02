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
 * @returns {Array<{ label: string, value: string }>}
 */
export function buildConnectionDisplayFields(connection) {
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

  if (fields.length === 0) {
    return [{ label: 'CONNECTION', value: 'No details recorded' }]
  }

  return fields
}
