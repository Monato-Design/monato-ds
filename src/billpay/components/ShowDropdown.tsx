// src/billpay/components/ShowDropdown.tsx
// The "Show 10 ▾" dropdown that sits next to Export csv.

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from '@tailgrids/icons';
import type { ShowOption } from '../types';

const OPTIONS: ShowOption[] = [10, 25, 50, 100];

interface ShowDropdownProps {
  value: ShowOption;
  onChange: (v: ShowOption) => void;
}

export function ShowDropdown({ value, onChange }: ShowDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="bp-show" ref={ref}>
      <span className="bp-show__label">Show</span>
      <motion.button
        type="button"
        className="bp-show__trigger"
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.97 }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{value}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown size={16} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            className="bp-show__menu"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
          >
            {OPTIONS.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  role="option"
                  aria-selected={opt === value}
                  className={`bp-show__opt ${opt === value ? 'bp-show__opt--on' : ''}`}
                  onClick={() => { onChange(opt); setOpen(false); }}
                >
                  {opt}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
