// Giftcards — Prototipo B2C (BillPay)
// Flujo: Catálogo → Detalle (monto + T&C) → Confirmación → Resultado
// Patrón Mac-window + entry card, state machine con useReducer.
// Iconos: SVG inline (evitamos depender de nombres de @tailgrids/icons
// que no están validados en CLAUDE.md para este módulo).

import { useReducer, useState, useMemo } from 'react';
import type { ReactNode, Dispatch } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CATALOG,
  GiftcardPayee,
  RedeemResponse,
  RedeemError,
  SimScenario,
  simulateRedeem,
  uuidv4,
  formatMXN,
} from './data';

const BORDER = '#d9e2ec';

/* ─── Iconos ──────────────────────────────────────────────── */
const Icon = {
  Back: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
  ),
  Copy: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
  ),
  Check: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
  ),
  Alert: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4M12 17h.01" /></svg>
  ),
  Chevron: ({ open }: { open: boolean }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}><path d="m6 9 6 6 6-6" /></svg>
  ),
  External: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
  ),
};

/* ─── State machine ───────────────────────────────────────── */
type Step = 'catalog' | 'detail' | 'confirm' | 'processing' | 'success' | 'error';

interface State {
  step: Step;
  payee: GiftcardPayee | null;
  amountPesos: number | null;
  termsAccepted: boolean;
  result: RedeemResponse | null;
  error: RedeemError | null;
  transactionId: string | null;
}

type Action =
  | { type: 'SELECT_PAYEE'; payee: GiftcardPayee }
  | { type: 'SET_AMOUNT'; pesos: number | null }
  | { type: 'TOGGLE_TERMS' }
  | { type: 'TO_CONFIRM' }
  | { type: 'SUBMIT'; transactionId: string }
  | { type: 'SUCCESS'; result: RedeemResponse }
  | { type: 'FAIL'; error: RedeemError }
  | { type: 'BACK' }
  | { type: 'RESET' };

const initial: State = {
  step: 'catalog',
  payee: null,
  amountPesos: null,
  termsAccepted: false,
  result: null,
  error: null,
  transactionId: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SELECT_PAYEE':
      return { ...initial, step: 'detail', payee: action.payee };
    case 'SET_AMOUNT':
      return { ...state, amountPesos: action.pesos };
    case 'TOGGLE_TERMS':
      return { ...state, termsAccepted: !state.termsAccepted };
    case 'TO_CONFIRM':
      return { ...state, step: 'confirm' };
    case 'SUBMIT':
      return { ...state, step: 'processing', transactionId: action.transactionId, error: null };
    case 'SUCCESS':
      return { ...state, step: 'success', result: action.result };
    case 'FAIL':
      return { ...state, step: 'error', error: action.error };
    case 'BACK':
      if (state.step === 'detail') return { ...initial };
      if (state.step === 'confirm') return { ...state, step: 'detail' };
      if (state.step === 'error') return { ...state, step: 'confirm', error: null };
      return state;
    case 'RESET':
      return { ...initial };
    default:
      return state;
  }
}

/* ─── UI base (tokens DS) ─────────────────────────────────── */
function PrimaryButton({ children, disabled, onClick }: { children: ReactNode; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full h-11 font-medium text-sm transition-colors"
      style={{
        borderRadius: 'var(--radius-default)',
        background: disabled ? 'var(--color-button-disabled-primary-background)' : 'var(--color-button-primary-background)',
        color: disabled ? 'var(--color-button-disabled-primary-text)' : 'var(--color-button-primary-text)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-family-sans)',
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = 'var(--color-button-primary-hover-background)'; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = 'var(--color-button-primary-background)'; }}
    >
      {children}
    </button>
  );
}

function OutlineButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-11 px-4 inline-flex items-center gap-2 font-medium text-sm transition-colors"
      style={{
        borderRadius: 'var(--radius-default)',
        background: 'var(--color-button-primary-outline-background)',
        border: `1px solid ${BORDER}`,
        color: 'var(--color-button-primary-outline-text)',
        fontFamily: 'var(--font-family-sans)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-button-primary-outline-hover-background)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-button-primary-outline-background)')}
    >
      {children}
    </button>
  );
}

function Badge({ children, variant = 'primary' }: { children: ReactNode; variant?: 'primary' | 'gray' }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium"
      style={{
        borderRadius: 'var(--radius-full)',
        background: `var(--color-badges-${variant}-background)`,
        color: `var(--color-badges-${variant}-text)`,
      }}
    >
      {children}
    </span>
  );
}

function BrandTile({ payee, size = 'small' }: { payee: GiftcardPayee; size?: 'small' | 'large' }) {
  const h = size === 'large' ? 'h-36' : 'h-20';
  const fs = size === 'large' ? 28 : 17;
  return (
    <div className={`${h} w-full flex items-center justify-center`} style={{ background: payee.brandColor, borderRadius: 'var(--radius-lg)' }}>
      {payee.logoSrc ? (
        <img src={payee.logoSrc} alt={payee.name} className={size === 'large' ? 'h-12' : 'h-7'} />
      ) : (
        <span style={{ color: payee.brandText, fontWeight: 700, fontSize: fs, letterSpacing: '-0.02em', fontFamily: 'var(--font-family-sans)' }}>
          {payee.name}
        </span>
      )}
    </div>
  );
}

/* ─── Pantallas ───────────────────────────────────────────── */
function ScreenCatalog({ dispatch }: { dispatch: Dispatch<Action> }) {
  return (
    <div className="p-5">
      <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-title)' }}>Tarjetas de regalo</h2>
      <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary-text)' }}>
        Elige una marca y recibe tu código al instante.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {CATALOG.map((p) => {
          const sub =
            p.amount.type === 'FIXED'
              ? `Desde ${formatMXN(Number(p.amount.denominations[0]))}`
              : `${formatMXN(Number(p.amount.min))} – ${formatMXN(Number(p.amount.max))}`;
          return (
            <button
              key={p.payee_id}
              onClick={() => dispatch({ type: 'SELECT_PAYEE', payee: p })}
              className="text-left p-3 transition-shadow hover:shadow-md"
              style={{ background: 'var(--color-card-background)', border: `1px solid ${BORDER}`, borderRadius: 'var(--radius-xl)' }}
            >
              <BrandTile payee={p} />
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-title)' }}>{p.name}</span>
                <Badge variant="gray">EGift</Badge>
              </div>
              <span className="text-xs" style={{ color: 'var(--color-text-secondary-text)' }}>{sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScreenDetail({ state, dispatch }: { state: State; dispatch: Dispatch<Action> }) {
  const payee = state.payee!;
  const [rangeInput, setRangeInput] = useState(state.amountPesos != null ? String(state.amountPesos) : '');
  const [termsOpen, setTermsOpen] = useState(false);

  const isRange = payee.amount.type === 'RANGE';
  const min = isRange ? Number(payee.amount.min) : 0;
  const max = isRange ? Number(payee.amount.max) : 0;
  const rangeError = useMemo(() => {
    if (!isRange || rangeInput === '') return null;
    const v = Number(rangeInput);
    if (Number.isNaN(v)) return 'Ingresa un monto válido';
    if (v < min) return `El monto mínimo es ${formatMXN(min)}`;
    if (v > max) return `El monto máximo es ${formatMXN(max)}`;
    return null;
  }, [isRange, rangeInput, min, max]);

  const canContinue = state.amountPesos != null && state.termsAccepted && !rangeError;

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 flex-1 overflow-y-auto">
        <BrandTile payee={payee} size="large" />
        <div className="mt-4 flex items-center gap-2">
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-title)' }}>{payee.name}</h2>
          <Badge>EGift</Badge>
        </div>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-body)' }}>{payee.description}</p>

        <p className="text-sm font-semibold mt-5 mb-2" style={{ color: 'var(--color-text-title)' }}>
          {isRange ? 'Ingresa el monto' : 'Elige el monto'}
        </p>

        {payee.amount.type === 'FIXED' ? (
          <div className="grid grid-cols-2 gap-2">
            {payee.amount.denominations.map((d) => {
              const pesos = Number(d);
              const active = state.amountPesos === pesos;
              return (
                <button
                  key={d}
                  onClick={() => dispatch({ type: 'SET_AMOUNT', pesos })}
                  className="h-11 text-sm font-medium transition-colors"
                  style={{
                    borderRadius: 'var(--radius-default)',
                    border: `1px solid ${active ? 'var(--primitive-skyblue-500)' : BORDER}`,
                    background: active ? 'var(--primitive-skyblue-50)' : 'var(--color-card-background)',
                    color: active ? 'var(--color-text-brand)' : 'var(--color-text-body)',
                  }}
                >
                  {formatMXN(pesos)}
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <div
              className="flex items-center h-12 px-3 gap-1"
              style={{
                borderRadius: 'var(--radius-default)',
                border: `1px solid ${rangeError ? 'var(--color-input-error-focus-border)' : BORDER}`,
                background: 'var(--color-input-background)',
              }}
            >
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary-text)' }}>$</span>
              <input
                inputMode="decimal"
                value={rangeInput}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.]/g, '');
                  setRangeInput(v);
                  const n = Number(v);
                  dispatch({ type: 'SET_AMOUNT', pesos: v !== '' && !Number.isNaN(n) && n >= min && n <= max ? n : null });
                }}
                placeholder="0"
                className="flex-1 text-sm outline-none border-none ring-0 bg-transparent"
                style={{ color: 'var(--color-text-title)', fontFamily: 'var(--font-family-sans)' }}
              />
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary-text)' }}>MXN</span>
            </div>
            <p className="text-xs mt-1.5" style={{ color: rangeError ? 'var(--color-input-error)' : 'var(--color-text-tertiary-text)' }}>
              {rangeError ?? `Entre ${formatMXN(min)} y ${formatMXN(max)}`}
            </p>
          </div>
        )}

        {/* T&C */}
        <div className="mt-5" style={{ border: `1px solid ${BORDER}`, borderRadius: 'var(--radius-lg)' }}>
          <button onClick={() => setTermsOpen(!termsOpen)} className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium" style={{ color: 'var(--color-text-body)' }}>
            Términos y condiciones
            <Icon.Chevron open={termsOpen} />
          </button>
          <AnimatePresence>
            {termsOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <p className="px-3 pb-3 text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary-text)' }}>
                  {payee.terms_and_conditions}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <label className="flex items-start gap-2.5 mt-3 cursor-pointer">
          <input
            type="checkbox"
            checked={state.termsAccepted}
            onChange={() => dispatch({ type: 'TOGGLE_TERMS' })}
            className="mt-0.5 h-4 w-4 accent-[var(--primitive-skyblue-500)]"
          />
          <span className="text-xs" style={{ color: 'var(--color-text-body)' }}>
            Acepto los términos y condiciones de la tarjeta de regalo.
          </span>
        </label>
      </div>

      <div className="p-4 flex gap-3" style={{ borderTop: `1px solid ${BORDER}` }}>
        <OutlineButton onClick={() => dispatch({ type: 'BACK' })}><Icon.Back /> Atrás</OutlineButton>
        <PrimaryButton disabled={!canContinue} onClick={() => dispatch({ type: 'TO_CONFIRM' })}>Continuar</PrimaryButton>
      </div>
    </div>
  );
}

function ScreenConfirm({ state, dispatch, scenario }: { state: State; dispatch: Dispatch<Action>; scenario: SimScenario }) {
  const payee = state.payee!;
  const pesos = state.amountPesos!;

  const submit = () => {
    const txid = uuidv4();
    dispatch({ type: 'SUBMIT', transactionId: txid });
    simulateRedeem(payee, Math.round(pesos * 100), txid, scenario)
      .then((result) => dispatch({ type: 'SUCCESS', result }))
      .catch((error: RedeemError) => dispatch({ type: 'FAIL', error }));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 flex-1">
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-title)' }}>Confirma tu compra</h2>

        <div className="p-4" style={{ background: 'var(--color-card-card-bg)', borderRadius: 'var(--radius-xl)', border: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-3">
            <div className="w-14 shrink-0"><BrandTile payee={payee} /></div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-title)' }}>Giftcard {payee.name}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary-text)' }}>Entrega digital inmediata</p>
            </div>
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: `1px solid ${BORDER}` }}>
            <span className="text-sm" style={{ color: 'var(--color-text-body)' }}>Total a pagar</span>
            <span className="text-xl font-bold" style={{ color: 'var(--color-text-title)' }}>{formatMXN(pesos)}</span>
          </div>
        </div>

        <div className="mt-4 flex gap-3 p-3" style={{ background: 'var(--color-alerts-warning-background)', border: '1px solid var(--color-alerts-warning-border)', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ color: 'var(--color-alerts-warning-title)' }}><Icon.Alert /></span>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-alerts-warning-description)' }}>
            La compra es <strong>inmediata e irreversible</strong>. El código se genera al confirmar y no admite cancelación ni reembolso.
          </p>
        </div>
      </div>

      <div className="p-4 flex gap-3" style={{ borderTop: `1px solid ${BORDER}` }}>
        <OutlineButton onClick={() => dispatch({ type: 'BACK' })}><Icon.Back /> Atrás</OutlineButton>
        <PrimaryButton onClick={submit}>Confirmar compra</PrimaryButton>
      </div>
    </div>
  );
}

function ScreenProcessing() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-5">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
        className="w-10 h-10 rounded-full"
        style={{ border: `3px solid ${BORDER}`, borderTopColor: 'var(--primitive-skyblue-500)' }}
      />
      <p className="text-sm font-medium" style={{ color: 'var(--color-text-body)' }}>Generando tu código…</p>
      <p className="text-xs" style={{ color: 'var(--color-text-tertiary-text)' }}>No cierres esta pantalla</p>
    </div>
  );
}

function ScreenSuccess({ state, dispatch }: { state: State; dispatch: Dispatch<Action> }) {
  const r = state.result!;
  const payee = state.payee!;
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(r.redemption_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 flex-1 overflow-y-auto">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--color-status-success-light-background)', color: 'var(--color-status-success-light-text)' }}>
            <Icon.Check />
          </div>
          <h2 className="text-lg font-bold mt-3" style={{ color: 'var(--color-text-title)' }}>¡Compra exitosa!</h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary-text)' }}>
            Giftcard {payee.name} · {formatMXN(r.amount / 100)}
          </p>
        </div>

        <div className="mt-5 p-4 text-center" style={{ background: 'var(--color-card-card-bg)', border: `1px dashed var(--primitive-skyblue-300)`, borderRadius: 'var(--radius-xl)' }}>
          <p className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: 'var(--color-text-tertiary-text)' }}>Código de canje</p>
          <p className="mt-1 text-base font-bold font-mono tracking-wide" style={{ color: 'var(--color-text-title)' }}>{r.redemption_code}</p>
          {r.pin && (
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-body)' }}>PIN: <span className="font-mono font-semibold">{r.pin}</span></p>
          )}
          <button onClick={copy} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5" style={{ borderRadius: 'var(--radius-default)', border: `1px solid ${BORDER}`, color: 'var(--color-text-brand)', background: 'var(--color-card-background)' }}>
            <Icon.Copy /> {copied ? 'Copiado' : 'Copiar código'}
          </button>
        </div>

        <div className="mt-4 text-xs space-y-2" style={{ color: 'var(--color-text-secondary-text)' }}>
          {r.expiry_date && <p>Vigencia: hasta el {new Date(r.expiry_date + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
          <p>{payee.redemption_info}</p>
          <a href={r.check_balance_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium" style={{ color: 'var(--color-text-brand)' }}>
            Consultar saldo <Icon.External />
          </a>
          <p style={{ color: 'var(--color-text-tertiary-text)' }}>Folio: {r.transaction_id}</p>
        </div>
      </div>

      <div className="p-4" style={{ borderTop: `1px solid ${BORDER}` }}>
        <PrimaryButton onClick={() => dispatch({ type: 'RESET' })}>Comprar otra giftcard</PrimaryButton>
      </div>
    </div>
  );
}

function ScreenError({ state, dispatch }: { state: State; dispatch: Dispatch<Action> }) {
  const e = state.error!;
  const isTimeout = e.http === 'timeout';
  return (
    <div className="flex flex-col h-full">
      <div className="p-5 flex-1">
        <div className="flex gap-3 p-4" style={{ background: 'var(--color-alerts-danger-background)', border: '1px solid var(--color-alerts-danger-border)', borderRadius: 'var(--radius-xl)' }}>
          <span style={{ color: 'var(--color-alerts-danger-title)' }}><Icon.Alert /></span>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-alerts-danger-title)' }}>{e.title}</p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-alerts-danger-description)' }}>{e.detail}</p>
            <p className="text-xs mt-2 font-medium" style={{ color: 'var(--color-alerts-danger-description)' }}>{e.action}</p>
            <p className="text-[11px] mt-2" style={{ color: 'var(--color-text-tertiary-text)' }}>
              {isTimeout ? 'Sin respuesta' : `HTTP ${e.http}`} · Folio: {state.transactionId}
            </p>
          </div>
        </div>
      </div>
      <div className="p-4 flex gap-3" style={{ borderTop: `1px solid ${BORDER}` }}>
        <OutlineButton onClick={() => dispatch({ type: 'RESET' })}>Inicio</OutlineButton>
        {!isTimeout && e.http !== 409 && (
          <PrimaryButton onClick={() => dispatch({ type: 'BACK' })}>Intentar de nuevo</PrimaryButton>
        )}
      </div>
    </div>
  );
}

/* ─── Mac window + entry card ─────────────────────────────── */
function MacWindow({ children, scenario, setScenario }: { children: ReactNode; scenario: SimScenario; setScenario: (s: SimScenario) => void }) {
  const scenarios: SimScenario[] = ['200', '400', '409', '503', 'timeout'];
  return (
    <div className="w-full max-w-5xl mx-auto shadow-2xl overflow-hidden" style={{ borderRadius: 'var(--radius-xl)', border: `1px solid ${BORDER}`, background: 'var(--color-background-white-primary)' }}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 h-10" style={{ borderBottom: `1px solid ${BORDER}`, background: 'var(--color-background-gray-primary)' }}>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary-text)' }}>BillPay · Giftcards B2C</span>
        {/* Dev: simulador de response del POST */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] mr-1" style={{ color: 'var(--color-text-tertiary-text)' }}>API:</span>
          {scenarios.map((s) => (
            <button
              key={s}
              onClick={() => setScenario(s)}
              className="text-[10px] px-1.5 py-0.5 font-medium"
              style={{
                borderRadius: 'var(--radius-sm)',
                background: scenario === s ? 'var(--primitive-skyblue-50)' : 'transparent',
                color: scenario === s ? 'var(--color-text-brand)' : 'var(--color-text-tertiary-text)',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-center py-8 px-4" style={{ background: 'var(--color-background-gray-secondary)' }}>
        {/* Frame móvil del consumidor */}
        <div className="w-[380px] h-[680px] flex flex-col overflow-hidden shadow-lg" style={{ background: 'var(--color-background-white-primary)', borderRadius: 'var(--radius-3xl)', border: `1px solid ${BORDER}` }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Giftcards() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [scenario, setScenario] = useState<SimScenario>('200');

  const screens: Record<Step, ReactNode> = {
    catalog: <ScreenCatalog dispatch={dispatch} />,
    detail: state.payee ? <ScreenDetail key={state.payee.payee_id} state={state} dispatch={dispatch} /> : null,
    confirm: <ScreenConfirm state={state} dispatch={dispatch} scenario={scenario} />,
    processing: <ScreenProcessing />,
    success: <ScreenSuccess state={state} dispatch={dispatch} />,
    error: <ScreenError state={state} dispatch={dispatch} />,
  };

  return (
    <div style={{ fontFamily: 'var(--font-family-sans)' }}>
      <MacWindow scenario={scenario} setScenario={setScenario}>
        <AnimatePresence mode="wait">
          <motion.div
            key={state.step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            {screens[state.step]}
          </motion.div>
        </AnimatePresence>
      </MacWindow>
    </div>
  );
}
