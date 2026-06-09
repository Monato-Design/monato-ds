import { motion } from 'framer-motion';
import monatoSymbol from '../../assets/Symbol.png';

export type MethodType = 'pay' | 'spei' | 'crypto';

const CONFIG: Record<MethodType, {
  title: string;
  subtitle: string;
  badge: string;
  badgeClass: string;
  accentBg: string;
  accent: string;
}> = {
  pay: {
    title: 'Monato Pay',
    subtitle: 'SPEI + Crypto',
    badge: '★ Tu mejor opción',
    badgeClass: 'monato-method__badge--green',
    accentBg: '#0894c8',
    accent: '∞',
  },
  spei: {
    title: 'Monato SPEI',
    subtitle: 'Vía banco',
    badge: '🏦 Transferencia',
    badgeClass: 'monato-method__badge--blue',
    accentBg: '#2c4d77',
    accent: '$',
  },
  crypto: {
    title: 'Monato Crypto',
    subtitle: 'USDC · USDT',
    badge: '◈ Stablecoins',
    badgeClass: 'monato-method__badge--purple',
    accentBg: '#6d28d9',
    accent: '◈',
  },
};

type Props = {
  type: MethodType;
  onClick: () => void;
  index?: number;
};

export default function MonatoMethodCard({ type, onClick, index = 0 }: Props) {
  const cfg = CONFIG[type];

  return (
    <motion.button
      className={`monato-method monato-method--${type}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 340, damping: 26 }}
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(8,148,200,0.22)' }}
      whileTap={{ scale: 0.97 }}
    >
      {/* badge */}
      <span className={`monato-method__badge ${cfg.badgeClass}`}>{cfg.badge}</span>

      {/* logo area */}
      <div className="monato-method__logo-wrap">
        <div className="monato-method__symbol-wrap">
          <img src={monatoSymbol} alt="Monato" className="monato-method__symbol" />
          {/* accent indicator */}
          <span
            className="monato-method__accent"
            style={{ background: cfg.accentBg }}
          >
            {cfg.accent}
          </span>
        </div>
      </div>

      {/* footer */}
      <div className="monato-method__footer" style={{ background: cfg.accentBg }}>
        <span className="monato-method__title">{cfg.title}</span>
        <span className="monato-method__subtitle">{cfg.subtitle}</span>
      </div>
    </motion.button>
  );
}
