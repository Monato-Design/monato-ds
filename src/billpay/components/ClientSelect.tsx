// src/billpay/components/ClientSelect.tsx
// Client picker used inside the Filter drawer.
// The menu opens INLINE (in-flow, pushing content below) rather than as an
// absolutely-positioned floater — this is important because the drawer body
// has overflow-y:auto, which would otherwise clip an absolute menu.

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from '@tailgrids/icons';
import { CLIENTS } from '../data';

interface ClientSelectProps {
  value: string | null;
  onChange: (v: string | null) => void;
}

export function ClientSelect({ value, onChange }: ClientSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bp-select">
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
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          style={{ display: 'inline-grid', placeItems: 'center' }}
        >
          <ChevronDown size={20} />
        </motion.span>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            role="listbox"
            className="bp-select__menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="bp-select__menu-inner">
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
            </div>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
