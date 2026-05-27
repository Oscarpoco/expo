import { useCallback, useMemo, useState } from 'react'
import {
  FaLinkedinIn,
} from 'react-icons/fa6'
import {
  MdBusiness,
  MdMailOutline,
  MdOutlineLanguage,
  MdOutlinePhone,
  MdOutlineShare,
  MdPersonAdd,
} from 'react-icons/md'

import { BRAND_PRIMARY_NAME } from '../../constants/companyDefaults.js'
import { MILESTONE_IDS, markCompetitionMilestone } from '../services/competitionProgress.js'
import { buildMemberProfilePath } from '../../utils/memberSlug.js'
import { getPublicAppOrigin } from '../../utils/publicAppUrl.js'
import { buildMemberVCard, downloadVCard } from '../../utils/vCard.js'

import './ContactTab.css'

/**
 * @param {string} [companyName]
 * @returns {string}
 */
function displayCompanyName(companyName) {
  const value = (companyName || '').trim()
  if (!value) return ''
  if (value.toLowerCase() === BRAND_PRIMARY_NAME.toLowerCase()) return ''
  return value
}

/**
 * @param {string} url
 * @returns {string}
 */
function normalizeExternalUrl(url) {
  const trimmed = (url || '').trim()
  if (!trimmed) return ''
  if (trimmed === '-' || /^n\/?a$/i.test(trimmed)) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

/**
 * @param {string} phone
 * @returns {string}
 */
function buildTelHref(phone) {
  const digits = (phone || '').replace(/[^\d+]/g, '')
  return digits ? `tel:${digits}` : ''
}

/**
 * @param {string} email
 * @returns {string}
 */
function buildMailHref(email) {
  const trimmed = (email || '').trim()
  return trimmed ? `mailto:${trimmed}` : ''
}

export function ContactTab({ member }) {
  const [saveHint, setSaveHint] = useState('')

  const profileUrl = useMemo(() => {
    const origin = getPublicAppOrigin()
    const path = buildMemberProfilePath(member.profileSlug || member.id)
    return origin ? `${origin}${path}` : path
  }, [member.id, member.profileSlug])

  const socialLinks = useMemo(() => {
    const items = []

    const phone = (member.phoneNumber || '').trim()
    if (phone) {
      items.push({
        id: 'phone',
        label: 'Call',
        href: buildTelHref(phone),
        shareText: phone,
        Icon: MdOutlinePhone,
      })
    }

    const email = (member.email || '').trim()
    if (email) {
      items.push({
        id: 'email',
        label: 'Email',
        href: buildMailHref(email),
        shareText: email,
        Icon: MdMailOutline,
      })
    }

    const website = normalizeExternalUrl(member.website)
    if (website) {
      items.push({
        id: 'website',
        label: 'Website',
        href: website,
        shareText: website,
        Icon: MdOutlineLanguage,
      })
    }

    const linkedIn = normalizeExternalUrl(member.linkedInUrl)
    if (linkedIn) {
      items.push({
        id: 'linkedin',
        label: 'LinkedIn',
        href: linkedIn,
        shareText: linkedIn,
        Icon: FaLinkedinIn,
      })
    }

    return items
  }, [member])

  const handleSaveContact = useCallback(() => {
    const vCard = buildMemberVCard({
      fullName: member.fullName,
      roleTitle: member.roleTitle,
      companyName: member.companyName,
      phoneNumber: member.phoneNumber,
      email: member.email,
      website: member.website,
      companyAddress: member.companyAddress,
      bio: member.bio,
      profileUrl,
    })

    downloadVCard(vCard, member.profileSlug || member.fullName || 'contact')
    markCompetitionMilestone(MILESTONE_IDS.saveContact)
    setSaveHint('Contact file ready — open the download to add to your phone.')
    window.setTimeout(() => setSaveHint(''), 4500)
  }, [member, profileUrl])

  const handleShareProfile = useCallback(async () => {
    const title = member.fullName || 'Member profile'
    const text = [member.roleTitle, displayCompanyName(member.companyName)]
      .filter(Boolean)
      .join(' · ')

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || undefined,
          url: profileUrl,
        })
        return
      } catch (shareError) {
        if (shareError?.name === 'AbortError') return
      }
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(profileUrl)
      setSaveHint('Profile link copied to clipboard.')
      window.setTimeout(() => setSaveHint(''), 3500)
    }
  }, [member.companyName, member.fullName, member.roleTitle, profileUrl])

  const bio = (member.bio || '').trim()
  const photoUrl = (member.profilePhotoUrl || '').trim()
  const roleTitle = (member.roleTitle || '').trim()
  const companyName = displayCompanyName(member.companyName)

  return (
    <div className="contact-tab">
      <article className="contact-card" aria-label="Member profile card">
        <div className="contact-card__plate">
          {photoUrl ? (
            <img
              className="contact-card__photo"
              src={photoUrl}
              alt=""
              loading="lazy"
            />
          ) : (
            <div className="contact-card__photo contact-card__photo--fallback" aria-hidden>
              <span>{(member.fullName || '?').charAt(0).toUpperCase()}</span>
            </div>
          )}

          <div className="contact-card__identity">
            <h2 className="contact-card__name">{member.fullName ?? 'Member'}</h2>
            {roleTitle ? <p className="contact-card__role">{roleTitle}</p> : null}
            {companyName ? (
              <p className="contact-card__company">
                <MdBusiness aria-hidden />
                {companyName}
              </p>
            ) : null}
          </div>

          {bio ? (
            <p className="contact-card__bio">{bio}</p>
          ) : null}

        </div>

        {socialLinks.length ? (
          <div className="contact-card__social-wrap">
            <p className="contact-card__social-label">Connect</p>
            <div className="contact-card__social" aria-label="Contact links">
              {socialLinks.map(({ id, label, href, Icon }) => (
                <a
                  key={id}
                  className="contact-social-btn"
                  href={href}
                  target={id === 'phone' || id === 'email' ? undefined : '_blank'}
                  rel={id === 'phone' || id === 'email' ? undefined : 'noopener noreferrer'}
                  aria-label={label}
                  title={label}
                >
                  <Icon aria-hidden />
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </article>

      <div className="contact-tab__actions">
        <button
          type="button"
          className="primary-btn contact-tab__save"
          onClick={handleSaveContact}
        >
          <MdPersonAdd aria-hidden />
          Save to phone
        </button>
        <button
          type="button"
          className="ghost-btn contact-tab__share"
          onClick={handleShareProfile}
        >
          <MdOutlineShare aria-hidden />
          Share profile
        </button>
      </div>

      {saveHint ? (
        <p className="contact-tab__hint" role="status">
          {saveHint}
        </p>
      ) : null}
    </div>
  )
}
