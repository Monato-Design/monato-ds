import { motion } from 'framer-motion';

const filters = ['Partidos', 'Recomendados', 'Próximos eventos', '1er periodo', '2do periodo'];
const sportTabs = ['⚽ Fútbol', '🏀 Baloncesto', '⚾ Béisbol', '🎾 Tenis', '🎮 Esports', '🏒 Hockey'];

const leagues = [
  {
    name: 'Amistosos. Selecciones', flag: '🌍',
    rows: [
      { t1: 'Albania', t2: 'Israel', s1: 0, s2: 0, time: "27:51 / 1ª parte", odds: ['+154', '+180', '+232'] },
      { t1: 'DR Congo', t2: 'Dinamarca', s1: 0, s2: 0, time: "27:54 / 1ª parte", odds: ['+412', '+218', '-119'] },
    ],
  },
  {
    name: 'Francia. LNB', flag: '🇫🇷',
    rows: [
      { t1: 'Monaco', t2: 'JSF Nanterre', s1: 33, s2: 31, time: '13:50 / 2do cuarto', odds: ['-245', '—', '+193'] },
    ],
  },
  {
    name: 'Grecia. A1', flag: '🇬🇷',
    rows: [
      { t1: 'Olympiacos', t2: 'Panathinaikos', s1: 26, s2: 22, time: '12:36 / 2do cuarto', odds: ['-513', '—', '+362'] },
    ],
  },
];

export default function HomeLiveMatches() {
  return (
    <div className="xbet-live">
      <div className="xbet-live__filters">
        {filters.map((f, i) => (
          <button key={f} className={`xbet-live__filter ${i === 0 ? 'xbet-live__filter--active' : ''}`}>{f}</button>
        ))}
        <div className="xbet-live__search">🔍 Buscar partido</div>
      </div>

      <div className="xbet-live__sports">
        <span className="xbet-live__stream-toggle">◖ Con transmisiones</span>
        {sportTabs.map((s) => (
          <button key={s} className="xbet-live__sport">{s}</button>
        ))}
      </div>

      {leagues.map((lg) => (
        <div key={lg.name} className="xbet-live__league">
          <div className="xbet-live__league-head">
            <span>{lg.flag} {lg.name}</span>
            <span className="xbet-live__cols">1 · X · 2</span>
          </div>
          {lg.rows.map((r, i) => (
            <motion.div
              key={i}
              className="xbet-live__match"
              whileHover={{ backgroundColor: 'rgba(56, 104, 168, 0.06)' }}
            >
              <div className="xbet-live__teams">
                <div className="xbet-live__team">
                  <span>⚪ {r.t1}</span><span className="xbet-live__score">{r.s1}</span>
                </div>
                <div className="xbet-live__team">
                  <span>⚪ {r.t2}</span><span className="xbet-live__score">{r.s2}</span>
                </div>
                <div className="xbet-live__time">⏱ {r.time}</div>
              </div>
              <div className="xbet-live__odds">
                {r.odds.map((o, j) => (
                  <button key={j} className="xbet-live__odd" disabled={o === '—'}>{o}</button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
}
