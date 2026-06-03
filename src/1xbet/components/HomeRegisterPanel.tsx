import { motion } from 'framer-motion';

type Props = { onDeposit: () => void };

export default function HomeRegisterPanel({ onDeposit }: Props) {
  return (
    <aside className="xbet-register">
      <div className="xbet-register__collapse">Contraer bloque »</div>

      <div className="xbet-register__card">
        <div className="xbet-register__title">REGISTRARSE</div>

        <button className="xbet-register__method">📱 Por teléfono</button>

        <p className="xbet-register__hint">Introduce tu número de teléfono y elige cómo recibir el código</p>

        <div className="xbet-register__phone">
          <span className="xbet-register__flag">🇲🇽 ⌄</span>
          <span className="xbet-register__code">+ 52</span>
          <span className="xbet-register__placeholder">222 123 4567</span>
        </div>

        <div className="xbet-register__select">SMS ⌄</div>
        <motion.button className="xbet-register__send" whileHover={{ opacity: 0.9 }} whileTap={{ scale: 0.98 }}>
          ENVIAR POR SMS
        </motion.button>

        <div className="xbet-register__select">Peso mexicano (MX$) ⌄</div>
        <div className="xbet-register__promo">Código promocional</div>

        <motion.button
          className="xbet-register__submit"
          onClick={onDeposit}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          REGISTRARSE
        </motion.button>
      </div>

      <div className="xbet-register__bonus">100% BONO EN TU 1ER DEPÓSITO</div>

      {/* Bet slip */}
      <div className="xbet-register__betslip">
        <div className="xbet-register__betslip-tabs">
          <span className="xbet-register__betslip-tab xbet-register__betslip-tab--active">Cupón</span>
          <span className="xbet-register__betslip-tab">Mis apuestas</span>
        </div>
        <div className="xbet-register__betslip-empty">
          <div className="xbet-register__betslip-icon">🎫</div>
          Añade eventos al cupón o ingresa un código
        </div>
      </div>

      {/* App movil */}
      <div className="xbet-register__app">
        <div className="xbet-register__app-stores">
          <span>🤖 Android</span>
          <span> iOS</span>
        </div>
        <div className="xbet-register__app-body">
          <div className="xbet-register__qr">
            <svg viewBox="0 0 100 100" width="56" height="56">
              <rect width="100" height="100" fill="white" />
              {Array.from({ length: 400 }, (_, i) => {
                const x = (i % 20) * 5; const y = Math.floor(i / 20) * 5;
                return ((i * 7919) % 13) < 6 ? <rect key={i} x={x} y={y} width="5" height="5" fill="#000" /> : null;
              })}
            </svg>
          </div>
          <div className="xbet-register__app-text">
            <b>1XBET</b>
            <span>APP MÓVIL</span>
            <span className="xbet-register__app-dl">⬇ Descarga gratis</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
