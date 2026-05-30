import {
  MdCloudQueue,
  MdHealthAndSafety,
  MdVerifiedUser,
  MdSmartToy,
  MdLock,
  MdShield,
} from 'react-icons/md'
import './PlaceholderTab.css'

const SERVICES = [
  {
    id: 'overview',
    label: 'WWISE Company Overview and SaaS',
    Icon: MdCloudQueue,
  },
  {
    id: 'insurance',
    label: 'WWISE Cybersecurity Insurance Support',
    Icon: MdHealthAndSafety,
  },
  {
    id: 'grc',
    label: 'Integrated GRC, Cybersecurity and Assurance Solutions',
    Icon: MdVerifiedUser,
  },
  {
    id: 'iso42001',
    label: 'ISO/IEC 42001:2023 Services',
    Icon: MdSmartToy,
  },
  {
    id: 'iso27001',
    label: 'ISO/IEC 27001:2022 Services',
    Icon: MdLock,
  },
  {
    id: 'sheq',
    label: 'SHEQ',
    Icon: MdShield,
  },
]

// Path circumference for r=84 (2 * PI * 84). Long labels are stretched across
// (most of) this length so they spread around the whole ring at full font size.
const RING_CIRCUMFERENCE = 527

export function CategoriesTab() {
  return (
    <section className="catalogue-tab">
      <header className="catalogue-tab__head">
        <h2>Catalogues</h2>
        <p>Explore our solutions and service offerings.</p>
      </header>

      <ul className="competition-services" aria-label="WWISE solutions">
        {SERVICES.map(({ id, label, Icon }) => {
          const longLabel = label.length > 40
          return (
          <li key={id} className="service-badge">
            <svg className="service-badge__ring" viewBox="0 0 200 200" aria-hidden>
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
          </li>
          )
        })}
      </ul>
    </section>
  )
}
