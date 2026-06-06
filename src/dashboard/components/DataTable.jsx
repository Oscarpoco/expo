import { useMemo, useState } from 'react'

import { downloadCsvFile } from '../../utils/exportAnalyticsCsv.js'

/**
 * @param {{
 *   columns: Array<{ key: string, label: string, render?: (row: object) => string }>,
 *   rows: object[],
 *   searchKeys?: string[],
 *   exportFilename?: string,
 *   emptyMessage?: string
 * }} props
 */
export function DataTable({
  columns,
  rows,
  searchKeys = [],
  exportFilename = 'export.csv',
  emptyMessage = 'No records found.',
}) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState(columns[0]?.key || '')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let next = rows
    if (q) {
      next = rows.filter((row) =>
        searchKeys.some((key) =>
          String(row[key] ?? '')
            .toLowerCase()
            .includes(q),
        ),
      )
    }
    if (sortKey) {
      next = [...next].sort((a, b) => {
        const av = String(a[sortKey] ?? '')
        const bv = String(b[sortKey] ?? '')
        const cmp = av.localeCompare(bv, undefined, { numeric: true })
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return next
  }, [rows, query, searchKeys, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageRows = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const exportCsv = () => {
    const header = columns.map((col) => col.label)
    const body = filtered.map((row) =>
      columns.map((col) =>
        col.render ? col.render(row) : String(row[col.key] ?? ''),
      ),
    )
    const csv = [header, ...body]
      .map((line) =>
        line
          .map((cell) => {
            const text = String(cell ?? '')
            return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
          })
          .join(','),
      )
      .join('\r\n')
    downloadCsvFile(csv, exportFilename)
  }

  return (
    <div>
      <div className="dashboard-table-toolbar">
        <input
          type="search"
          className="dashboard-table-toolbar__search"
          placeholder="Search…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setPage(1)
          }}
        />
        <button type="button" className="dashboard-btn" onClick={exportCsv}>
          Export CSV
        </button>
      </div>

      <div className="dashboard-table-wrap">
        <table className="dashboard-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} onClick={() => toggleSort(col.key)}>
                  {col.label}
                  {sortKey === col.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="dashboard-table__empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={row.id || JSON.stringify(row)}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="dashboard-pagination">
        <span>
          Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
          {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
        </span>
        <div className="dashboard-pagination__controls">
          <button
            type="button"
            className="dashboard-btn"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            className="dashboard-btn"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
