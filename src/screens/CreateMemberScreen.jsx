import { useEffect, useMemo, useRef, useState } from 'react'
import {
  MdArrowBackIosNew,
  MdAssignment,
  MdBusiness,
  MdLink,
  MdLocationOn,
  MdMailOutline,
  MdOutlineDescription,
  MdOutlinePhone,
  MdPersonOutline,
  MdPhotoCamera,
  MdSave,
  MdWorkOutline,
} from 'react-icons/md'

import {
  AUTO_CHIP_TEMPLATE_LABEL,
  FORM_BADGE,
  FORM_ID_LEGEND_MEMBER,
  FORM_NOTE,
  FORM_PRIMARY_CTA_PENDING,
  FORM_PRIMARY_CTA_READY,
  FORM_SITE_LEGEND_ORG,
  FORM_TITLE,
  PLACEHOLDER_COMPANY_ADDRESS,
  PLACEHOLDER_COMPANY_NAME,
  PLACEHOLDER_COMPANY_WEBSITE,
} from '../constants/companyDefaults.js'
import { CircuitFrame } from '../components/CircuitFrame.jsx'

import './CreateMemberScreen.css'

const BIO_MAX_CHARS = 720

/**
 * @param {{
 *   initialMemberCode?: string,
 *   onSubmitted: (data: MemberFormSubmit & { profilePhotoFile?: File | null }) => void | Promise<void>,
 *   onCancel: () => void,
 *   busy: boolean,
 *   submitError: string|null
 * }} props
 */

/**
 * @typedef {object} MemberFormSubmit
 * @property {string} memberCode
 * @property {string} fullName
 * @property {string} roleTitle
 * @property {string} companyName
 * @property {string} phoneNumber
 * @property {string} email
 * @property {string} website
 * @property {string} linkedInUrl
 * @property {string} whatsAppLink
 * @property {string} companyAddress
 * @property {string} bio
 */

function buildDraft(code) {
  return {
    memberCode: code?.trim?.() ?? '',
    fullName: '',
    roleTitle: '',
    bio: '',
    companyName: PLACEHOLDER_COMPANY_NAME,
    phoneNumber: '',
    email: '',
    website: PLACEHOLDER_COMPANY_WEBSITE,
    linkedInUrl: '',
    whatsAppLink: '',
    companyAddress: PLACEHOLDER_COMPANY_ADDRESS,
  }
}

export function CreateMemberScreen({
  initialMemberCode,
  onSubmitted,
  onCancel,
  busy,
  submitError,
}) {
  const [form, setForm] = useState(() =>
    buildDraft(initialMemberCode),
  )
  const [profilePhotoFile, setProfilePhotoFile] = useState(null)
  const fileInputRef = useRef(null)

  const photoPreviewUrl = useMemo(() => {
    if (!profilePhotoFile) return null
    return URL.createObjectURL(profilePhotoFile)
  }, [profilePhotoFile])

  useEffect(() => {
    return () => {
      if (photoPreviewUrl != null) {
        URL.revokeObjectURL(photoPreviewUrl)
      }
    }
  }, [photoPreviewUrl])

  function patchField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const bioTrimmed = typeof form.bio === 'string' ? form.bio.trim() : ''

    const payload = {
      memberCode: form.memberCode.trim(),
      fullName: form.fullName.trim(),
      roleTitle: form.roleTitle.trim(),
      companyName: form.companyName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      email: form.email.trim(),
      website: form.website.trim(),
      linkedInUrl: form.linkedInUrl.trim(),
      whatsAppLink: form.whatsAppLink.trim(),
      companyAddress: form.companyAddress.trim(),
      bio: bioTrimmed,
      profilePhotoFile,
    }

    if (
      !payload.memberCode ||
      !payload.fullName ||
      !payload.roleTitle ||
      !payload.phoneNumber ||
      !payload.email ||
      !payload.linkedInUrl ||
      !payload.whatsAppLink
    ) {
      return
    }

    await Promise.resolve(onSubmitted(payload))
  }

  const formValid =
    form.memberCode.trim() &&
    form.fullName.trim() &&
    form.roleTitle.trim() &&
    form.phoneNumber.trim() &&
    form.email.trim() &&
    form.linkedInUrl.trim() &&
    form.whatsAppLink.trim() &&
    (form.bio || '').trim().length <= BIO_MAX_CHARS

  return (
    <CircuitFrame>
      <div className="member-form-shell">
        <button type="button" className="ghost-btn member-form-shell__cancel" onClick={onCancel} disabled={busy}>
          <MdArrowBackIosNew aria-hidden />
          Return to member sign-in
        </button>

        <p className="member-form-shell__badge">{FORM_BADGE}</p>
        <h2 className="member-form-shell__title">{FORM_TITLE}</h2>
        <p className="member-form-shell__note">{FORM_NOTE(PLACEHOLDER_COMPANY_NAME)}</p>

        <form className="member-form-grid" onSubmit={handleSubmit} noValidate>
          <div className="member-form-grid__fieldset">
            <span className="member-form-grid__legend">{FORM_ID_LEGEND_MEMBER}</span>

            <div className="member-form-shell__photo-block">
              <div className="field-label member-form-shell__photo-label">
                <MdPhotoCamera aria-hidden className="field-label__icon" />
                Profile photo — optional · JPG · PNG · WebP · max 2 MB
              </div>
              <input
                id="fld-photo"
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                disabled={busy}
                className="sr-only"
                aria-label="Choose profile photo (optional)"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null
                  setProfilePhotoFile(f)
                  e.target.value = ''
                }}
              />
              <div className="member-form-shell__photo-actions">
                <button
                  type="button"
                  className="ghost-btn member-form-shell__photo-pick"
                  disabled={busy}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose image
                </button>
                {profilePhotoFile || photoPreviewUrl ? (
                  <button
                    type="button"
                    className="ghost-btn member-form-shell__photo-clear"
                    onClick={() => setProfilePhotoFile(null)}
                    disabled={busy}
                  >
                    Remove photo
                  </button>
                ) : null}
              </div>
              {photoPreviewUrl ? (
                <div className="member-form-shell__photo-preview-wrap">
                  <img
                    className="member-form-shell__photo-preview"
                    src={photoPreviewUrl}
                    alt=""
                  />
                </div>
              ) : null}
            </div>

            <label className="field-label" htmlFor="fld-code">
              <MdWorkOutline aria-hidden className="field-label__icon" />
              Member code
            </label>
            <input
              id="fld-code"
              className="text-input text-input--tall"
              value={form.memberCode}
              onChange={(e) => patchField('memberCode', e.target.value)}
              disabled={busy}
              spellCheck={false}
              placeholder="Printed or requested code"
              required
            />

            <label className="field-label" htmlFor="fld-name">
              <MdPersonOutline aria-hidden className="field-label__icon" />
              Full name
            </label>
            <input
              id="fld-name"
              className="text-input text-input--tall"
              value={form.fullName}
              onChange={(e) => patchField('fullName', e.target.value)}
              disabled={busy}
              placeholder="Ada Lovelace"
              autoComplete="name"
              required
            />

            <label className="field-label" htmlFor="fld-role">
              <MdAssignment aria-hidden className="field-label__icon" />
              Role / title
            </label>
            <input
              id="fld-role"
              className="text-input text-input--tall"
              value={form.roleTitle}
              onChange={(e) => patchField('roleTitle', e.target.value)}
              disabled={busy}
              placeholder="Exhibiting engineer"
              required
            />

            <label className="field-label" htmlFor="fld-phone">
              <MdOutlinePhone aria-hidden className="field-label__icon" />
              Phone number
            </label>
            <input
              id="fld-phone"
              type="tel"
              inputMode="tel"
              className="text-input text-input--tall"
              value={form.phoneNumber}
              onChange={(e) => patchField('phoneNumber', e.target.value)}
              disabled={busy}
              autoComplete="tel"
              placeholder="+44 7984 402110"
              required
            />

            <label className="field-label" htmlFor="fld-email">
              <MdMailOutline aria-hidden className="field-label__icon" />
              Email address
            </label>
            <input
              id="fld-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              className="text-input text-input--tall"
              value={form.email}
              onChange={(e) => patchField('email', e.target.value)}
              disabled={busy}
              placeholder="name@organisation.com"
              required
            />

            <label className="field-label" htmlFor="fld-bio">
              <MdOutlineDescription aria-hidden className="field-label__icon" />
              Brief bio ({BIO_MAX_CHARS} characters max)
            </label>
            <textarea
              id="fld-bio"
              className="text-input member-form-shell__bio"
              value={form.bio}
              onChange={(e) => patchField('bio', e.target.value)}
              disabled={busy}
              rows={5}
              maxLength={BIO_MAX_CHARS}
              placeholder="Short professional bio — your role, organisation focus, how colleagues should remember your company card."
            />
          </div>

          <div className="member-form-grid__fieldset">
            <span className="member-form-grid__legend">{FORM_SITE_LEGEND_ORG}</span>
            <AutoField
              id="fld-company"
              label="Company name"
              chip={AUTO_CHIP_TEMPLATE_LABEL}
              icon={<MdBusiness aria-hidden />}
              value={form.companyName}
            />
            <AutoField
              id="fld-website"
              label="Website"
              chip={AUTO_CHIP_TEMPLATE_LABEL}
              icon={<MdLink aria-hidden />}
              value={form.website}
              mono
            />
            <MultiLineAutoField
              id="fld-address"
              label="Company address"
              chip={AUTO_CHIP_TEMPLATE_LABEL}
              icon={<MdLocationOn aria-hidden />}
              value={form.companyAddress}
            />

            <label className="field-label" htmlFor="fld-linkedin">
              <MdLink aria-hidden className="field-label__icon" />
              LinkedIn URL
            </label>
            <input
              id="fld-linkedin"
              type="url"
              inputMode="url"
              autoComplete="url"
              className="text-input text-input--tall"
              value={form.linkedInUrl}
              onChange={(e) => patchField('linkedInUrl', e.target.value)}
              disabled={busy}
              placeholder="https://www.linkedin.com/in/profile"
              required
            />

            <label className="field-label" htmlFor="fld-whatsapp">
              <MdOutlinePhone aria-hidden className="field-label__icon" />
              WhatsApp link
            </label>
            <input
              id="fld-whatsapp"
              type="url"
              inputMode="url"
              autoComplete="url"
              className="text-input text-input--tall"
              value={form.whatsAppLink}
              onChange={(e) => patchField('whatsAppLink', e.target.value)}
              disabled={busy}
              placeholder="https://wa.me/14955550123"
              required
            />
          </div>

          {submitError ? <p className="form-error member-form-shell__submit-error">{submitError}</p> : null}

          <button type="submit" className="primary-btn member-form-shell__submit" disabled={busy || !formValid}>
            <MdSave aria-hidden />
            {busy ? FORM_PRIMARY_CTA_PENDING : FORM_PRIMARY_CTA_READY}
          </button>
        </form>
      </div>
    </CircuitFrame>
  )
}

function AutoField({ id, label, icon, value, mono, chip }) {
  return (
    <>
      <label className="field-label auto-field-label" htmlFor={id}>
        <span className="field-label__icon-slot">{icon}</span>
        <span>{label}</span>
        <span className="auto-chip">{chip}</span>
      </label>
      <output id={id} className={`readout-inline ${mono ? 'mono' : ''}`}>
        {value || '–'}
      </output>
    </>
  )
}

function MultiLineAutoField({ id, label, icon, value, chip }) {
  return (
    <>
      <label className="field-label auto-field-label" htmlFor={id}>
        <span className="field-label__icon-slot">{icon}</span>
        <span>{label}</span>
        <span className="auto-chip">{chip}</span>
      </label>
      <output id={id} className="readout-multiline mono">
        {value || '–'}
      </output>
    </>
  )
}
