import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import speiLogo from '../assets/spei.png';

type Props = {
  open: boolean;
  onClose: () => void;
};

type Step = 'form' | 'loading' | 'order';

const FINCO_CLABE = '734180999000000006';
const BENEFICIARY = 'Monato Pay México';

export default function SpeiNativeModal({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>('form');
  const [amount, setAmount] = useState('45.00');
  const [firstName] = useState('Alejandro');
  const [lastName] = useState('lara');
  const [email] = useState('alex.lara@monato.com');
  const [curp, setCurp] = useState('');

  useEffect(() => {
    if (open) { setStep('form'); setAmount('45.00'); setCurp(''); }
  }, [open]);

  useEffect(() => {
    if (step === 'loading') {
      const t = setTimeout(() => setStep('order'), 1400);
      return () => clearTimeout(t);
    }
  }, [step]);

  if (!open) return null;

  // fecha de vencimiento: hoy + 3 días
  const due = new Date();
  due.setDate(due.getDate() + 3);
  const dueStr = `${String(due.getDate()).padStart(2, '0')}/${String(due.getMonth() + 1).padStart(2, '0')}/${due.getFullYear()}`;

  return (
    <div className="spei-overlay" onClick={onClose}>
      <motion.div
        className={`spei-modal ${step === 'order' ? 'spei-modal--wide' : ''}`}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      >
        <button className="spei-modal__close" onClick={onClose} aria-label="Cerrar">×</button>

        <AnimatePresence mode="wait">
          {/* ── STEP 1: formulario SPEI nativo ───────────────── */}
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <div className="spei-modal__logo-head">
                <img src={speiLogo} alt="SPEI" className="spei-modal__logo" />
              </div>
              <div className="spei-form">
                <div className="spei-form__row">
                  <label className="spei-form__label">Importe (Mín. 45.00 MXN):</label>
                  <input className="spei-form__input spei-form__input--amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div className="spei-form__chips">
                  {['300', '100', '500', '1 000'].map((a, i) => (
                    <button key={a} className="spei-form__chip" onClick={() => setAmount(a.replace(' ', ''))}>
                      {a}{i === 0 || i === 2 ? ' 🎁' : ''}
                    </button>
                  ))}
                </div>
                <div className="spei-form__row"><label className="spei-form__label">Nombre:</label><input className="spei-form__input" value={firstName} readOnly /></div>
                <div className="spei-form__row"><label className="spei-form__label">Apellido:</label><input className="spei-form__input" value={lastName} readOnly /></div>
                <div className="spei-form__row"><label className="spei-form__label">E-mail:</label><input className="spei-form__input" value={email} readOnly /></div>
                <div className="spei-form__row">
                  <label className="spei-form__label">CURP:</label>
                  <div className="spei-form__field">
                    <input className="spei-form__input" value={curp} onChange={(e) => setCurp(e.target.value)} placeholder="" />
                    {curp.trim() === '' && <span className="spei-form__error">El campo está vacío</span>}
                  </div>
                </div>
                <p className="spei-form__note">
                  Para ingresar fondos con éxito, deberá ir a su aplicación bancaria o al sitio web de su banco y realizar un pago siguiendo las instrucciones en la página de pago.
                </p>
                <button className="spei-form__confirm" onClick={() => setStep('loading')}>CONFIRMAR</button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: cargando ─────────────────────────────── */}
          {step === 'loading' && (
            <motion.div key="loading" className="spei-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <div className="spei-loading__spinner" />
              <div className="spei-loading__text">Generando tu orden de pago…</div>
            </motion.div>
          )}

          {/* ── STEP 3: detalles del pedido ──────────────────── */}
          {step === 'order' && (
            <motion.div key="order" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="spei-order">
                <div className="spei-order__head">Detalles del pedido</div>

                <div className="spei-order__brandbar">
                  <span className="spei-order__xbet">1XBET</span>
                  <span className="spei-order__cart">🛒 MX${amount.replace('.00', '')} ⌄</span>
                </div>

                <div className="spei-order__pago">Pago</div>

                <div className="spei-order__total">
                  <img src={speiLogo} alt="SPEI" className="spei-order__spei" />
                  <div className="spei-order__total-right">
                    <span className="spei-order__total-label">Total a pagar</span>
                    <span className="spei-order__total-amount">MX${amount.replace('.00', '')}</span>
                  </div>
                </div>

                <div className="spei-order__account">
                  <div className="spei-order__account-col">
                    <span className="spei-order__account-label">Beneficiario 📋</span>
                    <span className="spei-order__account-value">{BENEFICIARY}</span>
                  </div>
                  <div className="spei-order__account-col spei-order__account-col--right">
                    <span className="spei-order__account-label">Tu cuenta CLABE 📋</span>
                    <span className="spei-order__account-value">{FINCO_CLABE}</span>
                  </div>
                </div>

                <div className="spei-order__body">
                  <div className="spei-order__due">{dueStr}</div>
                  <div className="spei-order__due-label">Fecha de vencimiento</div>
                  <div className="spei-order__instr-title">Instrucciones</div>
                  <ol className="spei-order__instr">
                    <li>Accede a tu banca móvil o banca en línea.</li>
                    <li>Ingresa el monto solicitado</li>
                    <li>Copia y pega la CLABE que tienes asignada arriba</li>
                  </ol>
                  <button className="spei-order__back" onClick={onClose}>VOLVER</button>
                </div>

                <div className="spei-order__notes">
                  <div className="spei-order__notes-title">⌄ Notas</div>
                  <ul><li>{BENEFICIARY} es la empresa intermediaria que garantiza la finalización del pago</li></ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
