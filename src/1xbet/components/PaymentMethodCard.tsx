type Props = {
  logo: string;
  name: string;
  onClick?: () => void;
};

export default function PaymentMethodCard({ logo, name, onClick }: Props) {
  return (
    <button
      className="xbet-paycard"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="xbet-paycard__logo-wrap">
        <img src={logo} alt={name} className="xbet-paycard__logo" />
      </div>
      <div className="xbet-paycard__name">{name}</div>
    </button>
  );
}
