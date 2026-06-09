import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Doller, Diamonds1 } from '@tailgrids/icons';
import monatoLogo from '../../assets/logo-default.png';

type Props = {
  open: boolean;
  onClose: () => void;
  defaultTab?: 'spei' | 'crypto';
};

type Tab = 'spei' | 'crypto';
type Step = 'form' | 'result';

const USDC_RATE = 16.94;

export default function MonatoPayModal({ open, onClose, defaultTab }: Props) {
  const [tab, setTab] = useState<Tab>(defaultTab ?? 'spei');
  const [step, setStep] = useState<Step>('form');

  const isSingleMethod = defaultTab !== undefined;

  const [mxnAmount, setMxnAmount] = useState('500');
  const [firstName] = useState('Alejandro');
  const [lastName] = useState('Lara');
  const [email] = useState('alex.lara@monato.com');

  const [stablecoin, setStablecoin] = useState<'USDC' | 'USDT'>('USDC');
  const [network, setNetwork] = useState<'ERC20' | 'TRC20' | 'BEP20'>('ERC20');
  const [usdcAmount, setUsdcAmount] = useState('30');

  useEffect(() => {
    if (open) {
      setTab(defaultTab ?? 'spei');
      setStep('form');
    }
  }, [open, defaultTab]);

  if (!open) return null;

  const speiReceive = parseFloat(mxnAmount || '0').toFixed(2);
  const cryptoReceive = (parseFloat(usdcAmount || '0') * USDC_RATE).toFixed(2);

  return (
    <AnimatePresence>
      <motion.div
        className="monato-modal-overlay"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <motion.div
          className="monato-modal"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >
          <button className="monato-modal__close" onClick={onClose} aria-label="Cerrar">×</button>

          <div className="monato-modal__header">
            <img src={monatoLogo} alt="Monato" className="monato-modal__logo" />
            <span className="monato-modal__pay">
              {isSingleMethod ? (defaultTab === 'spei' ? 'SPEI' : 'Crypto') : 'Pay'}
            </span>
            <p className="monato-modal__subtitle">
              {isSingleMethod
                ? defaultTab === 'spei'
                  ? 'Deposita en 1xBet via transferencia SPEI. Acreditación en menos de 5 minutos.'
                  : 'Deposita en 1xBet con USDC o USDT. El mejor tipo de cambio del mercado.'
                : 'Deposita en 1xBet usando SPEI o stablecoins. Acreditación en menos de 5 minutos.'
              }
            </p>
          </div>

          {/* Tab nav — solo visible en Monato Pay (las otras van directo al método) */}
          {!isSingleMethod && (
          <div className="monato-tabnav">
            <button
              className={`monato-tabnav__tab ${tab === 'spei' ? 'monato-tabnav__tab--active' : ''}`}
              onClick={() => { setTab('spei'); setStep('form'); }}
            >
              <Doller size={15} />
              <span>SPEI</span>
              <span className="monato-tabnav__badge">Recomendable</span>
              {tab === 'spei' && <motion.span layoutId="tabnav-underline" className="monato-tabnav__underline" />}
            </button>
            <button
              className={`monato-tabnav__tab ${tab === 'crypto' ? 'monato-tabnav__tab--active' : ''}`}
              onClick={() => { setTab('crypto'); setStep('form'); }}
            >
              <Diamonds1 size={15} />
              <span>Crypto / Stablecoins</span>
              {tab === 'crypto' && <motion.span layoutId="tabnav-underline" className="monato-tabnav__underline" />}
            </button>
          </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={`${tab}-${step}`}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              {step === 'form' && tab === 'spei' && (
                <div className="monato-modal__body">
                  <div className="monato-field">
                    <label className="monato-field__label">Importe (Mín. 45.00 MXN)</label>
                    <div className="monato-field__input-wrap">
                      <input type="number" min="45" value={mxnAmount} onChange={(e) => setMxnAmount(e.target.value)} className="monato-field__input" />
                      <span className="monato-field__suffix">MXN</span>
                    </div>
                  </div>
                  <div className="monato-chips">
                    {['100', '300', '500', '1000'].map((amt) => (
                      <button key={amt} className={`monato-chip ${mxnAmount === amt ? 'monato-chip--active' : ''}`} onClick={() => setMxnAmount(amt)}>${amt}</button>
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
                  <motion.button className="monato-btn monato-btn--primary" onClick={() => setStep('result')} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                    Generar CLABE de depósito
                  </motion.button>
                  <p className="monato-disclaimer">Recibirás una CLABE única para transferir desde tu app bancaria.</p>
                </div>
              )}

              {step === 'form' && tab === 'crypto' && (
                <div className="monato-modal__body">
                  <div className="monato-field">
                    <label className="monato-field__label">Stablecoin</label>
                    <div className="monato-pills">
                      {(['USDC', 'USDT'] as const).map((c) => (
                        <button key={c} className={`monato-pill ${stablecoin === c ? 'monato-pill--active' : ''}`} onClick={() => setStablecoin(c)}>{c}</button>
                      ))}
                    </div>
                  </div>
                  <div className="monato-field">
                    <label className="monato-field__label">Red</label>
                    <div className="monato-pills">
                      {(['ERC20', 'TRC20', 'BEP20'] as const).map((n) => (
                        <button key={n} className={`monato-pill ${network === n ? 'monato-pill--active' : ''}`} onClick={() => setNetwork(n)}>{n}</button>
                      ))}
                    </div>
                  </div>
                  <div className="monato-field">
                    <label className="monato-field__label">Cantidad (Mín. 30 {stablecoin})</label>
                    <div className="monato-field__input-wrap">
                      <input type="number" min="30" value={usdcAmount} onChange={(e) => setUsdcAmount(e.target.value)} className="monato-field__input" />
                      <span className="monato-field__suffix">{stablecoin}</span>
                    </div>
                  </div>
                  <div className="monato-receive">
                    <span className="monato-receive__label">Recibes en 1xBet<span className="monato-receive__rate">1 {stablecoin} = {USDC_RATE} MXN</span></span>
                    <span className="monato-receive__amount">${cryptoReceive} MXN</span>
                  </div>
                  <motion.button className="monato-btn monato-btn--primary" onClick={() => setStep('result')} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                    Generar dirección de depósito
                  </motion.button>
                  <p className="monato-disclaimer">El tipo de cambio se fija al momento de confirmar el depósito.</p>
                </div>
              )}

              {step === 'result' && tab === 'spei' && (
                <div className="monato-modal__body">
                  <div className="monato-result">
                    <motion.div className="monato-result__check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }}>✓</motion.div>
                    <div className="monato-result__title">CLABE generada</div>
                    <div className="monato-result__sub">Transfiere ${speiReceive} MXN desde tu banco</div>
                  </div>
                  <div className="monato-info-card">
                    <div className="monato-info-card__row"><span className="monato-info-card__label">CLABE</span><span className="monato-info-card__value">012180001234567890</span></div>
                    <div className="monato-info-card__row"><span className="monato-info-card__label">Beneficiario</span><span className="monato-info-card__value">Monato Pay México</span></div>
                    <div className="monato-info-card__row"><span className="monato-info-card__label">Banco</span><span className="monato-info-card__value">STP</span></div>
                    <div className="monato-info-card__row"><span className="monato-info-card__label">Concepto</span><span className="monato-info-card__value">1XBET-1688885881</span></div>
                    <div className="monato-info-card__row"><span className="monato-info-card__label">Importe</span><span className="monato-info-card__value">${speiReceive} MXN</span></div>
                  </div>
                  <motion.button className="monato-btn monato-btn--primary" onClick={onClose} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>He realizado la transferencia</motion.button>
                  <button className="monato-btn monato-btn--ghost" onClick={() => setStep('form')}>← Volver</button>
                </div>
              )}

              {step === 'result' && tab === 'crypto' && (
                <div className="monato-modal__body">
                  <div className="monato-result">
                    <motion.div className="monato-result__check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }}>✓</motion.div>
                    <div className="monato-result__title">Dirección generada</div>
                    <div className="monato-result__sub">Envía {usdcAmount} {stablecoin} ({network})</div>
                  </div>
                  <div className="monato-qr">
                    <svg viewBox="0 0 100 100" width="160" height="160" className="monato-qr__svg">
                      <rect width="100" height="100" fill="white" />
                      {Array.from({ length: 400 }, (_, i) => {
                        const x = (i % 20) * 5; const y = Math.floor(i / 20) * 5;
                        return ((i * 7919) % 13) < 6 ? <rect key={i} x={x} y={y} width="5" height="5" fill="#000" /> : null;
                      })}
                      <rect x="0" y="0" width="25" height="25" fill="white" stroke="black" strokeWidth="3" /><rect x="6" y="6" width="13" height="13" fill="black" />
                      <rect x="75" y="0" width="25" height="25" fill="white" stroke="black" strokeWidth="3" /><rect x="81" y="6" width="13" height="13" fill="black" />
                      <rect x="0" y="75" width="25" height="25" fill="white" stroke="black" strokeWidth="3" /><rect x="6" y="81" width="13" height="13" fill="black" />
                    </svg>
                  </div>
                  <div className="monato-info-card">
                    <div className="monato-info-card__row"><span className="monato-info-card__label">Dirección</span><span className="monato-info-card__value monato-info-card__value--mono">0x167e8e70f003907fb2fc9191dde4b50f386aedc7</span></div>
                    <div className="monato-info-card__row"><span className="monato-info-card__label">Red</span><span className="monato-info-card__value">{network}</span></div>
                    <div className="monato-info-card__row"><span className="monato-info-card__label">Enviar</span><span className="monato-info-card__value">{usdcAmount} {stablecoin}</span></div>
                    <div className="monato-info-card__row"><span className="monato-info-card__label">Recibes</span><span className="monato-info-card__value">${cryptoReceive} MXN</span></div>
                  </div>
                  <motion.button className="monato-btn monato-btn--primary" onClick={onClose} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>He enviado el depósito</motion.button>
                  <button className="monato-btn monato-btn--ghost" onClick={() => setStep('form')}>← Volver</button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
