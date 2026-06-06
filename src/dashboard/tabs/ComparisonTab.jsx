/** @param {{ eventDayComparison: object[], bestPerformingDay: object | undefined }} props */
export function ComparisonTab({ eventDayComparison, bestPerformingDay }) {
  return (
    <>
      <header className="dashboard-section-head">
        <h2 className="dashboard-section-head__title">3-Day Event Comparison</h2>
        <p className="dashboard-section-head__desc">
          Side-by-side activity for Day 1–3 (2–4 June 2026). Profile scans are aggregate-only and not split by day.
        </p>
      </header>
      <div className="dashboard-comparison-grid">
        {eventDayComparison.map((day) => (
          <article
            key={day.day}
            className={`dashboard-day-card${bestPerformingDay?.day === day.day ? ' is-best' : ''}`}
          >
            <p className="dashboard-day-card__label">
              {day.label}
              {bestPerformingDay?.day === day.day ? ' · Top day' : ''}
            </p>
            <p className="dashboard-day-card__date">{day.dateLabel}</p>
            <div className="dashboard-day-card__metrics">
              <div className="dashboard-day-card__metric">
                <span>Connections</span>
                <strong>{day.connections}</strong>
              </div>
              <div className="dashboard-day-card__metric">
                <span>Registrations</span>
                <strong>{day.registrations}</strong>
              </div>
              <div className="dashboard-day-card__metric">
                <span>Competition</span>
                <strong>{day.competitionEntries}</strong>
              </div>
              <div className="dashboard-day-card__metric">
                <span>Total activity</span>
                <strong>{day.totalActivity}</strong>
              </div>
            </div>
            {day.activityChange != null ? (
              <p
                className={`dashboard-day-card__change ${day.activityChange >= 0 ? 'is-up' : 'is-down'}`}
              >
                {day.activityChange >= 0 ? '+' : ''}
                {day.activityChange}% vs previous day
              </p>
            ) : (
              <p className="dashboard-day-card__change">Baseline day</p>
            )}
          </article>
        ))}
      </div>
    </>
  )
}
