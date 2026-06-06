/** @param {{ insights: { summary: string[], recommendations: string[] } }} props */
export function SummaryTab({ insights }) {
  return (
    <>
      <header className="dashboard-section-head">
        <h2 className="dashboard-section-head__title">Executive Summary</h2>
        <p className="dashboard-section-head__desc">
          Auto-generated insights from available event data.
        </p>
      </header>
      <div className="dashboard-panel-grid">
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
