import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState from './EmptyState';

/**
 * Generic table with sorting, pagination, responsive horizontal scroll and an empty state.
 * columns: [{ key, header, render?(row), sortable?, sortValue?(row), align? }]
 */
export default function DataTable({
  columns, rows, rowKey = 'id', pageSize = 8, caption,
  emptyTitle = 'No records found', emptyMessage, emptyIcon, rowClassName,
}) {
  const [sort, setSort] = useState({ key: null, dir: 'asc' });
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sort.key) return rows;
    const column = columns.find((c) => c.key === sort.key);
    const value = (row) => (column.sortValue ? column.sortValue(row) : row[column.key]);
    return [...rows].sort((a, b) => {
      const x = value(a);
      const y = value(b);
      const result = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
      return sort.dir === 'asc' ? result : -result;
    });
  }, [rows, columns, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount);
  const visible = sorted.slice((current - 1) * pageSize, current * pageSize);

  const toggleSort = (key) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));

  if (!rows.length) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        message={emptyMessage || 'There are currently no records matching your filters.'}
      />
    );
  }

  return (
    <div className="table-wrap">
      <div className="table-scroll">
        <table className="table">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr>
              {columns.map((c) => {
                const active = sort.key === c.key;
                const SortIcon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
                return (
                  <th
                    key={c.key}
                    className={c.align === 'right' ? 'text-right' : ''}
                    aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    {c.sortable ? (
                      <button type="button" className="sort-btn" onClick={() => toggleSort(c.key)}>
                        {c.header}<SortIcon size={14} aria-hidden="true" />
                      </button>
                    ) : c.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row[rowKey]} className={rowClassName?.(row) || ''}>
                {columns.map((c) => (
                  <td key={c.key} data-label={c.header} className={c.align === 'right' ? 'text-right' : ''}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>
          Showing {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, sorted.length)} of {sorted.length}
        </span>
        {pageCount > 1 && (
          <div className="pager">
            <button type="button" className="icon-btn" disabled={current === 1} onClick={() => setPage(current - 1)} aria-label="Previous page">
              <ChevronLeft size={16} />
            </button>
            <span>Page {current} of {pageCount}</span>
            <button type="button" className="icon-btn" disabled={current === pageCount} onClick={() => setPage(current + 1)} aria-label="Next page">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
