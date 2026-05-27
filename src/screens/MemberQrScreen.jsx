import { QRCodeSVG } from 'qrcode.react'
import { MdRefresh } from 'react-icons/md'

import {
  EXPO_CONNECT_LINE,
  EXPO_SCAN_PROMPT,
  EXPO_WELCOME_TITLE,
  MEMBER_ROLE_FALLBACK,
  QR_PRESENT_LABEL,
  QR_PROFILE_EYEBROW,
} from '../constants/companyDefaults.js'
import { CircuitFrame } from '../components/CircuitFrame.jsx'

import './MemberQrScreen.css'

export function MemberQrScreen({
  member /* { id, memberCode?, fullName, roleTitle } */,
  qrValue,
  onSignOut,
}) {
  return (
    <CircuitFrame variant="accent">
      <div className="qr-screen">
        <header className="qr-screen__invite">
          <p className="qr-screen__welcome">{EXPO_WELCOME_TITLE}</p>
          <p className="qr-screen__connect">{EXPO_CONNECT_LINE}</p>
          <div className="qr-screen__shine" aria-hidden />
          <p className="qr-screen__invite-hint">{EXPO_SCAN_PROMPT}</p>
        </header>

        <section className="qr-screen__profile" aria-label="Your company profile card">
          <p className="qr-screen__eyebrow">{QR_PROFILE_EYEBROW}</p>
          <p className="qr-screen__name">{member.fullName ?? 'Member'}</p>
          <p className="qr-screen__role">{member.roleTitle ?? MEMBER_ROLE_FALLBACK}</p>
        </section>

        <div className="qr-card">
          <p className="qr-card__label">{QR_PRESENT_LABEL}</p>
          <div className="qr-card__canvas-wrap">
            <QRCodeSVG
              value={qrValue}
              size={200}
              level="Q"
              title="WWISE member profile QR"
              includeMargin={false}
              bgColor="#050913"
              fgColor="#5bbce4"
              className="qr-card__qr"
            />
          </div>
        </div>

        <button type="button" className="ghost-btn qr-screen__back" onClick={onSignOut}>
          <MdRefresh aria-hidden />
          Use a different credential
        </button>
      </div>
    </CircuitFrame>
  )
}
