import { useState, useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Tab = "spei" | "crypto";
type Step = "form" | "result";

const USDC_RATE = 16.94;

export default function MonatoPayModal({ open, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("spei");
  const [step, setStep] = useState<Step>("form");

  // SPEI state
  const [mxnAmount, setMxnAmount] = useState("500");
  const [firstName] = useState("Alejandro");
  const [lastName] = useState("Lara");
  const [email] = useState("alex.lara@monato.com");

  // Crypto state
  const [stablecoin, setStablecoin] = useState<"USDC" | "USDT">("USDC");
  const [network, setNetwork] = useState<"ERC20" | "TRC20" | "BEP20">("ERC20");
  const [usdcAmount, setUsdcAmount] = useState("30");

  useEffect(() => {
    if (!open) {
      // reset on close
      setTimeout(() => {
        setTab("spei");
        setStep("form");
      }, 200);
    }
  }, [open]);

  if (!open) return null;

  const speiReceive = parseFloat(mxnAmount || "0").toFixed(2);
  const cryptoReceive = (parseFloat(usdcAmount || "0") * USDC_RATE).toFixed(2);

  return (
    <div className="monato-modal-overlay" onClick={onClose}>
      <div className="monato-modal" onClick={(e) => e.stopPropagation()}>
        <button className="monato-modal__close" onClick={onClose} aria-label="Cerrar">×</button>

        <div className="monato-modal__header">
          <div className="monato-modal__brand">
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="var(--primitive-skyblue-500)" />
              <path d="M9 22V10l7 8 7-8v12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <div className="monato-modal__brand-name">Monato Pay</div>
          </div>
          <p className="monato-modal__subtitle">
            Deposita en 1xBet usando SPEI o stablecoins. Acreditación en menos de 5 minutos.
          </p>
        </div>

        {step === "form" && (
          <>
            <div className="monato-modal__tabs">
              <button
                className={`monato-modal__tab ${tab === "spei" ? "monato-modal__tab--active" : ""}`}
                onClick={() => setTab("spei")}
              >
                <span className="monato-modal__tab-icon">🏦</span>
                <span className="monato-modal__tab-label">SPEI</span>
                <span className="monato-modal__tab-rec">Recomendable</span>
              </button>
              <button
                className={`monato-modal__tab ${tab === "crypto" ? "monato-modal__tab--active" : ""}`}
                onClick={() => setTab("crypto")}
              >
                <span className="monato-modal__tab-icon">⬢</span>
                <span className="monato-modal__tab-label">Crypto / Stablecoins</span>
              </button>
            </div>

            {tab === "spei" && (
              <div className="monato-modal__body">
                <div className="monato-field">
                  <label className="monato-field__label">Importe (Mín. 45.00 MXN)</label>
                  <div className="monato-field__input-wrap">
                    <input
                      type="number"
                      min="45"
                      value={mxnAmount}
                      onChange={(e) => setMxnAmount(e.target.value)}
                      className="monato-field__input"
                    />
                    <span className="monato-field__suffix">MXN</span>
                  </div>
                </div>

                <div className="monato-chips">
                  {["100", "300", "500", "1000"].map((amt) => (
                    <button
                      key={amt}
                      className={`monato-chip ${mxnAmount === amt ? "monato-chip--active" : ""}`}
                      onClick={() => setMxnAmount(amt)}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                <div className="monato-receive">
                  <span className="monato-receive__label">Recibes en 1xBet</span>
                  <span className="monato-receive__amount">${speiReceive} MXN</span>
                </div>

                <div className="monato-field">
                  <label className="monato-field__label">Nombre</label>
                  <input value={firstName} readOnly className="monato-field__input monato-field__input--readonly" />
                </div>
                <div className="monato-field">
                  <label className="monato-field__label">Apellido</label>
                  <input value={lastName} readOnly className="monato-field__input monato-field__input--readonly" />
                </div>
                <div className="monato-field">
                  <label className="monato-field__label">E-mail</label>
                  <input value={email} readOnly className="monato-field__input monato-field__input--readonly" />
                </div>

                <button className="monato-btn monato-btn--primary" onClick={() => setStep("result")}>
                  Generar CLABE de depósito
                </button>

                <p className="monato-disclaimer">
                  Recibirás una CLABE única para transferir desde tu app bancaria.
                  Tu depósito se acredita automáticamente en 1xBet.
                </p>
              </div>
            )}

            {tab === "crypto" && (
              <div className="monato-modal__body">
                <div className="monato-field">
                  <label className="monato-field__label">Stablecoin</label>
                  <div className="monato-pills">
                    {(["USDC", "USDT"] as const).map((c) => (
                      <button
                        key={c}
                        className={`monato-pill ${stablecoin === c ? "monato-pill--active" : ""}`}
                        onClick={() => setStablecoin(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="monato-field">
                  <label className="monato-field__label">Red</label>
                  <div className="monato-pills">
                    {(["ERC20", "TRC20", "BEP20"] as const).map((n) => (
                      <button
                        key={n}
                        className={`monato-pill ${network === n ? "monato-pill--active" : ""}`}
                        onClick={() => setNetwork(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="monato-field">
                  <label className="monato-field__label">Cantidad (Mín. 30 {stablecoin})</label>
                  <div className="monato-field__input-wrap">
                    <input
                      type="number"
                      min="30"
                      value={usdcAmount}
                      onChange={(e) => setUsdcAmount(e.target.value)}
                      className="monato-field__input"
                    />
                    <span className="monato-field__suffix">{stablecoin}</span>
                  </div>
                </div>

                <div className="monato-receive">
                  <span className="monato-receive__label">
                    Recibes en 1xBet
                    <span className="monato-receive__rate">1 {stablecoin} = {USDC_RATE} MXN</span>
                  </span>
                  <span className="monato-receive__amount">${cryptoReceive} MXN</span>
                </div>

                <button className="monato-btn monato-btn--primary" onClick={() => setStep("result")}>
                  Generar dirección de depósito
                </button>

                <p className="monato-disclaimer">
                  El tipo de cambio se fija al momento de confirmar el depósito.
                </p>
              </div>
            )}
          </>
        )}

        {step === "result" && tab === "spei" && (
          <div className="monato-modal__body">
            <div className="monato-result">
              <div className="monato-result__check">✓</div>
              <div className="monato-result__title">CLABE generada</div>
              <div className="monato-result__sub">Transfiere ${speiReceive} MXN desde tu banco</div>
            </div>

            <div className="monato-info-card">
              <div className="monato-info-card__row">
                <span className="monato-info-card__label">CLABE</span>
                <span className="monato-info-card__value">012180001234567890</span>
              </div>
              <div className="monato-info-card__row">
                <span className="monato-info-card__label">Beneficiario</span>
                <span className="monato-info-card__value">Monato Pay México</span>
              </div>
              <div className="monato-info-card__row">
                <span className="monato-info-card__label">Banco</span>
                <span className="monato-info-card__value">STP</span>
              </div>
              <div className="monato-info-card__row">
                <span className="monato-info-card__label">Concepto</span>
                <span className="monato-info-card__value">1XBET-1688885881</span>
              </div>
              <div className="monato-info-card__row">
                <span className="monato-info-card__label">Importe</span>
                <span className="monato-info-card__value">${speiReceive} MXN</span>
              </div>
            </div>

            <button className="monato-btn monato-btn--primary" onClick={onClose}>
              He realizado la transferencia
            </button>

            <button className="monato-btn monato-btn--ghost" onClick={() => setStep("form")}>
              ← Volver
            </button>
          </div>
        )}

        {step === "result" && tab === "crypto" && (
          <div className="monato-modal__body">
            <div className="monato-result">
              <div className="monato-result__check">✓</div>
              <div className="monato-result__title">Dirección generada</div>
              <div className="monato-result__sub">
                Envía {usdcAmount} {stablecoin} ({network})
              </div>
            </div>

            <div className="monato-qr">
              <svg viewBox="0 0 100 100" width="160" height="160" className="monato-qr__svg">
                <rect width="100" height="100" fill="white" />
                {Array.from({ length: 400 }, (_, i) => {
                  const x = (i % 20) * 5;
                  const y = Math.floor(i / 20) * 5;
                  const fill = ((i * 7919) % 13) < 6 ? "#000" : "transparent";
                  return <rect key={i} x={x} y={y} width="5" height="5" fill={fill} />;
                })}
                <rect x="0" y="0" width="25" height="25" fill="white" stroke="black" strokeWidth="3" />
                <rect x="6" y="6" width="13" height="13" fill="black" />
                <rect x="75" y="0" width="25" height="25" fill="white" stroke="black" strokeWidth="3" />
                <rect x="81" y="6" width="13" height="13" fill="black" />
                <rect x="0" y="75" width="25" height="25" fill="white" stroke="black" strokeWidth="3" />
                <rect x="6" y="81" width="13" height="13" fill="black" />
              </svg>
            </div>

            <div className="monato-info-card">
              <div className="monato-info-card__row">
                <span className="monato-info-card__label">Dirección</span>
                <span className="monato-info-card__value monato-info-card__value--mono">
                  0x167e8e70f003907fb2fc9191dde4b50f386aedc7
                </span>
              </div>
              <div className="monato-info-card__row">
                <span className="monato-info-card__label">Red</span>
                <span className="monato-info-card__value">{network}</span>
              </div>
              <div className="monato-info-card__row">
                <span className="monato-info-card__label">Enviar</span>
                <span className="monato-info-card__value">{usdcAmount} {stablecoin}</span>
              </div>
              <div className="monato-info-card__row">
                <span className="monato-info-card__label">Recibes</span>
                <span className="monato-info-card__value">${cryptoReceive} MXN</span>
              </div>
            </div>

            <button className="monato-btn monato-btn--primary" onClick={onClose}>
              He enviado el depósito
            </button>

            <button className="monato-btn monato-btn--ghost" onClick={() => setStep("form")}>
              ← Volver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
