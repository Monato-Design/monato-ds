type Props = {
  onDeposit: () => void;
  onLogoClick?: () => void;
};

export default function Header1xbet({ onDeposit, onLogoClick }: Props) {
  const navItems = [
    "LIGA MX",
    "DEPORTES",
    "DIRECTO",
    "1XGAMES",
    "CASINO",
    "CASINO EN DIRECTO",
    "ESPORTS",
    "OFERTAS ESPECIALES",
    "MÁS",
  ];

  return (
    <header className="xbet-header">
      <div className="xbet-header__top">
        <div className="xbet-header__brand" onClick={onLogoClick} style={{ cursor: onLogoClick ? "pointer" : "default" }}>
          <span className="xbet-header__logo">1XBET</span>
          <span className="xbet-header__flag">🇲🇽</span>
        </div>

        <div className="xbet-header__actions">
          <button className="xbet-header__icon-btn" aria-label="gifts">🎁<span className="xbet-header__badge">1</span></button>
          <div className="xbet-header__user">
            <span className="xbet-header__avatar">👤</span>
            <div className="xbet-header__user-info">
              <div>MX$</div>
              <div className="xbet-header__user-sub">Puntos</div>
            </div>
            <div className="xbet-header__balance">
              <div>0</div>
              <div>0</div>
            </div>
            <button className="xbet-header__icon-btn" aria-label="refresh">⟳</button>
          </div>
          <button className="xbet-header__deposit" onClick={onDeposit}>
            HACER UN DEPÓSITO
          </button>
          <button className="xbet-header__icon-btn" aria-label="messages">✉<span className="xbet-header__badge">1</span></button>
          <button className="xbet-header__icon-btn" aria-label="settings">⚙</button>
          <button className="xbet-header__icon-btn">🇪🇸 ES / 14:23</button>
        </div>
      </div>

      <nav className="xbet-header__nav">
        {navItems.map((item) => (
          <a key={item} className="xbet-header__nav-item">
            {item} <span className="xbet-header__nav-caret">⌄</span>
          </a>
        ))}
        <span className="xbet-header__nav-fruit">🍹 Fruit Cocktail</span>
      </nav>
    </header>
  );
}
