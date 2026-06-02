type Props = {
  onClick: () => void;
};

export default function MonatoPayCard({ onClick }: Props) {
  return (
    <button className="monato-paycard" onClick={onClick}>
      <span className="monato-paycard__badge">Tu mejor opción</span>
      <div className="monato-paycard__inner">
        <div className="monato-paycard__brand">
          <div className="monato-paycard__logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="var(--primitive-skyblue-500)" />
              <path d="M9 22V10l7 8 7-8v12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <div className="monato-paycard__name">
            <span className="monato-paycard__title">Monato Pay</span>
            <span className="monato-paycard__tagline">SPEI + Stablecoins</span>
          </div>
        </div>
        <div className="monato-paycard__features">
          <div className="monato-paycard__feature">
            <span className="monato-paycard__check">✓</span>
            Mejor tipo de cambio del mercado
          </div>
          <div className="monato-paycard__feature">
            <span className="monato-paycard__check">✓</span>
            Acreditación en menos de 5 minutos
          </div>
          <div className="monato-paycard__feature">
            <span className="monato-paycard__check">✓</span>
            Sin comisiones ocultas
          </div>
        </div>
        <div className="monato-paycard__cta">Depositar con Monato Pay →</div>
      </div>
    </button>
  );
}
