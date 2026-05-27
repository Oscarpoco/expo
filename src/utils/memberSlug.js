/**
 * URL-safe slug from a member display name (e.g. "Jane Doe" → "jane-doe").
 *
 * @param {string} fullName
 * @returns {string}
 */
export function slugifyMemberName(fullName) {
  return (fullName || '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

/**
 * URL slug from email (e.g. "oscar@gmail.com" → "oscar-at-gmail-com").
 *
 * @param {string} email
 * @returns {string}
 */
export function buildProfileSlugFromEmail(email) {
  const norm = (email || '').trim().toLowerCase()
  if (!norm || !norm.includes('@')) return ''

  const [local, domain] = norm.split('@')
  if (!local || !domain) return ''

  const localPart = local.replace(/\./g, '-').replace(/[^a-z0-9-]+/g, '-')
  const domainPart = domain.replace(/\./g, '-').replace(/[^a-z0-9-]+/g, '-')

  return `${localPart}-at-${domainPart}`
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

/**
 * Reverse an email slug back to an email address when possible.
 *
 * @param {string} slug
 * @returns {string}
 */
export function profileSlugToEmail(slug) {
  let value = (slug || '').trim().toLowerCase()
  if (!value) return ''

  try {
    value = decodeURIComponent(value)
  } catch {
    // keep raw
  }

  if (value.includes('@')) return value

  const marker = '-at-'
  const idx = value.indexOf(marker)
  if (idx === -1) return ''

  const local = value.slice(0, idx).replace(/-/g, '.')
  const domain = value.slice(idx + marker.length).replace(/-/g, '.')
  if (!local || !domain) return ''

  return `${local}@${domain}`
}

/**
 * Preferred public profile slug — email first, then name / member code.
 *
 * @param {string} email
 * @param {string} [fullName]
 * @param {string} [memberCode]
 * @returns {string}
 */
export function buildProfileSlug(email, fullName = '', memberCode = '') {
  const fromEmail = buildProfileSlugFromEmail(email)
  if (fromEmail) return fromEmail

  const fromName = slugifyMemberName(fullName)
  if (fromName) return fromName

  const fromCode = slugifyMemberName(memberCode)
  if (fromCode) return fromCode

  return 'member'
}

/**
 * Canonical slug for URLs and Firestore — handles spaces, hyphens, and encoding.
 *
 * @param {string} raw
 * @returns {string}
 */
export function normalizeProfileSlug(raw) {
  let value = (raw || '').trim()
  if (!value) return ''

  try {
    value = decodeURIComponent(value)
  } catch {
    // keep raw value when not URI-encoded
  }

  if (value.includes('@')) {
    return buildProfileSlugFromEmail(value)
  }

  return slugifyMemberName(value)
}

/**
 * Lookup variants for profile URLs (email slugs + legacy name slugs).
 *
 * @param {string} raw
 * @returns {string[]}
 */
export function profileSlugLookupVariants(raw) {
  let decoded = (raw || '').trim()
  try {
    decoded = decodeURIComponent(decoded)
  } catch {
    // keep raw
  }

  const lower = decoded.toLowerCase()
  const canonical = normalizeProfileSlug(decoded)
  const fromEmail = buildProfileSlugFromEmail(decoded)
  const spaced = lower.replace(/-/g, ' ').replace(/\s+/g, ' ').trim()
  const hyphenated = lower.replace(/\s+/g, '-')

  return [...new Set(
    [canonical, fromEmail, hyphenated, spaced, lower].filter(Boolean),
  )]
}

/**
 * @param {string} slug
 * @returns {string}
 */
export function buildMemberProfilePath(slug) {
  const clean =
    normalizeProfileSlug(slug) ||
    buildProfileSlugFromEmail(slug) ||
    (slug || '').trim().replace(/^\/+/, '')
  return clean ? `/${clean}` : '/'
}
