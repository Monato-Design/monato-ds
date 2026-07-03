// src/billpay/pages/CashPage.tsx
// Cash view. Two Figma nodes mapped into a single component:
//   · 2269-3329 — default state, all rows, pagination "1..10"
//   · 2276-1371 — focused search "10511...", 3 filtered rows, pagination "1"
// The user types to move between the two.

import { useState, useMemo } from 'react';
import {
  Search1, Filter, Upload1, Copy1, ArrowLeft, ArrowRight,
} from '@tailgrids/icons';
import type { Transaction } from '../types';
import { filterByReference, formatAmount } from '../data';

const ROWS_PER_PAGE = 9;

export function CashPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => filterByReference(query), [query]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  // Reset to page 1 whenever the filter changes (would leave user on a page
  // that no longer exists otherwise)
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * ROWS_PER_PAGE;
  const rows = filtered.slice(start, start + ROWS_PER_PAGE);

  return (
    <>
      <div className="bp-table-card">
        {/* Top bar: search + filter + export */}
        <div className="bp-table-topbar">
          <div className="bp-table-topbar__left">
            <label className="bp-search">
              <Search1 size={20} />
              <input
                type="text"
                placeholder="Serch by reference"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                aria-label="Search by reference"
              />
            </label>
            <button type="button" className="bp-btn-outline bp-btn-outline--soft">
              Filter
              <Filter size={20} />
            </button>
          </div>
          <button type="button" className="bp-btn-outline">
            Export csv
            <Upload1 size={20} />
          </button>
        </div>

        {/* Table */}
        <div className="bp-table" role="table" aria-label="Cash transactions">
          {/* Header */}
          <div className="bp-table__cell bp-table__cell--head">Client</div>
          <div className="bp-table__cell bp-table__cell--head">Operation type</div>
          <div className="bp-table__cell bp-table__cell--head">Reference</div>
          <div className="bp-table__cell bp-table__cell--head">Created</div>
          <div className="bp-table__cell bp-table__cell--head bp-table__cell--center">Tipo de ID</div>
          <div className="bp-table__cell bp-table__cell--head">Amount</div>

          {/* Body */}
          {rows.map((tx) => (
            <TxRow key={tx.id} tx={tx} />
          ))}
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onChange={setPage}
      />
    </>
  );
}

function TxRow({ tx }: { tx: Transaction }) {
  const c = tx.client;
  const badgeCls =
    tx.status === 'Paid'     ? 'bp-badge bp-badge--paid'
  : tx.status === 'Expired'  ? 'bp-badge bp-badge--expired'
  :                            'bp-badge bp-badge--reversed';

  return (
    <>
      <div className="bp-table__cell bp-table__cell--body">
        <div className="bp-client">
          <div className={`bp-fav bp-fav--${c.color}`}>{c.initials}</div>
          <span className="bp-client__name">{c.name}</span>
        </div>
      </div>
      <div className="bp-table__cell bp-table__cell--body">{tx.operationType}</div>
      <div className="bp-table__cell bp-table__cell--body">
        <div className="bp-ref">
          <span className="bp-ref__value">{tx.reference}</span>
          <button
            type="button"
            className="bp-ref__copy"
            onClick={() => {
              try { navigator.clipboard.writeText(tx.reference); } catch { /* noop */ }
            }}
            aria-label="Copy reference"
          >
            <Copy1 size={20} />
          </button>
        </div>
      </div>
      <div className="bp-table__cell bp-table__cell--body">{tx.createdAt}</div>
      <div className="bp-table__cell bp-table__cell--body bp-table__cell--center">
        <span className={badgeCls}>
          {tx.status === 'Reversed' && <span className="bp-badge__dot" aria-hidden />}
          {tx.status}
        </span>
      </div>
      <div className="bp-table__cell bp-table__cell--body">{formatAmount(tx.amount)}</div>
    </>
  );
}

/* ── Pagination ─────────────────────────────────────────────── */

interface PagerProps {
  currentPage: number;
  totalPages: number;
  onChange: (p: number) => void;
}
function Pagination({ currentPage, totalPages, onChange }: PagerProps) {
  return (
    <div className="bp-pager" style={{ width: totalPages > 5 ? '570px' : undefined }}>
      <button
        type="button"
        className="bp-btn-outline bp-btn-outline--soft bp-btn-outline--icon"
        onClick={() => onChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="bp-pager__numbers">
        {pageNumbers(currentPage, totalPages).map((n, i) =>
          n === '...' ? (
            <span key={`dots-${i}`} className="bp-pager__num bp-pager__num--dots" aria-hidden>…</span>
          ) : (
            <button
              key={n}
              type="button"
              className={`bp-pager__num ${n === currentPage ? 'bp-pager__num--active' : ''}`}
              onClick={() => onChange(n)}
              aria-current={n === currentPage ? 'page' : undefined}
            >
              {n}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        className="bp-btn-outline bp-btn-outline--soft bp-btn-outline--icon"
        onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ArrowRight size={20} />
      </button>
    </div>
  );
}

/** Compute displayed page numbers with an ellipsis when there are many pages.
 * Mirrors the Figma pattern: 1 2 3 … 8 9 10 */
function pageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const out: (number | '...')[] = [1, 2, 3, '...', total - 2, total - 1, total];
  // Ensure current page is included even if it falls outside the fixed pattern
  if (current > 3 && current < total - 2 && !out.includes(current)) {
    // Rebuild around the current page
    return [1, '...', current - 1, current, current + 1, '...', total];
  }
  return out;
}
