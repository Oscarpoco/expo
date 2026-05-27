/**
 * WWISE branding, SecureX context, and form defaults — members-only company profile directory.
 */

export const BRAND_PRIMARY_NAME = 'WWISE'
/** Visible under the expo chrome — reinforces what the acronym stands for. */
export const BRAND_ENGINEERING_LOCKUP =
  'World wide industrial systems and engineers'

/** Product positioning (short, member-facing). */
export const BRAND_CAPABILITY_LINE =
  'Cybersafety · HSE advisory · Incident readiness · Business continuity'

/** Mission line — member pass, sign-in, and public profile Contact card. */
export const BRAND_MISSION_TAGLINE = 'Working together for a safe world'

export const BRAND_SHELL_TAG_BADGE = 'Member directory'

/** Expo */
export const EXPO_SHORT_LABEL = 'SECUREX 2026'

export const EXPO_CONNECT_LINE = "Let's connect"

export const EXPO_WELCOME_TITLE = `Welcome to ${EXPO_SHORT_LABEL}`
export const EXPO_BRAND_INTRO =
  `${BRAND_PRIMARY_NAME} members carry a live company profile card for networking and follow-up`

export const EXPO_SCAN_PROMPT =
  `${BRAND_PRIMARY_NAME} teams use this code to pull up your registered organisation profile during ${EXPO_SHORT_LABEL} — keep it ready for check-ins and introductions.`

export const QR_PROFILE_EYEBROW = 'Company profile card'
export const MEMBER_ROLE_FALLBACK = 'WWISE member'
export const QR_PRESENT_LABEL =
  'Present this code to verify your registered company profile'

export const LANDING_BADGE = `${BRAND_PRIMARY_NAME} · ${EXPO_SHORT_LABEL}`
export const LANDING_TITLE = 'Member sign-in'
export const LANDING_LEAD =
  `Enter the member code on your credential. We match it to the ${BRAND_PRIMARY_NAME} member directory and open your organisation profile.`

export const LANDING_MEMBER_CODE_PLACEHOLDER = 'As printed on your member credential'

export const LANDING_CTA_VERIFY = 'Sign in'

/** Member lookup miss */
export const UNKNOWN_TITLE = `${BRAND_PRIMARY_NAME} couldn’t find this member code`
export const UNKNOWN_BODY =
  `This code is not in the member directory yet — register your details to create your company profile card, or go back and check the code.`
export const UNKNOWN_CTA_PRIMARY = `Register with ${BRAND_PRIMARY_NAME}`
export const UNKNOWN_CTA_SECONDARY = 'Try another code'

/** Member registration (organisation profile) */
export const FORM_BADGE = `${BRAND_PRIMARY_NAME} · member onboarding`
export const FORM_TITLE = 'Register your organisation profile'
export const FORM_NOTE = (facilityName) =>
  `${facilityName} defaults are prefilled from the host template — update any field to match your company before saving.`

export const FORM_PRIMARY_CTA_PENDING = 'Saving profile…'
export const FORM_PRIMARY_CTA_READY = 'Save company profile'

export const FORM_SITE_LEGEND_ORG = 'Company profile'
export const FORM_ID_LEGEND_MEMBER = 'Member details'

export const AUTO_CHIP_TEMPLATE_LABEL = `${BRAND_PRIMARY_NAME} preset`

export const TOAST_DUPLICATE_CONTACT =
  'This email or phone is already registered. Contact the administrator.'

export const TOAST_REGISTRATION_SUCCESS =
  'Profile saved — your member card is ready.'

/**
 * One toast after registration: success line + “Message from WWISE” + recipient + spam hint.
 *
 * @param {string} emailDisplay
 */
export function buildRegistrationWithEmailToastMessage(emailDisplay) {
  const to = typeof emailDisplay === 'string' ? emailDisplay.trim() : ''
  return (
    `${TOAST_REGISTRATION_SUCCESS}\n\n` +
    `Message from ${BRAND_PRIMARY_NAME}\n\n` +
    `Sent to ${to}. If you do not see it, check promotions or spam.`
  )
}

/** Placeholders for autofilled business fields — adjust URLs for production. */

export const PLACEHOLDER_COMPANY_NAME = BRAND_PRIMARY_NAME

export const PLACEHOLDER_COMPANY_WEBSITE = 'https://wwise.co.za'

export const PLACEHOLDER_COMPANY_ADDRESS =
  'Head office address — street, city, country (update for your organisation)'

/** ISO management systems — shown in public profile navigation. */
export const BRAND_ISO_STANDARDS_LINE =
  'ISO 45001 · ISO 14001 · ISO 9001 — occupational health, safety, environment & quality'
