import './CircuitFrame.css'

/**
 * Expo industrial backdrop — blueprint grid, telemetry HUD, teal + amber signalling.
 */
export function CircuitFrame({
  variant = 'default',
  padded = true,
  children,
}) {
  return (
    <div className={`circuit-frame circuit-frame--${variant}`}>
      <div className="circuit-frame__backdrop" aria-hidden>
        <div className="circuit-frame__blueprint" />
        <div className="circuit-frame__grid" />
        <div className="circuit-frame__beam" aria-hidden />
        <svg
          className="circuit-frame__svg"
          viewBox="0 0 420 580"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <CyberHudOverlay variant={variant} />
        </svg>
      </div>
      <div className={`circuit-frame__slot ${padded ? 'circuit-frame__slot--padded' : ''}`}>
        {children}
      </div>
    </div>
  )
}

function CyberHudOverlay({ variant }) {
  const hud = variant === 'accent'
  const primary = hud ? '#00ffc8' : 'rgba(0,255,208,0.2)'
  const secondary = hud ? '#f5b82e' : 'rgba(245,184,46,0.16)'
  const faint = hud ? 'rgba(0,255,208,0.42)' : 'rgba(0,255,208,0.09)'

  return (
    <g strokeLinecap="square" strokeLinejoin="miter" fill="none">
      {/* Perimeter intrusion brackets */}
      <g stroke={primary} strokeWidth={hud ? 2.75 : 1.85}>
        <path d="M36 52 H112 M36 52 V136" />
        <path d="M384 52 H308 M384 52 V136" />
        <path d="M36 528 H112 M36 528 V444" />
        <path d="M384 528 H308 M384 528 V444" />
      </g>

      {/* Plant / PDU block silhouettes */}
      <g stroke={secondary} strokeWidth={1} opacity={hud ? 0.95 : 0.55}>
        <rect x="52" y="168" width="28" height="22" />
        <rect x="342" y="410" width="26" height="20" />
        <rect x="294" y="96" width="22" height="18" />
        <path d="M68 392 H96 V412 H84 V424 H76 V412 H68 Z" opacity="0.65" />
      </g>

      {/* Process dataplane */}
      <g stroke={faint} strokeWidth={1.25} strokeDasharray="10 14">
        <path d="M-20 560 L440 -40" opacity="0.5" stroke={secondary} />
        <path d="M-40 620 L460 120" opacity="0.35" stroke={primary} />
      </g>

      {/* Telemetry nodes */}
      <g fill={secondary} opacity={hud ? 0.4 : 0.15}>
        <rect x="124" y="252" width="4" height="4" />
        <rect x="288" y="312" width="4" height="4" />
        <rect x="196" y="488" width="4" height="4" />
        <rect x="356" y="220" width="4" height="4" />
      </g>

      {/* Telemetry ticks */}
      <g stroke={primary} strokeWidth={1} opacity={hud ? 0.92 : 0.35}>
        <path d="M48 300 H118 M46 274 H120 M46 326 H118" strokeDasharray="6 14" />
        <path d="M378 356 H294 M382 382 H294 M382 332 H294" strokeDasharray="8 18" />
      </g>

      {/* Status ring */}
      <circle
        cx="210"
        cy="522"
        r="44"
        stroke={secondary}
        strokeWidth={hud ? 2 : 1.25}
        opacity={hud ? 0.88 : 0.35}
        fill="none"
      />
    </g>
  )
}
