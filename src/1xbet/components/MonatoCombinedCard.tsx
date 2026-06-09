import { motion } from 'framer-motion';
import monatoSymbol from '../../assets/Symbol.png';
import speiLogo from '../assets/spei.png';
import usdcLogo from '../assets/usdc.png';

export type CombinedType = 'pay' | 'spei' | 'crypto';

const CONFIG: Record<CombinedType, {
  name: string;
  secondLogo?: string;
  accentBg: string;
}> = {
  pay: {
    name: 'Monato Pay',
    secondLogo: undefined,
    accentBg: '#0894c8',
  },
  spei: {
    name: 'Monato SPEI',
    secondLogo: speiLogo,
    accentBg: '#0894c8',
  },
  crypto: {
    name: 'Monato Crypto',
    secondLogo: usdcLogo,
    accentBg: '#6d28d9',
  },
};

type Props = {
  type: CombinedType;
  onClick: () => void;
};

export default function MonatoCombinedCard({ type, onClick }: Props) {
  const cfg = CONFIG[type];

  return (
    <motion.button
      className="monato-combined"
      onClick={onClick}
      whileHover={{ y: -1, boxShadow: '0 4px 14px rgba(8,148,200,0.2)' }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="monato-combined__logo-wrap">
        <img src={monatoSymbol} alt="Monato" className="monato-combined__logo" />
        {cfg.secondLogo && (
          <>
            <span className="monato-combined__plus">+</span>
            <img src={cfg.secondLogo} alt={cfg.name} className="monato-combined__logo monato-combined__logo--second" />
          </>
        )}
      </div>
      <div className="monato-combined__name" style={{ background: cfg.accentBg }}>
        {cfg.name}
      </div>
    </motion.button>
  );
}
