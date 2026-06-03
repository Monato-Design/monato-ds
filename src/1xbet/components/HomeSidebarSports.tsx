import { motion } from 'framer-motion';

const collapsibles = ['Partidos favoritos', 'Recomendados', 'Mejores competiciones'];

const sports = [
  { icon: '⚽', name: 'Fútbol', count: 106 },
  { icon: '🏀', name: 'Baloncesto', count: 44 },
  { icon: '⚾', name: 'Béisbol', count: 9 },
  { icon: '🎾', name: 'Tenis', count: 33 },
  { icon: '🎮', name: 'Esports', count: 21 },
  { icon: '🏒', name: 'Hockey', count: 6 },
  { icon: '🏐', name: 'Voleibol', count: 12 },
  { icon: '🏓', name: 'Tenis de Mesa', count: 50 },
  { icon: '🐎', name: 'Carreras', count: 11 },
];

export default function HomeSidebarSports() {
  return (
    <aside className="xbet-sports">
      <div className="xbet-sports__collapse">« Contraer bloque</div>

      {collapsibles.map((c, i) => (
        <button key={c} className="xbet-sports__group">
          <span>{i === 0 ? '★' : i === 1 ? '👍' : '🏆'} {c}</span>
          <span className="xbet-sports__chevron">⌄</span>
        </button>
      ))}

      {/* Top game en vivo */}
      <div className="xbet-sports__topgame">
        <div className="xbet-sports__topgame-head">
          <span>🎯 Top Games</span>
          <span className="xbet-sports__topgame-nav">‹ 1/5 ›</span>
        </div>
        <div className="xbet-sports__live-label">⚽ Amistosos. Selecciones</div>
        <div className="xbet-sports__live-time">1ª parte, 27 min</div>
        <div className="xbet-sports__live-row"><span>🔵 DR Congo</span><span>0</span></div>
        <div className="xbet-sports__live-row"><span>🔴 Dinamarca</span><span>0</span></div>
        <div className="xbet-sports__live-odds">
          <span>W1 <b>+412</b></span><span>X <b>+218</b></span><span>W2 <b>-119</b></span>
        </div>
      </div>

      {/* Tabs LIVE / SPORTS */}
      <div className="xbet-sports__tabs">
        <button className="xbet-sports__tab xbet-sports__tab--active">● EN VIVO</button>
        <button className="xbet-sports__tab">DEPORTES</button>
      </div>

      <div className="xbet-sports__count">TODOS <b>1030</b> · ▶ 341</div>
      <div className="xbet-sports__top">Top</div>

      {sports.map((s) => (
        <motion.button
          key={s.name}
          className="xbet-sports__item"
          whileHover={{ x: 3, backgroundColor: 'rgba(255,255,255,0.06)' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <span className="xbet-sports__item-icon">{s.icon}</span>
          <span className="xbet-sports__item-name">{s.name}</span>
          <span className="xbet-sports__item-count">({s.count})</span>
          <span className="xbet-sports__item-chevron">⌄</span>
        </motion.button>
      ))}
    </aside>
  );
}
