// src/billpay/components/ClientSelect.tsx
// Client picker used inside the Filter drawer.

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from '@tailgrids/icons';
import { CLIENTS } from '../data';

interface ClientSelectProps {
  value: string | null;
  onChange: (v: string | null) => void;
}

export function ClientSelect({ value, onChange }: ClientSelectProps) {
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
    <div className="bp-select" ref={ref}>
      <motion.button
        type="button"
        className={`bp-select__trigger ${value ? 'bp-select__trigger--filled' : ''}`}
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.995 }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={value ? '' : 'bp-select__placeholder'}>
          {value ?? 'Select a client'}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown size={20} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            className="bp-select__menu"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
          >
            {value && (
              <li>
                <button
                  type="button"
                  className="bp-select__opt bp-select__opt--clear"
                  onClick={() => { onChange(null); setOpen(false); }}
                >
                  Clear selection
                </button>
              </li>
            )}
            {CLIENTS.map((c) => (
              <li key={c.name}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.name === value}
                  className={`bp-select__opt ${c.name === value ? 'bp-select__opt--on' : ''}`}
                  onClick={() => { onChange(c.name); setOpen(false); }}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
