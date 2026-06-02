const navItems = {
  wallet: [
    { label: "Hacer un depósito", icon: "$", active: true, alert: true },
    { label: "Retirada de fondos", icon: "⇡" },
    { label: "Historial de apuestas", icon: "⏱" },
    { label: "Historial de transacciones", icon: "⇄" },
    { label: "Consultas sobre pagos", icon: "$" },
  ],
  profile: [
    { label: "Datos personales", icon: "👤", alert: true },
    { label: "Seguridad", icon: "🔒", alert: true },
    { label: "Configuración de la Cuenta", icon: "⚙" },
  ],
  extra: [
    { label: "Invite a sus amigos", icon: "👥" },
    { label: "Devolución VIP de Casino", icon: "🌐" },
    { label: "Bonos y regalos", icon: "🎁" },
    { label: "Promociones", icon: "📢" },
    { label: "Atención al cliente", icon: "🎧" },
  ],
};

export default function Sidebar1xbet() {
  return (
    <aside className="xbet-sidebar">
      <div className="xbet-sidebar__profile">
        <div className="xbet-sidebar__name">Alejandro</div>
        <div className="xbet-sidebar__email">alex.lara@monato.com</div>
        <div className="xbet-sidebar__progress">1/5</div>
      </div>

      <div className="xbet-sidebar__stats">
        <div className="xbet-sidebar__stat">
          <span>Puntos</span>
          <span>0</span>
        </div>
        <div className="xbet-sidebar__stat">
          <span>Cuenta principal (MX$)</span>
          <span>0</span>
        </div>
      </div>

      <div className="xbet-sidebar__section-title">MI CARTERA Y MIS APUESTAS</div>
      {navItems.wallet.map((item) => (
        <a key={item.label} className={`xbet-sidebar__item ${item.active ? "xbet-sidebar__item--active" : ""}`}>
          <span className="xbet-sidebar__item-icon">{item.icon}</span>
          <span>{item.label}</span>
          {item.alert && <span className="xbet-sidebar__alert">!</span>}
        </a>
      ))}

      <div className="xbet-sidebar__section-title">PERFIL</div>
      {navItems.profile.map((item) => (
        <a key={item.label} className="xbet-sidebar__item">
          <span className="xbet-sidebar__item-icon">{item.icon}</span>
          <span>{item.label}</span>
          {item.alert && <span className="xbet-sidebar__alert">!</span>}
        </a>
      ))}

      <div className="xbet-sidebar__section-title">ADICIONAL</div>
      {navItems.extra.map((item) => (
        <a key={item.label} className="xbet-sidebar__item">
          <span className="xbet-sidebar__item-icon">{item.icon}</span>
          <span>{item.label}</span>
        </a>
      ))}

      <div className="xbet-sidebar__footer">
        <button className="xbet-sidebar__logout">⇥ Cerrar sesión</button>
      </div>
    </aside>
  );
}
