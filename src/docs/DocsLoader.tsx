// src/docs/DocsLoader.tsx
// Redirect screen. Two variants:
//   - 'enter' (default): shown when going from DS → docs
//   - 'exit': shown when going from docs → DS
// Entry animation: fade + slide up. Logo pulses gently while loading.

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import LogoDefault from '../assets/logo-default.png';

interface DocsLoaderProps {
  onReady: () => void;
  delayMs?: number;
  variant?: 'enter' | 'exit';
}

const COPY = {
  enter: {
    title: 'Estás siendo redireccionado',
    sub: 'Cargando la documentación de Monato Fincore…',
  },
  exit: {
    title: 'Regresando al Design System',
    sub: 'Cerrando la documentación…',
  },
} as const;

export function DocsLoader({ onReady, delayMs = 2500, variant = 'enter' }: DocsLoaderProps) {
  useEffect(() => {
    const t = setTimeout(onReady, delayMs);
    return () => clearTimeout(t);
  }, [onReady, delayMs]);

  const copy = COPY[variant];

  return (
    <motion.div
      className="docs-loader"
      role="status"
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <motion.div
        className="docs-loader__inner"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img
          src={LogoDefault}
          alt="Monato"
          className="docs-loader__logo"
          animate={{ opacity: [1, 0.55, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="docs-loader__spinner" aria-hidden />
        <motion.p
          className="docs-loader__title"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.35 }}
        >
          {copy.title}
        </motion.p>
        <motion.p
          className="docs-loader__sub"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
        >
          {copy.sub}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
