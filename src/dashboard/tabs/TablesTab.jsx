import { DataTable } from '../components/DataTable.jsx'

/**
 * @param {{
 *   connectionRows: object[],
 *   memberRows: object[]
 * }} props
 */
export function TablesTab({ connectionRows, memberRows }) {
  return (
    <>
      <header className="dashboard-section-head">
        <h2 className="dashboard-section-head__title">Data Tables</h2>
        <p className="dashboard-section-head__desc">
          Searchable, sortable records with CSV export.
        </p>
      </header>
      <div className="dashboard-panel dashboard-panel--wide">
        <h3 className="dashboard-panel__title">Connections</h3>
        <DataTable
          columns={[
            { key: 'fullName', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'companyName', label: 'Company' },
            { key: 'areaOfInterest', label: 'Interest' },
            { key: 'memberName', label: 'Member' },
            { key: 'date', label: 'Date' },
          ]}
          rows={connectionRows}
          searchKeys={['fullName', 'email', 'companyName', 'memberName', 'date']}
          exportFilename="wwise-connections.csv"
        />
      </div>
      <div className="dashboard-panel dashboard-panel--wide dashboard-panel--spaced">
        <h3 className="dashboard-panel__title">Registrations</h3>
        <DataTable
          columns={[
            { key: 'fullName', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'companyName', label: 'Company' },
            { key: 'memberCode', label: 'Code' },
            { key: 'date', label: 'Registered' },
          ]}
          rows={memberRows}
          searchKeys={['fullName', 'email', 'companyName', 'memberCode', 'date']}
          exportFilename="wwise-registrations.csv"
        />
      </div>
    </>
  )
}
