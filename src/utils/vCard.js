/**
 * @param {string} value
 * @returns {string}
 */
function escapeVCard(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/**
 * Build a vCard 3.0 string from member profile fields.
 *
 * @param {{
 *   fullName: string,
 *   roleTitle?: string,
 *   companyName?: string,
 *   phoneNumber?: string,
 *   email?: string,
 *   website?: string,
 *   companyAddress?: string,
 *   bio?: string,
 *   profileUrl?: string,
 * }} member
 * @returns {string}
 */
export function buildMemberVCard(member) {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0']

  const fn = (member.fullName || '').trim()
  if (fn) lines.push(`FN:${escapeVCard(fn)}`)

  const org = (member.companyName || '').trim()
  if (org) lines.push(`ORG:${escapeVCard(org)}`)

  const title = (member.roleTitle || '').trim()
  if (title) lines.push(`TITLE:${escapeVCard(title)}`)

  const tel = (member.phoneNumber || '').trim()
  if (tel) lines.push(`TEL;TYPE=CELL,VOICE:${escapeVCard(tel)}`)

  const email = (member.email || '').trim()
  if (email) lines.push(`EMAIL;TYPE=INTERNET:${escapeVCard(email)}`)

  const website = (member.website || '').trim()
  if (website) lines.push(`URL:${escapeVCard(website)}`)

  const profileUrl = (member.profileUrl || '').trim()
  if (profileUrl && profileUrl !== website) {
    lines.push(`URL;TYPE=PROFILE:${escapeVCard(profileUrl)}`)
  }

  const address = (member.companyAddress || '').trim()
  if (address) {
    lines.push(`ADR;TYPE=WORK:;;${escapeVCard(address)};;;;`)
  }

  const note = (member.bio || '').trim()
  if (note) lines.push(`NOTE:${escapeVCard(note)}`)

  lines.push('END:VCARD')
  return lines.join('\r\n')
}

/**
 * Trigger a vCard download on the user's device.
 *
 * @param {string} vCardText
 * @param {string} fileBaseName
 */
export function downloadVCard(vCardText, fileBaseName = 'contact') {
  const safeName = fileBaseName.replace(/[^a-z0-9-_]+/gi, '-').slice(0, 48) || 'contact'
  const blob = new Blob([vCardText], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${safeName}.vcf`
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
