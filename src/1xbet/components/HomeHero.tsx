type Props = {
  onDeposit: () => void;
};

export default function HomeHero({ onDeposit }: Props) {
  return (
    <section className="xbet-hero">
      <div className="xbet-hero__content">
        <div className="xbet-hero__eyebrow">BONO DE BIENVENIDA</div>
        <h1 className="xbet-hero__title">
          HASTA <span className="xbet-hero__amount">$40,000 MXN</span>
        </h1>
        <p className="xbet-hero__subtitle">+ 150 giros gratis en Casino + 1xGames</p>
        <button className="xbet-hero__cta" onClick={onDeposit}>
          DEPOSITAR Y RECLAMAR
        </button>
      </div>
      <div className="xbet-hero__visual">
        <div className="xbet-hero__ball xbet-hero__ball--1" />
        <div className="xbet-hero__ball xbet-hero__ball--2" />
        <div className="xbet-hero__ball xbet-hero__ball--3" />
      </div>
    </section>
  );
}
