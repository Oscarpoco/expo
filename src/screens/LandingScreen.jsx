import { useState } from 'react'
import { MdArrowForwardIos, MdKeyboard } from 'react-icons/md'

import {
  BRAND_MISSION_TAGLINE,
  LANDING_BADGE,
  LANDING_CTA_VERIFY,
  LANDING_LEAD,
  LANDING_MEMBER_CODE_PLACEHOLDER,
  LANDING_TITLE,
} from '../constants/companyDefaults.js'
import { CircuitFrame } from '../components/CircuitFrame.jsx'

import './LandingScreen.css'

export function LandingScreen({ onVerify, busy, submitError }) {
  const [code, setCode] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    await onVerify(code.trim())
  }

  return (
    <CircuitFrame>
      <div className="landing">
        <p className="landing__badge">{LANDING_BADGE}</p>
        <h1 className="landing__title">{LANDING_TITLE}</h1>
        <div className="qr-screen__shine" aria-hidden />
        <p className="landing__lead">{LANDING_LEAD}</p>

        <form className="landing__form" onSubmit={handleSubmit} noValidate>
          <label className="field-label" htmlFor="member-code">
            <MdKeyboard className="field-label__icon" aria-hidden />
            Member code
          </label>
          <input
            id="member-code"
            type="text"
            name="memberCode"
            className="text-input text-input--tall"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={LANDING_MEMBER_CODE_PLACEHOLDER}
            autoComplete="username"
            inputMode="text"
            spellCheck={false}
            disabled={busy}
          />

          {submitError ? (
            <p className="form-error landing__submit-error">{submitError}</p>
          ) : null}

          <button type="submit" className="primary-btn landing__cta" disabled={busy || !code.trim()}>
            {busy ? 'Signing in…' : LANDING_CTA_VERIFY}
            {!busy ? <MdArrowForwardIos aria-hidden /> : null}
          </button>
        </form>
      </div>
    </CircuitFrame>
  )
}
