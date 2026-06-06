import { HiOutlineTrophy } from 'react-icons/hi2'

/** @param {{ insights: { summary: string[], recommendations: string[] }, prizeWinners: object[] }} props */
export function SummaryTab({ insights, prizeWinners }) {
  return (
    <>
      <header className="dashboard-section-head">
        <h2 className="dashboard-section-head__title">Executive Summary</h2>
        <p className="dashboard-section-head__desc">
          Auto-generated insights and prize draw results from the event.
        </p>
      </header>

      <section className="dashboard-panel dashboard-panel--wide dashboard-prize-winners">
        <div className="dashboard-prize-winners__head">
          <HiOutlineTrophy className="dashboard-prize-winners__icon" aria-hidden />
          <div>
            <h3 className="dashboard-panel__title">Prize winners</h3>
            <p className="dashboard-panel__subtitle">
              Drawn winners from the prizeWinners collection
            </p>
          </div>
        </div>

        {prizeWinners.length === 0 ? (
          <p className="overview-empty">No prize winners have been drawn yet.</p>
        ) : (
          <ul className="dashboard-prize-winners__list">
            {prizeWinners.map((winner) => (
              <li key={winner.id} className="dashboard-prize-winners__item">
                <span className="dashboard-prize-winners__order">
                  #{winner.drawOrder}
                </span>
                <div className="dashboard-prize-winners__body">
                  <strong>{winner.email || 'Unknown email'}</strong>
                  <span>
                    Drawn {winner.drawnAtLabel}
                    {winner.drawnByName ? ` · by ${winner.drawnByName}` : ''}
                    {winner.referrerName
                      ? ` · referred by ${winner.referrerName}`
                      : winner.referrerSlug
                        ? ` · via ${winner.referrerSlug}`
                        : ''}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="dashboard-panel-grid dashboard-panel-grid--summary">
        <div className="dashboard-panel">
          <h3 className="dashboard-panel__title">Key insights</h3>
          <ul className="dashboard-insight-list">
            {insights.summary.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        </div>
        <div className="dashboard-panel">
          <h3 className="dashboard-panel__title">Recommendations</h3>
          <ul className="dashboard-insight-list">
            {insights.recommendations.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
