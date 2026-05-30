import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  MdCloudQueue,
  MdHealthAndSafety,
  MdVerifiedUser,
  MdSmartToy,
  MdLock,
  MdShield,
  MdClose,
  MdDownload,
  MdVisibility,
  MdPictureAsPdf,
} from 'react-icons/md'
import './PlaceholderTab.css'

import overviewPdf from '../../assets/catalogues/WWISE Company Overview & SaaS.pdf'
import insurancePdf from '../../assets/catalogues/WWISE Cybersecurity Insurance Support.pdf'
import grcPdf from '../../assets/catalogues/Integrated GRC, Cybersecurity & Assurance Solutions.pdf'
import iso42001Pdf from '../../assets/catalogues/ISO IEC 42001_2023 Services.pdf'
import iso27001Pdf from '../../assets/catalogues/ISO IEC 27001_2022 Services.pdf'

// Path circumference for r=84 (2 * PI * 84). Long labels are stretched across
// (most of) this length so they spread around the whole ring at full font size.
const RING_CIRCUMFERENCE = 527

const SERVICES = [
  {
    id: 'overview',
    label: 'WWISE Company Overview and SaaS',
    Icon: MdCloudQueue,
    pdf: overviewPdf,
    downloadName: 'WWISE-Company-Overview-and-SaaS.pdf',
    overview:
      'A complete look at WWISE — who we are, our SaaS platform, and how we help organisations stay secure, compliant and audit-ready.',
  },
  {
    id: 'insurance',
    label: 'WWISE Cybersecurity Insurance Support',
    Icon: MdHealthAndSafety,
    pdf: insurancePdf,
    downloadName: 'WWISE-Cybersecurity-Insurance-Support.pdf',
    overview:
      'Guidance and support to strengthen your cyber posture and meet the requirements needed to qualify for cybersecurity insurance cover.',
  },
  {
    id: 'grc',
    label: 'Integrated GRC, Cybersecurity and Assurance Solutions',
    Icon: MdVerifiedUser,
    pdf: grcPdf,
    downloadName: 'Integrated-GRC-Cybersecurity-Assurance-Solutions.pdf',
    overview:
      'An integrated approach that brings governance, risk, compliance, cybersecurity and assurance together into one streamlined solution.',
  },
  {
    id: 'iso42001',
    label: 'ISO/IEC 42001:2023 Services',
    Icon: MdSmartToy,
    pdf: iso42001Pdf,
    downloadName: 'ISO-IEC-42001-2023-Services.pdf',
    overview:
      'Implementation and certification support for ISO/IEC 42001:2023 — the international standard for AI management systems.',
  },
  {
    id: 'iso27001',
    label: 'ISO/IEC 27001:2022 Services',
    Icon: MdLock,
    pdf: iso27001Pdf,
    downloadName: 'ISO-IEC-27001-2022-Services.pdf',
    overview:
      'Implementation and certification support for ISO/IEC 27001:2022 — the international standard for information security management.',
  },
  {
    id: 'sheq',
    label: 'SHEQ',
    Icon: MdShield,
    // Placeholder document until the SHEQ catalogue is provided.
    pdf: overviewPdf,
    downloadName: 'WWISE-SHEQ.pdf',
    overview:
      'Safety, Health, Environment and Quality management services that keep your operations compliant and your people protected.',
  },
]

export function CategoriesTab() {
  const [active, setActive] = useState(null)
  const [closing, setClosing] = useState(false)

  const openSheet = useCallback((service) => {
    setClosing(false)
    setActive(service)
  }, [])

  const closeSheet = useCallback(() => {
    setClosing(true)
    window.setTimeout(() => {
      setActive(null)
      setClosing(false)
    }, 240)
  }, [])

  useEffect(() => {
    if (!active) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeSheet()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [active, closeSheet])

  return (
    <section className="catalogue-tab">
      <header className="catalogue-tab__head">
        <h2>Catalogues</h2>
        <p>Tap a solution to view its overview and download the catalogue.</p>
      </header>

      <ul className="competition-services" aria-label="WWISE solutions">
        {SERVICES.map((service) => {
          const { id, label, Icon } = service
          const longLabel = label.length > 40
          return (
            <li key={id} className="service-badge">
              <button
                type="button"
                className="service-badge__btn"
                onClick={() => openSheet(service)}
                aria-label={`Open ${label}`}
              >
                <svg
                  className="service-badge__ring"
                  viewBox="0 0 200 200"
                  aria-hidden
                >
                  <defs>
                    <path
                      id={`ring-${id}`}
                      fill="none"
                      d="M 100,100 m -84,0 a 84,84 0 1,0 168,0 a 84,84 0 1,0 -168,0"
                    />
                  </defs>
                  <text textAnchor="middle">
                    <textPath
                      href={`#ring-${id}`}
                      startOffset="25%"
                      textLength={longLabel ? RING_CIRCUMFERENCE : undefined}
                      lengthAdjust={longLabel ? 'spacing' : undefined}
                    >
                      {label}
                    </textPath>
                  </text>
                </svg>
                <span className="service-badge__icon" aria-hidden>
                  <Icon />
                </span>
                <span className="sr-only">{label}</span>
              </button>
            </li>
          )
        })}
      </ul>

      {active
        ? createPortal(
        <div
          className={`catalogue-sheet${closing ? ' is-closing' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label={active.label}
        >
          <button
            type="button"
            className="catalogue-sheet__backdrop"
            onClick={closeSheet}
            aria-label="Close"
          />
          <div className="catalogue-sheet__panel">
            <div className="catalogue-sheet__grab" aria-hidden />
            <button
              type="button"
              className="catalogue-sheet__close"
              onClick={closeSheet}
              aria-label="Close"
            >
              <MdClose aria-hidden />
            </button>

            <div className="catalogue-sheet__header">
              <span className="catalogue-sheet__header-icon" aria-hidden>
                <active.Icon />
              </span>
              <div className="catalogue-sheet__header-text">
                <span className="catalogue-sheet__eyebrow">WWISE Catalogue</span>
                <h3 className="catalogue-sheet__title">{active.label}</h3>
              </div>
            </div>

            <div className="catalogue-sheet__body">
              <p className="catalogue-sheet__overview">{active.overview}</p>

              <div className="catalogue-sheet__doc">
                <span className="catalogue-sheet__doc-icon" aria-hidden>
                  <MdPictureAsPdf />
                </span>
                <span className="catalogue-sheet__doc-meta">
                  <span className="catalogue-sheet__doc-label">PDF document</span>
                  <span className="catalogue-sheet__doc-name">
                    {active.downloadName}
                  </span>
                </span>
              </div>

              <div className="catalogue-sheet__actions">
                <a
                  className="ghost-btn"
                  href={active.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MdVisibility aria-hidden />
                  View PDF
                </a>
                <a
                  className="primary-btn"
                  href={active.pdf}
                  download={active.downloadName}
                >
                  <MdDownload aria-hidden />
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>,
            document.body,
          )
        : null}
    </section>
  )
}
