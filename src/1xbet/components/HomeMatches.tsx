const matches = [
  { league: "LIGA MX", time: "20:00", team1: "América", team2: "Chivas", odds: ["1.85", "3.40", "4.20"] },
  { league: "LIGA MX", time: "22:00", team1: "Tigres", team2: "Monterrey", odds: ["2.10", "3.20", "3.50"] },
  { league: "PREMIER LEAGUE", time: "21:30", team1: "Man City", team2: "Liverpool", odds: ["1.95", "3.60", "3.80"] },
  { league: "NBA", time: "19:00", team1: "Lakers", team2: "Warriors", odds: ["1.75", "—", "2.05"] },
  { league: "LA LIGA", time: "14:00", team1: "Real Madrid", team2: "Barcelona", odds: ["2.30", "3.10", "2.90"] },
  { league: "CHAMPIONS", time: "13:45", team1: "PSG", team2: "Bayern", odds: ["2.80", "3.40", "2.40"] },
];

export default function HomeMatches() {
  return (
    <section className="xbet-matches">
      <div className="xbet-matches__header">
        <h2 className="xbet-matches__title">⚡ PARTIDOS DESTACADOS HOY</h2>
        <a className="xbet-matches__link">Ver todos →</a>
      </div>
      <div className="xbet-matches__grid">
        {matches.map((m, i) => (
          <div key={i} className="xbet-match">
            <div className="xbet-match__top">
              <span className="xbet-match__league">{m.league}</span>
              <span className="xbet-match__time">⏱ {m.time}</span>
            </div>
            <div className="xbet-match__teams">
              <div className="xbet-match__team">{m.team1}</div>
              <div className="xbet-match__vs">vs</div>
              <div className="xbet-match__team">{m.team2}</div>
            </div>
            <div className="xbet-match__odds">
              {m.odds.map((o, j) => (
                <button key={j} className="xbet-match__odd" disabled={o === "—"}>
                  {o}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
