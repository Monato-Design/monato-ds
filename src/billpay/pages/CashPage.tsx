// src/billpay/pages/CashPage.tsx
// Cash view — table with search, filter drawer, show dropdown, and pagination.

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search1, Filter, Upload1, Copy1, ArrowLeft, ArrowRight,
  CheckCircle1,
} from '@tailgrids/icons';
import type { Transaction, FilterState, ShowOption } from '../types';
import { emptyFilterState, hasActiveFilters } from '../types';
import { applyFilters, formatAmount } from '../data';
import { ShowDropdown } from '../components/ShowDropdown';
import { FilterDrawer } from '../components/FilterDrawer';

export function CashPage() {
  const [query, setQuery]     = useState('');
  const [rowsPer, setRowsPer] = useState<ShowOption>(10);
  const [page, setPage]       = useState(1);
  const [filters, setFilters] = useState<FilterState>(emptyFilterState());
  const [drawer, setDrawer]   = useState(false);

  const active = hasActiveFilters(filters);

  const filtered   = useMemo(() => applyFilters(query, filters), [query, filters]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPer));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * rowsPer;
  const rows  = filtered.slice(start, start + rowsPer);

  const clearAllFilters = () => { setFilters(emptyFilterState()); setPage(1); };
  const applyDraft = (next: FilterState) => { setFilters(next); setPage(1); };

  return (
    <>
      <motion.div
        className="bp-table-card"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {/* Top bar */}
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

            <motion.button
              type="button"
              className={`bp-btn-outline bp-btn-outline--soft ${active ? 'bp-btn-outline--active' : ''}`}
              onClick={() => setDrawer(true)}
              whileTap={{ scale: 0.97 }}
              whileHover={{ y: -1 }}
            >
              Filter
              <Filter size={20} />
            </motion.button>

            <AnimatePresence>
              {active && (
                <motion.button
                  type="button"
                  className="bp-link"
                  onClick={clearAllFilters}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  whileHover={{ x: 1 }}
                >
                  Clear All
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="bp-table-topbar__right">
            <ShowDropdown value={rowsPer} onChange={(v) => { setRowsPer(v); setPage(1); }} />
            <motion.button
              type="button"
              className="bp-btn-outline"
              whileTap={{ scale: 0.97 }}
              whileHover={{ y: -1 }}
            >
              Export csv
              <Upload1 size={20} />
            </motion.button>
          </div>
        </div>

        {/* Table */}
        <div className="bp-table" role="table" aria-label="Cash transactions">
          <div className="bp-table__cell bp-table__cell--head">Client</div>
          <div className="bp-table__cell bp-table__cell--head">Operation type</div>
          <div className="bp-table__cell bp-table__cell--head">Reference</div>
          <div className="bp-table__cell bp-table__cell--head">Created</div>
          <div className="bp-table__cell bp-table__cell--head bp-table__cell--center">Tipo de ID</div>
          <div className="bp-table__cell bp-table__cell--head">Amount</div>

          <AnimatePresence mode="popLayout">
            {rows.length === 0 ? (
              <motion.div
                key="empty"
                className="bp-table__empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                No transactions match your filters.
              </motion.div>
            ) : (
              rows.map((tx, i) => (
                <TxRow key={tx.id} tx={tx} index={i} />
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Pagination (only when there is at least one page-worth of data) */}
      {rows.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onChange={setPage}
        />
      )}

      {/* Drawer lives in .bp-page → the sidebar remains visible */}
      <FilterDrawer
        open={drawer}
        value={filters}
        onClose={() => setDrawer(false)}
        onApply={applyDraft}
      />
    </>
  );
}

/* ── Row ────────────────────────────────────────────────────── */

function TxRow({ tx, index }: { tx: Transaction; index: number }) {
  const c = tx.client;
  const [copied, setCopied] = useState(false);
  const badgeCls =
    tx.status === 'Paid'    ? 'bp-badge bp-badge--paid'
  : tx.status === 'Expired' ? 'bp-badge bp-badge--expired'
  :                           'bp-badge bp-badge--reversed';

  // Reset the "copied" visual after 1.5s so the button reverts to Copy1
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = () => {
    // Fire-and-forget: we always show the check feedback, regardless of whether
    // clipboard write succeeds (some browsers block it in iframes / prototypes)
    try { void navigator.clipboard?.writeText(tx.reference); } catch { /* noop */ }
    setCopied(true);
  };

  const rowMotion = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0 },
    transition: { duration: 0.22, delay: Math.min(index * 0.02, 0.16), ease: 'easeOut' as const },
  };

  return (
    <>
      <motion.div className="bp-table__cell bp-table__cell--body" {...rowMotion}>
        <div className="bp-client">
          <div className={`bp-fav bp-fav--${c.color}`}>{c.initials}</div>
          <span className="bp-client__name">{c.name}</span>
        </div>
      </motion.div>
      <motion.div className="bp-table__cell bp-table__cell--body" {...rowMotion}>{tx.operationType}</motion.div>
      <motion.div className="bp-table__cell bp-table__cell--body" {...rowMotion}>
        <div className="bp-ref">
          <span className="bp-ref__value">{tx.reference}</span>
          <button
            type="button"
            className={`bp-ref__copy ${copied ? 'bp-ref__copy--done' : ''}`}
            onClick={handleCopy}
            aria-label={copied ? 'Reference copied' : 'Copy reference'}
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  style={{ display: 'inline-grid', placeItems: 'center' }}
                >
                  <CheckCircle1 size={20} />
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  style={{ display: 'inline-grid', placeItems: 'center' }}
                >
                  <Copy1 size={20} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.div>
      <motion.div className="bp-table__cell bp-table__cell--body" {...rowMotion}>{tx.createdAt}</motion.div>
      <motion.div className="bp-table__cell bp-table__cell--body bp-table__cell--center" {...rowMotion}>
        <span className={badgeCls}>
          {tx.status === 'Reversed' && <span className="bp-badge__dot" aria-hidden />}
          {tx.status}
        </span>
      </motion.div>
      <motion.div className="bp-table__cell bp-table__cell--body" {...rowMotion}>{formatAmount(tx.amount)}</motion.div>
    </>
  );
}

/* ── Pagination ─────────────────────────────────────────────── */

function Pagination({ currentPage, totalPages, onChange }:
  { currentPage: number; totalPages: number; onChange: (p: number) => void }
) {
  return (
    <motion.div
      className="bp-pager"
      style={{ width: totalPages > 5 ? 570 : undefined }}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.22 }}
    >
      <motion.button
        type="button"
        className="bp-btn-outline bp-btn-outline--soft bp-btn-outline--icon"
        onClick={() => onChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
        whileTap={{ scale: 0.9 }}
      >
        <ArrowLeft size={20} />
      </motion.button>

      <div className="bp-pager__numbers">
        {pageNumbers(currentPage, totalPages).map((n, i) =>
          n === '...' ? (
            <span key={`dots-${i}`} className="bp-pager__num bp-pager__num--dots" aria-hidden>…</span>
          ) : (
            <motion.button
              key={n}
              type="button"
              className={`bp-pager__num ${n === currentPage ? 'bp-pager__num--active' : ''}`}
              onClick={() => onChange(n)}
              aria-current={n === currentPage ? 'page' : undefined}
              whileTap={{ scale: 0.9 }}
            >
              {n}
            </motion.button>
          )
        )}
      </div>

      <motion.button
        type="button"
        className="bp-btn-outline bp-btn-outline--soft bp-btn-outline--icon"
        onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        whileTap={{ scale: 0.9 }}
      >
        <ArrowRight size={20} />
      </motion.button>
    </motion.div>
  );
}

function pageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, '...', total - 2, total - 1, total];
  if (current >= total - 2) return [1, 2, 3, '...', total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}
