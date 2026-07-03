// src/billpay/components/FilterDrawer.tsx
// Slide-in filter panel. Full behaviour mirrors Figma nodes:
//   · 2281-2629 → empty drawer with sections collapsed
//   · 2288-6749 → all sections expanded (calendar, status, operation, client)
//   · 2288-7586 → filters selected chips + client dropdown open
//   · 2288-8535 → final selected state before Search
//
// The drawer keeps a *local* draft of the filter state. On "Search" the draft
// is committed to the parent; on "Cancelar" or backdrop-click it is discarded.

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  type FilterState, type StatusOption, type OperationType,
  emptyFilterState, hasActiveFilters,
} from '../types';
import { STATUS_COUNTS, OPERATION_COUNTS, formatShortDate } from '../data';
import { Checkbox } from './Checkbox';
import { Chip } from './Chip';
import { CollapsibleSection } from './CollapsibleSection';
import { Calendar } from './Calendar';
import { ClientSelect } from './ClientSelect';

interface FilterDrawerProps {
  open: boolean;
  value: FilterState;
  onClose: () => void;
  onApply: (v: FilterState) => void;
}

const STATUSES: StatusOption[] = ['Open', 'Closed', 'Expired', 'Unpaid', 'Paid', 'Reversed'];
const OPERATIONS: OperationType[] = ['Cash In', 'Cash Out'];

export function FilterDrawer({ open, value, onClose, onApply }: FilterDrawerProps) {
  // Local draft — resets whenever the drawer opens
  const [draft, setDraft] = useState<FilterState>(value);
  useEffect(() => { if (open) setDraft(value); }, [open, value]);

  const active = hasActiveFilters(draft);

  const toggleStatus = (s: StatusOption) => {
    setDraft((d) => ({
      ...d,
      statuses: d.statuses.includes(s) ? d.statuses.filter((x) => x !== s) : [...d.statuses, s],
    }));
  };
  const toggleOp = (o: OperationType) => {
    setDraft((d) => ({
      ...d,
      operations: d.operations.includes(o) ? d.operations.filter((x) => x !== o) : [...d.operations, o],
    }));
  };
  const clearAll = () => setDraft(emptyFilterState());
  const removeChip = {
    date:  ()             => setDraft((d) => ({ ...d, dateRange: { start: null, end: null } })),
    stat:  (s: StatusOption)  => setDraft((d) => ({ ...d, statuses: d.statuses.filter((x) => x !== s) })),
    op:    (o: OperationType) => setDraft((d) => ({ ...d, operations: d.operations.filter((x) => x !== o) })),
    client:()             => setDraft((d) => ({ ...d, client: null })),
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop dims the main content — sits within the .bp-page so
              sidebar remains visible. */}
          <motion.div
            className="bp-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          <motion.aside
            className="bp-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            role="dialog"
            aria-label="Filter transactions"
          >
            {/* Header */}
            <div className="bp-drawer__header">
              <h2 className="bp-drawer__title">Filter By</h2>
              <motion.button
                type="button"
                className="bp-drawer__close"
                onClick={onClose}
                whileTap={{ scale: 0.9 }}
                aria-label="Close filter panel"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M4 4l10 10M14 4L4 14" />
                </svg>
              </motion.button>
            </div>

            <div className="bp-drawer__body">
              {/* Filters selected chips */}
              <AnimatePresence>
                {active && (
                  <motion.div
                    className="bp-drawer__chips-section"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="bp-drawer__chips-header">
                      <p className="bp-drawer__section-title">Filters selected</p>
                      <motion.button
                        type="button"
                        className="bp-drawer__clear"
                        onClick={clearAll}
                        whileHover={{ x: 1 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Clear All
                      </motion.button>
                    </div>
                    <motion.div className="bp-drawer__chips" layout>
                      <AnimatePresence mode="popLayout">
                        {draft.dateRange.start && (
                          <Chip
                            key="date"
                            label={
                              draft.dateRange.end
                                ? `${formatShortDate(draft.dateRange.start)} – ${formatShortDate(draft.dateRange.end)}`
                                : formatShortDate(draft.dateRange.start)
                            }
                            onRemove={removeChip.date}
                          />
                        )}
                        {draft.statuses.map((s) => (
                          <Chip key={`s-${s}`} label={s} onRemove={() => removeChip.stat(s)} />
                        ))}
                        {draft.operations.map((o) => (
                          <Chip
                            key={`o-${o}`}
                            label={o.replace(' ', '-')}
                            onRemove={() => removeChip.op(o)}
                          />
                        ))}
                        {draft.client && (
                          <Chip key="c" label={draft.client} onRemove={removeChip.client} />
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sections */}
              <CollapsibleSection title="Created at">
                <Calendar
                  start={draft.dateRange.start}
                  end={draft.dateRange.end}
                  onChange={(r) => setDraft((d) => ({ ...d, dateRange: r }))}
                />
              </CollapsibleSection>

              <CollapsibleSection title="Status">
                <div className="bp-checkbox-list">
                  {STATUSES.map((s) => (
                    <Checkbox
                      key={s}
                      label={s}
                      count={STATUS_COUNTS[s]}
                      checked={draft.statuses.includes(s)}
                      onChange={() => toggleStatus(s)}
                    />
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Operation">
                <div className="bp-checkbox-list">
                  {OPERATIONS.map((o) => (
                    <Checkbox
                      key={o}
                      label={o}
                      count={OPERATION_COUNTS[o]}
                      checked={draft.operations.includes(o)}
                      onChange={() => toggleOp(o)}
                    />
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Client">
                <ClientSelect
                  value={draft.client}
                  onChange={(v) => setDraft((d) => ({ ...d, client: v }))}
                />
              </CollapsibleSection>
            </div>

            {/* Footer */}
            <div className="bp-drawer__footer">
              <button type="button" className="bp-btn-outline" onClick={onClose}>
                Cancelar
              </button>
              <motion.button
                type="button"
                className={`bp-btn-primary ${!active ? 'bp-btn-primary--disabled' : ''}`}
                onClick={() => { if (active) { onApply(draft); onClose(); } }}
                disabled={!active}
                whileHover={active ? { y: -1 } : undefined}
                whileTap={active ? { scale: 0.98 } : undefined}
              >
                Search
              </motion.button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
