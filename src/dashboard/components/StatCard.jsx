export function StatCard({ label, value, hint }) {
  return (
    <article className="dashboard-stat-card">
      <p className="dashboard-stat-card__label">{label}</p>
      <p className="dashboard-stat-card__value">{value}</p>
      {hint ? <p className="dashboard-stat-card__hint">{hint}</p> : null}
    </article>
  )
}
