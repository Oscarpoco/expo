import { motion } from 'framer-motion'
import {
  HiOutlineBolt,
  HiOutlineCalendarDays,
  HiOutlineChartBarSquare,
  HiOutlineCheckCircle,
  HiOutlineLightBulb,
  HiOutlineSparkles,
  HiOutlineTrophy,
} from 'react-icons/hi2'

const PANEL_MOTION = {
  hidden: { opacity: 0, y: 14 },
  show: (index) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
}

/**
 * @param {{
 *   icon: import('react').ComponentType,
 *   tone?: 'blue' | 'navy' | 'sky' | 'gold',
 *   title: string,
 *   subtitle?: string,
 *   children: import('react').ReactNode,
 *   wide?: boolean,
 *   index?: number,
 * }} props
 */
function SummaryPanel({
  icon: Icon,
  tone = 'blue',
  title,
  subtitle,
  children,
  wide = false,
  index = 0,
}) {
  return (
    <motion.article
      className={`summary-panel${wide ? ' summary-panel--wide' : ''}`}
      custom={index}
      variants={PANEL_MOTION}
      initial="hidden"
      animate="show"
    >
      <div className="summary-panel__head">
        <span className={`summary-panel__icon summary-panel__icon--${tone}`}>
          <Icon aria-hidden />
        </span>
        <div>
          <h3 className="summary-panel__title">{title}</h3>
          {subtitle ? <p className="summary-panel__subtitle">{subtitle}</p> : null}
        </div>
      </div>
      <div className="summary-panel__body">{children}</div>
    </motion.article>
  )
}

/**
 * @param {{
 *   insights: { summary: string[], recommendations: string[] },
 *   prizeWinners: object[],
 *   overview?: object,
 *   bestPerformingDay?: object
 * }} props
 */
export function SummaryTab({ insights, prizeWinners, overview, bestPerformingDay }) {
  const insightCount = insights.summary.length
  const recommendationCount = insights.recommendations.length
  const headlineInsight = insights.summary[0]

  return (
    <div className="summary">
      <motion.section
        className="summary-hero"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="summary-hero__main">
          <span className="summary-hero__eyebrow">Executive report · WWISE Expo</span>
          <h2 className="summary-hero__title">Event summary & insights</h2>
          <p className="summary-hero__desc">
            Auto-generated performance insights, actionable recommendations, and prize draw
            results from across the event.
          </p>
          <div className="summary-hero__chips">
            <span className="summary-chip">
              <HiOutlineChartBarSquare aria-hidden />
              {insightCount} key insight{insightCount === 1 ? '' : 's'}
            </span>
            <span className="summary-chip">
              <HiOutlineLightBulb aria-hidden />
              {recommendationCount} recommendation{recommendationCount === 1 ? '' : 's'}
            </span>
            {prizeWinners.length > 0 ? (
              <span className="summary-chip">
                <HiOutlineTrophy aria-hidden />
                {prizeWinners.length} prize winner{prizeWinners.length === 1 ? '' : 's'}
              </span>
            ) : null}
            {bestPerformingDay?.totalActivity > 0 ? (
              <span className="summary-chip">
                <HiOutlineCalendarDays aria-hidden />
                Top day: {bestPerformingDay.label}
              </span>
            ) : null}
            <span className="summary-chip summary-chip--live">
              <span className="summary-chip__dot" aria-hidden />
              Auto-generated
            </span>
          </div>
        </div>

        <div className="summary-hero__stats">
          {overview ? (
            <div className="summary-hero__stat summary-hero__stat--highlight">
              <strong>{overview.engagementRate}%</strong>
              <span>Connect rate</span>
            </div>
          ) : null}
          <div className="summary-hero__stat">
            <strong>{prizeWinners.length.toLocaleString()}</strong>
            <span>Prize winners drawn</span>
          </div>
        </div>
      </motion.section>

      {headlineInsight ? (
        <motion.div
          className="summary-highlight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <HiOutlineBolt aria-hidden />
          <p>{headlineInsight}</p>
        </motion.div>
      ) : null}

      <section className="summary-section">
        <h3 className="summary-section__label">
          <HiOutlineTrophy aria-hidden />
          Prize draw
        </h3>
        <SummaryPanel
          icon={HiOutlineTrophy}
          tone="gold"
          title="Prize winners"
          subtitle="Drawn winners from the prizeWinners collection"
          wide
          index={0}
        >
          {prizeWinners.length === 0 ? (
            <div className="summary-empty">
              <HiOutlineTrophy aria-hidden />
              <p>No prize winners have been drawn yet.</p>
            </div>
          ) : (
            <ul className="summary-winners">
              {prizeWinners.map((winner, index) => (
                <li
                  key={winner.id}
                  className={`summary-winner${index === 0 ? ' is-first' : ''}`}
                >
                  <span className="summary-winner__order">#{winner.drawOrder}</span>
                  <div className="summary-winner__body">
                    <strong>{winner.email || 'Unknown email'}</strong>
                    <div className="summary-winner__meta">
                      <span>Drawn {winner.drawnAtLabel}</span>
                      {winner.drawnByName ? (
                        <>
                          <span className="summary-winner__sep" aria-hidden>
                            ·
                          </span>
                          <span>by {winner.drawnByName}</span>
                        </>
                      ) : null}
                      {winner.referrerName || winner.referrerSlug ? (
                        <>
                          <span className="summary-winner__sep" aria-hidden>
                            ·
                          </span>
                          <span>
                            referred by{' '}
                            {winner.referrerName || winner.referrerSlug}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  {index === 0 ? (
                    <span className="summary-winner__badge">Latest draw</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </SummaryPanel>
      </section>

      <section className="summary-section">
        <h3 className="summary-section__label">
          <HiOutlineChartBarSquare aria-hidden />
          Analysis
        </h3>
        <div className="summary-grid">
          <SummaryPanel
            icon={HiOutlineCheckCircle}
            tone="blue"
            title="Key insights"
            subtitle="Data-driven observations from event activity"
            index={1}
          >
            <ul className="summary-insight-list">
              {insights.summary.map((line, index) => (
                <li key={index} className="summary-insight-item">
                  <span className="summary-insight-item__index">{index + 1}</span>
                  <p>{line}</p>
                </li>
              ))}
            </ul>
          </SummaryPanel>

          <SummaryPanel
            icon={HiOutlineSparkles}
            tone="navy"
            title="Recommendations"
            subtitle="Suggested next steps based on current metrics"
            index={2}
          >
            <ul className="summary-rec-list">
              {insights.recommendations.map((line, index) => (
                <li key={index} className="summary-rec-item">
                  <span className="summary-rec-item__icon" aria-hidden>
                    <HiOutlineLightBulb />
                  </span>
                  <p>{line}</p>
                </li>
              ))}
            </ul>
          </SummaryPanel>
        </div>
      </section>
    </div>
  )
}
