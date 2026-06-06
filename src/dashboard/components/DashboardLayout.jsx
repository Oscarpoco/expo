import blueLogo from '../../assets/blueLogo.png'

const NAV = [
  { to: '#overview', label: 'Overview' },
  { to: '#comparison', label: '3-Day Comparison' },
  { to: '#charts', label: 'Charts' },
  { to: '#users', label: 'User Analysis' },
  { to: '#tables', label: 'Data Tables' },
  { to: '#summary', label: 'Executive Summary' },
]

/**
 * @param {{
 *   session: { fullName?: string, email: string },
 *   onLogout: () => void,
 *   children: import('react').ReactNode
 * }} props
 */
export function DashboardLayout({ session, onLogout, children }) {
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <img src={blueLogo} alt="WWISE" className="dashboard-sidebar__logo" />
        <nav className="dashboard-sidebar__nav" aria-label="Dashboard sections">
          {NAV.map((item) => (
            <a key={item.to} href={item.to} className="dashboard-sidebar__link">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="dashboard-sidebar__footer">
          <p className="dashboard-sidebar__user">
            Signed in as
            <strong>{session.fullName || session.email}</strong>
            {session.fullName ? session.email : null}
          </p>
          <button type="button" className="dashboard-logout-btn" onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="dashboard-main">{children}</main>
    </div>
  )
}
