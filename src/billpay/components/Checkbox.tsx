// src/billpay/components/Checkbox.tsx
// DS-styled checkbox with an animated check-in.

import { motion, AnimatePresence } from 'framer-motion';

interface CheckboxProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  count?: number;
}

export function Checkbox({ checked, onChange, label, count }: CheckboxProps) {
  return (
    <motion.label
      className="bp-checkbox"
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`bp-checkbox__box ${checked ? 'bp-checkbox__box--on' : ''}`}
      >
        <AnimatePresence initial={false}>
          {checked && (
            <motion.svg
              key="check"
              width="12" height="12" viewBox="0 0 12 12"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
            >
              <path d="M2.5 6.5L5 9l4.5-6" />
            </motion.svg>
          )}
        </AnimatePresence>
      </button>
      <span className="bp-checkbox__label">{label}</span>
      {count !== undefined && <span className="bp-checkbox__count">({count})</span>}
    </motion.label>
  );
}
