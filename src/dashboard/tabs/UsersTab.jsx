/** @param {{ userAnalysis: object }} props */
export function UsersTab({ userAnalysis }) {
  return (
    <>
      <header className="dashboard-section-head">
        <h2 className="dashboard-section-head__title">User Connection Analysis</h2>
        <p className="dashboard-section-head__desc">
          Member performance, repeat visitors, and recent activity timeline.
        </p>
      </header>
      <div className="dashboard-panel-grid">
        <div className="dashboard-panel">
          <h3 className="dashboard-panel__title">Most active members (by connections received)</h3>
          <ul className="dashboard-insight-list">
            {userAnalysis.mostActiveMembers.length === 0 ? (
              <li>No connection data yet.</li>
            ) : (
              userAnalysis.mostActiveMembers.map((member) => (
                <li key={member.memberId}>
                  <strong>{member.memberName}</strong> — {member.count} connection
                  {member.count === 1 ? '' : 's'}
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="dashboard-panel">
          <h3 className="dashboard-panel__title">Engagement ranking (scans + connections)</h3>
          <ul className="dashboard-insight-list">
            {userAnalysis.memberRankings.length === 0 ? (
              <li>No engagement data yet.</li>
            ) : (
              userAnalysis.memberRankings.slice(0, 8).map((member) => (
                <li key={member.memberId}>
                  <strong>{member.memberName}</strong> — {member.profileScans} scans,{' '}
                  {member.knownConnections} connections
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="dashboard-panel">
          <h3 className="dashboard-panel__title">Repeat visitor emails</h3>
          <ul className="dashboard-insight-list">
            {userAnalysis.repeatVisitors.length === 0 ? (
              <li>No repeat connections detected.</li>
            ) : (
              userAnalysis.repeatVisitors.slice(0, 8).map((row) => (
                <li key={row.email}>
                  {row.email} — {row.count} connections
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="dashboard-panel">
          <h3 className="dashboard-panel__title">Recent activity timeline</h3>
          <ul className="dashboard-timeline">
            {userAnalysis.timeline.length === 0 ? (
              <li>No recent activity.</li>
            ) : (
              userAnalysis.timeline.slice(0, 12).map((item, index) => (
                <li key={`${item.type}-${index}`}>
                  <strong>{item.label}</strong>
                  {item.memberName ? ` · via ${item.memberName}` : ''} —{' '}
                  {item.at?.toLocaleString?.() || '—'}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </>
  )
}
