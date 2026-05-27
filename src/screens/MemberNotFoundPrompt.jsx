import { MdPersonSearch, MdTune } from 'react-icons/md'

import {
  UNKNOWN_BODY,
  UNKNOWN_CTA_PRIMARY,
  UNKNOWN_CTA_SECONDARY,
  UNKNOWN_TITLE,
} from '../constants/companyDefaults.js'
import { CircuitFrame } from '../components/CircuitFrame.jsx'

import './MemberNotFoundPrompt.css'

export function MemberNotFoundPrompt({
  attemptedCode,
  busy,
  onCreateMember,
  onTryAgain,
}) {
  return (
    <CircuitFrame>
      <div className="unknown">
        <div className="unknown__icon-slot">
          <MdPersonSearch aria-hidden />
        </div>
        <h2 className="unknown__title">{UNKNOWN_TITLE}</h2>
        <p className="unknown__code">
          Code entered:&nbsp;
          <span className="mono">{attemptedCode || '–'}</span>
        </p>
        <p className="unknown__body">{UNKNOWN_BODY}</p>

        <div className="unknown__actions">
          <button type="button" className="primary-btn" onClick={onCreateMember} disabled={busy}>
            <MdTune aria-hidden />
            {UNKNOWN_CTA_PRIMARY}
          </button>
          <button type="button" className="ghost-btn" onClick={onTryAgain} disabled={busy}>
            {UNKNOWN_CTA_SECONDARY}
          </button>
        </div>
      </div>
    </CircuitFrame>
  )
}
