import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    title: 'EL BONO DEL PRIMER DEPÓSITO',
    sub: 'Regístrate y recibe un bono en tu 1er depósito',
    cta: 'DETALLES DE LA OFERTA',
    bg: 'linear-gradient(110deg, #0a1a2f 0%, #16365c 45%, #2a8fd6 100%)',
  },
  {
    title: 'HASTA $40,000 MXN',
    sub: '+ 150 giros gratis en Casino + 1xGames',
    cta: 'DEPOSITAR Y RECLAMAR',
    bg: 'linear-gradient(110deg, #0a1a2f 0%, #1e4a3a 45%, #34a853 100%)',
  },
  {
    title: 'CASHBACK SEMANAL',
    sub: 'Recupera hasta 10% cada lunes',
    cta: 'VER PROMOCIÓN',
    bg: 'linear-gradient(110deg, #0a1a2f 0%, #3a2a5c 45%, #8b5cf6 100%)',
  },
];

type Props = { onDeposit: () => void };

export default function HomeBanner({ onDeposit }: Props) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((v) => (v + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const s = slides[idx];

  return (
    <div className="xbet-banner" style={{ background: s.bg }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          className="xbet-banner__content"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <h1 className="xbet-banner__title">{s.title}</h1>
          <p className="xbet-banner__sub">{s.sub}</p>
          <motion.button
            className="xbet-banner__cta"
            onClick={onDeposit}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            {s.cta}
          </motion.button>
        </motion.div>
      </AnimatePresence>

      {/* esferas decorativas */}
      <div className="xbet-banner__balls">
        <motion.div className="xbet-banner__ball xbet-banner__ball--1" animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="xbet-banner__ball xbet-banner__ball--2" animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="xbet-banner__ball xbet-banner__ball--3" animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      <div className="xbet-banner__dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`xbet-banner__dot ${i === idx ? 'xbet-banner__dot--active' : ''}`}
            onClick={() => setIdx(i)}
          />
        ))}
      </div>
    </div>
  );
}
