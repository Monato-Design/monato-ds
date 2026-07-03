// src/billpay/components/CollapsibleSection.tsx
// A section header with a +/– toggle. Animated collapse.

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function CollapsibleSection({ title, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bp-collapsible">
      <button
        type="button"
        className="bp-collapsible__header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="bp-collapsible__title">{title}</span>
        <motion.span
          className="bp-collapsible__toggle"
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          aria-hidden
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M8 3v10M3 8h10" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="bp-collapsible__body-wrap"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="bp-collapsible__body">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
