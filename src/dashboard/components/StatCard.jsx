/** @param {{ label: string, value: string, hint?: string, icon?: import('react').ComponentType, accent?: string }} props */
export function StatCard({ label, value, hint, icon: Icon, accent = 'blue' }) {
  return (
    <article className={`dashboard-stat-card dashboard-stat-card--${accent}`}>
      <div className="dashboard-stat-card__head">
        {Icon ? (
          <span className="dashboard-stat-card__icon" aria-hidden>
            <Icon />
          </span>
        ) : null}
        <p className="dashboard-stat-card__label">{label}</p>
      </div>
      <p className="dashboard-stat-card__value">{value}</p>
      {hint ? <p className="dashboard-stat-card__hint">{hint}</p> : null}
    </article>
  )
}
