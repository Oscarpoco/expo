const QR_SESSION_KEY = 'wwise.expo.qrSession'

/**
 * @param {{ member: object, qrPayload: string }} session
 */
export function saveQrSession(session) {
  if (!session?.member?.id || !session?.qrPayload) return
  window.localStorage.setItem(
    QR_SESSION_KEY,
    JSON.stringify({
      member: session.member,
      qrPayload: session.qrPayload,
    }),
  )
}

/**
 * @returns {{ member: object, qrPayload: string } | null}
 */
export function readQrSession() {
  try {
    const raw = window.localStorage.getItem(QR_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.member?.id || !parsed?.qrPayload) return null
    return parsed
  } catch {
    return null
  }
}

export function clearQrSession() {
  window.localStorage.removeItem(QR_SESSION_KEY)
}
