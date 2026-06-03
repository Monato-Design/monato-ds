import { motion } from 'framer-motion';
import monatoSymbol from '../assets/monato-symbol.svg';

type Props = {
  onClick: () => void;
};

export default function MonatoPayCard({ onClick }: Props) {
  return (
    <motion.button
      className="monato-paycard"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <motion.span
        className="monato-paycard__badge"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 500, damping: 20 }}
      >
        ★ Tu mejor opción
      </motion.span>
      <div className="monato-paycard__logo-wrap">
        <img src={monatoSymbol} alt="Monato" className="monato-paycard__symbol" />
      </div>
      <div className="monato-paycard__name">Monato Pay</div>
    </motion.button>
  );
}
