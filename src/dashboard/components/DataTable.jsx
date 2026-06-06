import { useMemo, useState } from 'react'
import {
  HiArrowDownTray,
  HiChevronDown,
  HiChevronLeft,
  HiChevronRight,
  HiChevronUp,
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2'

import { downloadCsvFile } from '../../utils/exportAnalyticsCsv.js'

/**
 * @param {{
 *   columns: Array<{ key: string, label: string, render?: (row: object) => import('react').ReactNode }>,
 *   rows: object[],
 *   searchKeys?: string[],
 *   exportFilename?: string,
 *   emptyMessage?: string,
 *   searchPlaceholder?: string
 * }} props
 */
export function DataTable({
  columns,
  rows,
  searchKeys = [],
  exportFilename = 'export.csv',
  emptyMessage = 'No records found.',
  searchPlaceholder = 'Search records…',
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
        const av = a[`${sortKey}Sort`] ?? a[sortKey] ?? ''
        const bv = b[`${sortKey}Sort`] ?? b[sortKey] ?? ''
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
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
      columns.map((col) => {
        if (col.render) {
          const rendered = col.render(row)
          return typeof rendered === 'string' || typeof rendered === 'number'
            ? String(rendered)
            : String(row[col.key] ?? '')
        }
        return String(row[col.key] ?? '')
      }),
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

  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeEnd = Math.min(currentPage * pageSize, filtered.length)

  return (
    <div className="data-table">
      <div className="data-table__toolbar">
        <label className="data-table__search">
          <HiOutlineMagnifyingGlass aria-hidden />
          <input
            type="search"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
          />
        </label>
        <span className="data-table__count">
          {filtered.length.toLocaleString()} record{filtered.length === 1 ? '' : 's'}
        </span>
        <button type="button" className="data-table__export" onClick={exportCsv}>
          <HiArrowDownTray aria-hidden />
          Export CSV
        </button>
      </div>

      <div className="data-table__wrap">
        <table className="data-table__grid">
          <thead>
            <tr>
              {columns.map((col) => {
                const isSorted = sortKey === col.key
                return (
                  <th
                    key={col.key}
                    className={`${isSorted ? 'is-sorted' : ''} ${isSorted ? `is-sorted-${sortDir}` : ''}`}
                    onClick={() => toggleSort(col.key)}
                    aria-sort={
                      isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
                    }
                  >
                    <span className="data-table__th-label">{col.label}</span>
                    <span className="data-table__sort-icon" aria-hidden>
                      {isSorted ? (
                        sortDir === 'asc' ? (
                          <HiChevronUp />
                        ) : (
                          <HiChevronDown />
                        )
                      ) : (
                        <HiChevronDown className="is-idle" />
                      )}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="data-table__empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={row.id || JSON.stringify(row)}>
                  {columns.map((col) => (
                    <td key={col.key} data-label={col.label}>
                      {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="data-table__footer">
        <span className="data-table__range">
          Showing {rangeStart}–{rangeEnd} of {filtered.length.toLocaleString()}
        </span>
        <div className="data-table__pager">
          <button
            type="button"
            className="data-table__page-btn"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => p - 1)}
            aria-label="Previous page"
          >
            <HiChevronLeft aria-hidden />
            Previous
          </button>
          <span className="data-table__page-indicator">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="data-table__page-btn"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Next page"
          >
            Next
            <HiChevronRight aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}
