import { motion } from 'framer-motion';

const games = [
  { name: '1xGames', bg: 'linear-gradient(135deg, #1565c0, #0d47a1)', emoji: '🎰' },
  { name: 'Crash', bg: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)', emoji: '✈️' },
  { name: 'Crystal', bg: 'linear-gradient(135deg, #6a1b9a, #4a148c)', emoji: '💎' },
  { name: 'Burning Hot', bg: 'linear-gradient(135deg, #bf360c, #d84315)', emoji: '🔥' },
  { name: 'Scratch Card', bg: 'linear-gradient(135deg, #00695c, #004d40)', emoji: '🎴' },
  { name: 'Western Slot', bg: 'linear-gradient(135deg, #5d4037, #3e2723)', emoji: '🤠' },
  { name: 'Solitaire', bg: 'linear-gradient(135deg, #c62828, #8e0000)', emoji: '🃏' },
];

export default function HomeCasinoRow() {
  return (
    <div className="xbet-casino">
      {games.map((g) => (
        <motion.button
          key={g.name}
          className="xbet-casino__game"
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        >
          <div className="xbet-casino__thumb" style={{ background: g.bg }}>
            <span className="xbet-casino__emoji">{g.emoji}</span>
          </div>
          <div className="xbet-casino__name">{g.name}</div>
        </motion.button>
      ))}
    </div>
  );
}
