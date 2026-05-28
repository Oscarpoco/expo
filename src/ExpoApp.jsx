import { useCallback, useEffect, useState } from 'react'

import { signOut } from 'firebase/auth'

import { auth } from './firebase.js'
import { Toast } from './components/Toast.jsx'
import {
  BRAND_ENGINEERING_LOCKUP,
  TOAST_DUPLICATE_CONTACT,
  buildRegistrationWithEmailToastMessage,
} from './constants/companyDefaults.js'
import {
  checkMemberContactAvailability,
  createMemberRecord,
  findMemberByCode,
  persistMemberProfileSlug,
} from './services/membersRepo.js'
import { validateProfilePhotoFile, uploadMemberProfilePhoto } from './services/memberPhotoUpload.js'
import { buildMemberQrPayload } from './services/memberQr.js'
import { saveQrCodeRecord } from './services/qrCodesRepo.js'
import { signInMemberSession } from './services/sessionAuth.js'
import { buildProfileSlug } from './utils/memberSlug.js'
import logo from './assets/logo.png'
import './styles/forms.css'
import './App.css'
import { CreateMemberScreen } from './screens/CreateMemberScreen.jsx'
import { LandingScreen } from './screens/LandingScreen.jsx'
import { MemberNotFoundPrompt } from './screens/MemberNotFoundPrompt.jsx'
import { MemberQrScreen } from './screens/MemberQrScreen.jsx'

const PHASE = Object.freeze({
  landing: 'landing',
  unknownMember: 'unknownMember',
  register: 'register',
  qr: 'qr',
})

function summarizeError(error, fallbackMessage) {
  const code =
    typeof error?.code === 'string' ? error.code : ''

  if (code === 'permission-denied') {
    return 'Firestore rejected access. Relax security rules temporarily or sign in anonymously with collection access.'
  }

  const message =
    typeof error?.message === 'string' ? error.message : fallbackMessage

  return message ?? fallbackMessage
}

export function ExpoApp() {
  const [phase, setPhase] = useState(PHASE.landing)
  const [busy, setBusy] = useState(false)
  const [pendingCode, setPendingCode] = useState('')
  const [member, setMember] = useState(null)
  const [qrPayload, setQrPayload] = useState('')
  const [lookupError, setLookupError] = useState(null)
  const [persistError, setPersistError] = useState(null)

  /** @type {[null | { message: string, variant?: 'success' | 'error' | 'info' }, function]} */
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!toast) return undefined
    const ms =
      toast.message && toast.message.length > 140 ? 10_500 : 5200
    const id = window.setTimeout(() => setToast(null), ms)
    return () => clearTimeout(id)
  }, [toast])

  const dismissToast = useCallback(() => setToast(null), [])

  const restartFlow = useCallback(async () => {
    await signOut(auth).catch(() => {})
    setPhase(PHASE.landing)
    setMember(null)
    setQrPayload('')
    setPendingCode('')
    setLookupError(null)
    setPersistError(null)
    setBusy(false)
  }, [])

  const verifyMemberCode = useCallback(async (code) => {
    setBusy(true)
    setLookupError(null)

    try {
      const trimmed = typeof code === 'string' ? code.trim() : ''
      if (!trimmed) return

      const record = await findMemberByCode(trimmed)
      if (!record) {
        setPendingCode(trimmed)
        setPhase(PHASE.unknownMember)
        return
      }

      await signInMemberSession()
      const slug = buildProfileSlug(
        record.email,
        record.fullName,
        record.memberCode,
      )

      await persistMemberProfileSlug(record.id, slug)
      record.profileSlug = slug

      const payload = buildMemberQrPayload(slug)
      setMember(record)
      setQrPayload(payload)
      setPhase(PHASE.qr)
    } catch (error) {
      setLookupError(
        summarizeError(error, 'Member lookup failed. Please try again.'),
      )
    } finally {
      setBusy(false)
    }
  }, [])

  const proposeRegistration = useCallback(() => {
    setPersistError(null)
    setPhase(PHASE.register)
  }, [])

  const registerMemberProfile = useCallback(
    async (submission) => {
      const { profilePhotoFile = null, ...rest } = submission

      if (profilePhotoFile) {
        const bad = validateProfilePhotoFile(profilePhotoFile)
        if (bad) {
          setPersistError(bad)
          return
        }
      }

      setBusy(true)
      setPersistError(null)

      try {
        const dup = await checkMemberContactAvailability({
          email: rest.email,
          phoneNumber: rest.phoneNumber,
        })

        if (dup.emailTaken || dup.phoneTaken) {
          setToast({ message: TOAST_DUPLICATE_CONTACT, variant: 'error' })
          return
        }

        await signInMemberSession()

        let profilePhotoUrl = ''
        if (profilePhotoFile) {
          profilePhotoUrl = await uploadMemberProfilePhoto(
            profilePhotoFile,
            String(rest.memberCode || ''),
          )
        }

        const memberId = await createMemberRecord({
          memberCode: String(rest.memberCode),
          fullName: String(rest.fullName),
          roleTitle: String(rest.roleTitle),
          companyName: String(rest.companyName),
          phoneNumber: String(rest.phoneNumber),
          email: String(rest.email),
          website: String(rest.website),
          linkedInUrl: String(rest.linkedInUrl),
          whatsAppLink: String(rest.whatsAppLink ?? ''),
          companyAddress: String(rest.companyAddress),
          bio: typeof rest.bio === 'string' ? rest.bio : '',
          profilePhotoUrl: profilePhotoUrl || undefined,
        })

        const profileSlug = buildProfileSlug(
          String(rest.email),
          String(rest.fullName),
          String(rest.memberCode),
        )
        const payload = buildMemberQrPayload(profileSlug)
        await saveQrCodeRecord({ memberId, qrValue: payload })

        const enrichedMember = {
          id: memberId,
          memberCode: String(rest.memberCode),
          profileSlug,
          fullName: String(rest.fullName),
          roleTitle: String(rest.roleTitle),
          companyName: String(rest.companyName),
          phoneNumber: String(rest.phoneNumber),
          email: String(rest.email),
          website: String(rest.website),
          linkedInUrl: String(rest.linkedInUrl),
          whatsAppLink: String(rest.whatsAppLink ?? ''),
          companyAddress: String(rest.companyAddress),
          profilePhotoUrl: profilePhotoUrl || undefined,
          bio: typeof rest.bio === 'string' ? rest.bio.trim() : '',
        }

        setMember(enrichedMember)
        setQrPayload(payload)
        setPhase(PHASE.qr)
        setToast({
          message: buildRegistrationWithEmailToastMessage(String(rest.email)),
          variant: 'success',
        })
      } catch (error) {
        setPersistError(
          summarizeError(
            error,
            'Publishing the profile failed before storing the QR link.',
          ),
        )
      } finally {
        setBusy(false)
      }
    },
    [],
  )

  let body = null
  if (phase === PHASE.landing) {
    body = (
      <LandingScreen
        onVerify={verifyMemberCode}
        onRegister={proposeRegistration}
        busy={busy}
        submitError={lookupError}
      />
    )
  } else if (phase === PHASE.unknownMember) {
    body = (
      <MemberNotFoundPrompt
        attemptedCode={pendingCode}
        busy={busy}
        onCreateMember={proposeRegistration}
        onTryAgain={restartFlow}
      />
    )
  } else if (phase === PHASE.register) {
    body = (
      <CreateMemberScreen
        key={pendingCode}
        initialMemberCode={pendingCode}
        onSubmitted={registerMemberProfile}
        onCancel={restartFlow}
        busy={busy}
        submitError={persistError}
      />
    )
  } else if (phase === PHASE.qr) {
    body = member ? (
      <MemberQrScreen
        member={member}
        qrValue={qrPayload}
        onSignOut={restartFlow}
      />
    ) : (
      <LandingScreen
        onVerify={verifyMemberCode}
        busy={false}
        submitError="Lost session snapshot. Submit your member code again."
      />
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__row">
          <div className="app-header__brand-stack">
            <img className="app-header__logo" src={logo} alt="WWISE" />
          </div>
        </div>
      </header>
      <main className="app-main">
        <div key={phase} className="morph-surface">
          {body}
        </div>
      </main>
      {toast ? (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={dismissToast}
        />
      ) : null}
    </div>
  )
}
