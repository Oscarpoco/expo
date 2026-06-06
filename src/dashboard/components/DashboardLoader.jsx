import { motion } from 'framer-motion'

import blueLogo from '../../assets/blueLogo.png'
import { DASH_EASE, useDashMotion } from '../motion/index.js'

/**
 * @param {{
 *   label?: string,
 *   hint?: string,
 *   variant?: 'page' | 'overlay' | 'inline',
 *   className?: string
 * }} props
 */
export function DashboardLoader({
  label = 'Loading analytics',
  hint = 'Fetching live event data…',
  variant = 'page',
  className = '',
}) {
  const { reduced, transition } = useDashMotion()

  return (
    <div
      className={`dashboard-loader dashboard-loader--${variant}${className ? ` ${className}` : ''}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <motion.div
        className="dashboard-loader__card"
        initial={reduced ? false : { opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={transition(0.26)}
      >
        <div className="dashboard-loader__visual" aria-hidden>
          <div className="dashboard-loader__ring" />
          <div className="dashboard-loader__mark">
            <img src={blueLogo} alt="" className="dashboard-loader__logo" />
          </div>
        </div>

        <div className="dashboard-loader__copy">
          <p className="dashboard-loader__label">{label}</p>
          {hint ? <p className="dashboard-loader__hint">{hint}</p> : null}
        </div>

        <div className="dashboard-loader__bars" aria-hidden>
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </motion.div>
    </div>
  )
}

/** Slim top progress strip shown while data is refreshing in the background. */
export function DashboardRefreshBar() {
  const { reduced, transition } = useDashMotion()

  if (reduced) {
    return (
      <div className="dashboard-refresh-bar dashboard-refresh-bar--static" role="status" aria-live="polite">
        Refreshing…
      </div>
    )
  }

  return (
    <motion.div
      className="dashboard-refresh-bar"
      role="status"
      aria-live="polite"
      aria-label="Refreshing data"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={transition(0.18)}
    >
      <div className="dashboard-refresh-bar__track">
        <motion.div
          className="dashboard-refresh-bar__fill"
          initial={{ x: '-120%' }}
          animate={{ x: '220%' }}
          transition={{
            duration: 1.1,
            ease: DASH_EASE,
            repeat: Infinity,
          }}
        />
      </div>
      <span className="dashboard-refresh-bar__label">Refreshing data</span>
    </motion.div>
  )
}
