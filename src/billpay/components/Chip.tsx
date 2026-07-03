// src/billpay/components/Chip.tsx
// Removable chip used in the "Filters selected" section.

import { motion } from 'framer-motion';

interface ChipProps {
  label: string;
  onRemove: () => void;
}

export function Chip({ label, onRemove }: ChipProps) {
  return (
    <motion.button
      type="button"
      layout
      onClick={onRemove}
      className="bp-chip"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Remove filter ${label}`}
    >
      <span>{label}</span>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M2 2l6 6M8 2l-6 6" />
      </svg>
    </motion.button>
  );
}
