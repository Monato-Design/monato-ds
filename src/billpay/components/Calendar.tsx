// src/billpay/components/Calendar.tsx
// Month calendar with two-tap range selection. Matches the Figma layout
// (2288-6749 → Created at section).

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from '@tailgrids/icons';

interface CalendarProps {
  start: string | null;   // ISO YYYY-MM-DD
  end:   string | null;
  onChange: (range: { start: string | null; end: string | null }) => void;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parse(iso: string | null): Date | null {
  return iso ? new Date(`${iso}T00:00:00`) : null;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Grid of 6 rows × 7 columns of Date objects for the given month view. */
function buildGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay(); // 0=Sun
  const gridStart = new Date(year, month, 1 - startWeekday);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

export function Calendar({ start, end, onChange }: CalendarProps) {
  // Default the view to Aug 2028 to match the Figma spec — a real product
  // would default to the current month, but this keeps the demo predictable.
  const [view, setView] = useState<{ y: number; m: number }>(() => {
    const s = parse(start);
    if (s) return { y: s.getFullYear(), m: s.getMonth() };
    return { y: 2028, m: 7 }; // August 2028
  });

  const startDate = parse(start);
  const endDate   = parse(end);

  const inRange = (d: Date) => {
    if (!startDate || !endDate) return false;
    return d >= startDate && d <= endDate;
  };

  const handleClick = (d: Date) => {
    // Two-tap range: no start OR both set → set as new start; only start set → set end.
    if (!startDate || (startDate && endDate)) {
      onChange({ start: toISO(d), end: null });
      return;
    }
    // Have start, no end
    if (d < startDate) {
      // clicked before start — swap
      onChange({ start: toISO(d), end: toISO(startDate) });
    } else if (sameDay(d, startDate)) {
      // clicking start again clears
      onChange({ start: null, end: null });
    } else {
      onChange({ start: toISO(startDate), end: toISO(d) });
    }
  };

  const prevMonth = () => setView(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }));
  const nextMonth = () => setView(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }));

  const grid = buildGrid(view.y, view.m);
  const monthLabel = `${MONTH_NAMES[view.m]} ${view.y}`;

  return (
    <div className="bp-cal">
      <div className="bp-cal__nav">
        <motion.button
          type="button" className="bp-cal__navbtn" onClick={prevMonth}
          whileTap={{ scale: 0.9 }} aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </motion.button>
        <AnimatePresence mode="wait">
          <motion.span
            key={monthLabel}
            className="bp-cal__month"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
          >
            {monthLabel}
          </motion.span>
        </AnimatePresence>
        <motion.button
          type="button" className="bp-cal__navbtn" onClick={nextMonth}
          whileTap={{ scale: 0.9 }} aria-label="Next month"
        >
          <ChevronRight size={20} />
        </motion.button>
      </div>

      <div className="bp-cal__grid">
        {WEEKDAYS.map((w) => (
          <div key={w} className="bp-cal__weekday">{w}</div>
        ))}
        {grid.map((d, i) => {
          const isCurrentMonth = d.getMonth() === view.m;
          const isStart = startDate && sameDay(d, startDate);
          const isEnd   = endDate   && sameDay(d, endDate);
          const middle  = inRange(d) && !isStart && !isEnd;
          const isEndpoint = isStart || isEnd;

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleClick(d)}
              className={[
                'bp-cal__day',
                !isCurrentMonth && 'bp-cal__day--muted',
                middle && 'bp-cal__day--middle',
              ].filter(Boolean).join(' ')}
            >
              {isEndpoint && (
                <motion.span
                  layoutId={isStart ? 'bp-cal-start' : 'bp-cal-end'}
                  className="bp-cal__pill"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="bp-cal__daynum">{d.getDate()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
