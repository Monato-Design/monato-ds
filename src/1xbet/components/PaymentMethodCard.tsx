type Props = {
  logo: string;
  name: string;
};

export default function PaymentMethodCard({ logo, name }: Props) {
  return (
    <div className="xbet-paycard">
      <div className="xbet-paycard__logo-wrap">
        <img src={logo} alt={name} className="xbet-paycard__logo" />
      </div>
      <div className="xbet-paycard__name">{name}</div>
    </div>
  );
}
