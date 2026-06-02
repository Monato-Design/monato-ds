type Props = {
  onClick: () => void;
};

export default function MonatoPayCard({ onClick }: Props) {
  return (
    <button className="monato-paycard" onClick={onClick}>
      <span className="monato-paycard__badge">★ Tu mejor opción</span>
      <div className="monato-paycard__logo-wrap">
        <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="var(--primitive-skyblue-500)" />
          <path d="M9 22V10l7 8 7-8v12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
      <div className="monato-paycard__name">Monato Pay</div>
    </button>
  );
}
