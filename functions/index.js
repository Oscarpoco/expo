const path = require('path')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
require('dotenv').config({ path: path.join(__dirname, '.env') })

const { getApps, initializeApp } = require('firebase-admin/app')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')

const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { logger } = require('firebase-functions')

function ensureAdmin() {
  if (!getApps().length) {
    initializeApp()
  }
}

const PROGRAM_DISPLAY_NAME = 'wwise-expo'

/**
 * Sends member code mail after Firestore creates a `members` document.
 *
 * Credentials: add `RESEND_API_KEY` and `TRANSACTION_MAIL_FROM` to the repo-root
 * `.env` (same file as Firebase web vars, but NEVER use `VITE_` for these —
 * deploy runs `functions/sync-env-from-root.js`, which bundles them only into Cloud Functions).
 */

exports.sendMemberWelcomeEmail = onDocumentCreated(
  {
    document: 'members/{memberId}',
    region: 'africa-south1',
  },
  async (event) => {
    ensureAdmin()

    const memberId = event.params.memberId
    const snapshot = event.data
    if (!snapshot) {
      logger.warn(`sendMemberWelcomeEmail: empty snapshot (${memberId})`)
      return
    }

    const row = snapshot.data()
    const toRaw = typeof row.email === 'string' ? row.email.trim() : ''
    const memberCode =
      typeof row.memberCode === 'string' ? row.memberCode.trim() : ''
    const fullNameRaw =
      typeof row.fullName === 'string' ? row.fullName.trim() : ''

    if (!toRaw || !memberCode) {
      logger.info(
        'sendMemberWelcomeEmail: skipping (missing recipient email or memberCode)',
      )
      return
    }

    const apiKey = process.env.RESEND_API_KEY
    const fromAddress = process.env.TRANSACTION_MAIL_FROM

    if (!apiKey || !fromAddress) {
      logger.error(
        'sendMemberWelcomeEmail: RESEND_API_KEY or TRANSACTION_MAIL_FROM missing at runtime.',
      )
      await markEmailFailure(memberId, 'Mail env not configured on function.')
      return
    }

    const fullNameEsc = escapeHtml(fullNameRaw || 'member')
    const memberCodeEsc = escapeHtml(memberCode)
    const programEsc = escapeHtml(PROGRAM_DISPLAY_NAME)

    const subject = `Your ${PROGRAM_DISPLAY_NAME} member code`
    const text = [
      `Hello ${fullNameRaw || 'member'},`,
      '',
      `Your organization profile under ${PROGRAM_DISPLAY_NAME} has been recorded.`,
      `Member code (use it in the pass app): ${memberCode}`,
      '',
      'If you did not request this registration, ignore this note.',
    ].join('\n')

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="font-family:Segoe UI,system-ui,sans-serif;line-height:1.5;color:#111">
  <p>Hello ${fullNameEsc},</p>
  <p>This message confirms registration for your organization booth contact under ${programEsc}.</p>
  <p><strong>Member code:</strong></p>
  <pre style="font-size:14px;background:#efefef;padding:12px 14px;display:inline-block;border-radius:10px">${memberCodeEsc}</pre>
  <p>Enter that code inside the attendee app to reopen your QR pass anytime.</p>
  <hr style="border:none;border-top:1px solid #ccc;margin:24px 0" />
  <p style="font-size:12px;color:#666">If this was not requested, disregard this mail.</p>
</body>
</html>`.trim()

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [toRaw],
          subject,
          html,
          text,
        }),
      })

      const bodyText = await response.text()
      /** @type {Record<string, unknown>} */
      let parsed = {}
      try {
        parsed = JSON.parse(bodyText)
      } catch {
        parsed = {}
      }

      if (!response.ok) {
        const hint =
          typeof parsed.message === 'string'
            ? parsed.message
            : bodyText.slice(0, 200)
        logger.error(`Resend error ${response.status}`, bodyText)
        await markEmailFailure(memberId, `Resend ${response.status}: ${hint}`)
        return
      }

      const resendId = typeof parsed.id === 'string' ? parsed.id : null
      logger.info(
        `Resend accepted memberId=${memberId} to=${toRaw} resendId=${resendId ?? 'none'}`,
      )

      await getFirestore()
        .collection('members')
        .doc(memberId)
        .set(
          {
            welcomeEmailSentAt: FieldValue.serverTimestamp(),
            welcomeEmailTo: toRaw.toLowerCase(),
            ...(resendId ? { welcomeEmailResendId: resendId } : {}),
          },
          { merge: true },
        )

      logger.info(
        `${memberId}: Resend queued (open resend.com → Emails; without a verified domain, only allowed test recipients receive mail).`,
      )
    } catch (error) {
      logger.error('sendMemberWelcomeEmail failed', error)
      await markEmailFailure(memberId, error.message || 'unknown error')
    }
  },
)

/**
 * Sends a confirmation email to a visitor after they submit the "Connect"
 * form on a member's public profile. Triggered when Firestore creates a
 * `connections` document. Uses the SAME Resend transport as the welcome
 * email, but with a different message tailored to the connection.
 */
exports.sendConnectionConfirmationEmail = onDocumentCreated(
  {
    document: 'connections/{connectionId}',
    region: 'africa-south1',
  },
  async (event) => {
    ensureAdmin()

    const connectionId = event.params.connectionId
    const snapshot = event.data
    if (!snapshot) {
      logger.warn(`sendConnectionConfirmationEmail: empty snapshot (${connectionId})`)
      return
    }

    const row = snapshot.data() || {}
    const toRaw = typeof row.email === 'string' ? row.email.trim() : ''
    const fullNameRaw = typeof row.fullName === 'string' ? row.fullName.trim() : ''
    const memberNameRaw =
      typeof row.memberName === 'string' ? row.memberName.trim() : ''
    const companyNameRaw =
      typeof row.companyName === 'string' ? row.companyName.trim() : ''

    if (!toRaw) {
      logger.info(
        'sendConnectionConfirmationEmail: skipping (missing recipient email)',
      )
      return
    }

    const apiKey = process.env.RESEND_API_KEY
    const fromAddress = process.env.TRANSACTION_MAIL_FROM
    if (!apiKey || !fromAddress) {
      logger.error(
        'sendConnectionConfirmationEmail: RESEND_API_KEY or TRANSACTION_MAIL_FROM missing at runtime.',
      )
      return
    }

    const connectedWith = memberNameRaw || 'a WWISE member'
    const greetingName = fullNameRaw || 'there'

    const greetingEsc = escapeHtml(greetingName)
    const connectedWithEsc = escapeHtml(connectedWith)
    const companyEsc = escapeHtml(companyNameRaw)

    const subject = `You're connected with ${connectedWith} — SECUREX 2026`
    const text = [
      `Hi ${greetingName},`,
      '',
      `Thanks for connecting at SECUREX 2026. Your contact details have been shared with ${connectedWith}, who may reach out to follow up with you.`,
      companyNameRaw ? `Company on file: ${companyNameRaw}` : '',
      '',
      'If you did not request this, you can safely ignore this message.',
      '',
      'WWISE — Working together for a safe world',
    ]
      .filter(Boolean)
      .join('\n')

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="font-family:Segoe UI,system-ui,sans-serif;line-height:1.5;color:#111">
  <p>Hi ${greetingEsc},</p>
  <p>Thanks for connecting at <strong>SECUREX 2026</strong>. Your contact details have been shared with <strong>${connectedWithEsc}</strong>, who may reach out to follow up with you.</p>
  ${companyNameRaw ? `<p><strong>Company on file:</strong> ${companyEsc}</p>` : ''}
  <hr style="border:none;border-top:1px solid #ccc;margin:24px 0" />
  <p style="font-size:12px;color:#666">If you did not request this, you can safely ignore this message.</p>
  <p style="font-size:12px;color:#666">WWISE — Working together for a safe world</p>
</body>
</html>`.trim()

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [toRaw],
          subject,
          html,
          text,
        }),
      })

      const bodyText = await response.text()
      if (!response.ok) {
        logger.error(`sendConnectionConfirmationEmail Resend error ${response.status}`, bodyText)
        return
      }

      logger.info(
        `sendConnectionConfirmationEmail: Resend accepted connectionId=${connectionId} to=${toRaw}`,
      )
    } catch (error) {
      logger.error('sendConnectionConfirmationEmail failed', error)
    }
  },
)

/**
 * Sends a confirmation email after a visitor submits a competition entry.
 * Triggered when Firestore creates a `winners` document. Uses the SAME Resend
 * transport, with a competition-specific message.
 */
exports.sendCompetitionEntryEmail = onDocumentCreated(
  {
    document: 'winners/{winnerId}',
    region: 'africa-south1',
  },
  async (event) => {
    ensureAdmin()

    const winnerId = event.params.winnerId
    const snapshot = event.data
    if (!snapshot) {
      logger.warn(`sendCompetitionEntryEmail: empty snapshot (${winnerId})`)
      return
    }

    const row = snapshot.data() || {}
    const toRaw = typeof row.email === 'string' ? row.email.trim() : ''

    if (!toRaw) {
      logger.info('sendCompetitionEntryEmail: skipping (missing recipient email)')
      return
    }

    const apiKey = process.env.RESEND_API_KEY
    const fromAddress = process.env.TRANSACTION_MAIL_FROM
    if (!apiKey || !fromAddress) {
      logger.error(
        'sendCompetitionEntryEmail: RESEND_API_KEY or TRANSACTION_MAIL_FROM missing at runtime.',
      )
      return
    }

    const subject = 'Your SECUREX 2026 competition entry is confirmed'
    const text = [
      'Hi there,',
      '',
      'Your competition entry for SECUREX 2026 has been received. You completed all the milestones and are now in the draw to win prizes.',
      '',
      "We'll be in touch if you're a winner. Good luck!",
      '',
      'WWISE — Working together for a safe world',
    ].join('\n')

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="font-family:Segoe UI,system-ui,sans-serif;line-height:1.5;color:#111">
  <p>Hi there,</p>
  <p>Your competition entry for <strong>SECUREX 2026</strong> has been received. You completed all the milestones and are now in the draw to win prizes.</p>
  <p>We'll be in touch if you're a winner. Good luck!</p>
  <hr style="border:none;border-top:1px solid #ccc;margin:24px 0" />
  <p style="font-size:12px;color:#666">If you did not enter this competition, you can safely ignore this message.</p>
  <p style="font-size:12px;color:#666">WWISE — Working together for a safe world</p>
</body>
</html>`.trim()

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [toRaw],
          subject,
          html,
          text,
        }),
      })

      const bodyText = await response.text()
      if (!response.ok) {
        logger.error(`sendCompetitionEntryEmail Resend error ${response.status}`, bodyText)
        return
      }

      logger.info(
        `sendCompetitionEntryEmail: Resend accepted winnerId=${winnerId} to=${toRaw}`,
      )
    } catch (error) {
      logger.error('sendCompetitionEntryEmail failed', error)
    }
  },
)

async function markEmailFailure(memberId, hint) {
  ensureAdmin()

  try {
    await getFirestore()
      .collection('members')
      .doc(memberId)
      .set(
        {
          welcomeEmailFailedAt: FieldValue.serverTimestamp(),
          welcomeEmailError: String(hint).slice(0, 500),
        },
        { merge: true },
      )
  } catch (error) {
    logger.error(`Unable to annotate member ${memberId}`, error)
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
