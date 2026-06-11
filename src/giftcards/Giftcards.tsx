// ─────────────────────────────────────────────────────────────────────────────
// Giftcards v2.0 — Flujo B2C sobre el shell de CrossBorder (Mac window + sidebar)
// Pasos: Selecciona marca → Monto → Confirmación → Resultado
// Contenido: mockup Finch adaptado a Monato DS · Logos vía Clearbit con fallback
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useReducer, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Doller, UserMultiple4, ChevronDown,
  ArrowRight, Check, CheckCircle1, RefreshCircle1Clockwise,
  QuestionMarkCircle, Layers2,
  Bell1, Gear1,
} from '@tailgrids/icons';

import LogoDefault from '../assets/logo-default.png';
import { Button } from '../components/core/button';
import { Badge } from '../components/core/badge';
import { DefaultSpinner } from '../components/core/spinner/default';

import {
  BRANDS, CATS, REDEEM_STEPS, BHN_TERMS, ANTIFRAUD_NOTICE,
  simulateRedeem, uuidv4, formatMXN,
} from './data';
import type { Brand, CategoryId, SimScenario, RedeemResult, RedeemFailure } from './data';

// ─── Brand logo — Clearbit con fallback a bloque de color ────────────────────
function BrandLogo({ brand, size = 48 }: { brand: Brand; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className="rounded-lg flex items-center justify-center text-white font-bold shrink-0"
        style={{ width: size, height: size, background: brand.color, fontSize: size * 0.3 }}
      >
        {brand.abbr}
      </div>
    );
  }
  return (
    <img
      src={`https://logo.clearbit.com/${brand.domain}`}
      alt={brand.name}
      className="rounded-lg object-contain shrink-0 bg-white"
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
}

// ─── Stepper — mismo patrón que CrossBorder ───────────────────────────────────
type Step = 1 | 2 | 3 | 4;
const STEPS = [
  { id: 1 as Step, label: 'Selecciona marca' },
  { id: 2 as Step, label: 'Monto' },
  { id: 3 as Step, label: 'Confirmación' },
  { id: 4 as Step, label: 'Resultado' },
];

function Stepper({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-4">
      {STEPS.map((step, i) => {
        const isActive    = step.id === current;
        const isCompleted = step.id < current;
        return (
          <div key={step.id} className="flex items-center gap-2">
            <div className={`size-6 rounded-full flex items-center justify-center text-sm transition-all ${
              isActive || isCompleted
                ? 'bg-primary-500 text-white font-medium'
                : 'border border-base-100 text-text-100 font-medium'
            }`}>
              {isCompleted ? <Check size={11} className="text-white" /> : step.id}
            </div>
            <span className={`text-sm tracking-tight transition-colors ${
              isActive    ? 'font-bold text-[#486581]' :
              isCompleted ? 'font-medium text-title-50' :
                            'font-normal text-[#486581]'
            }`}>{step.label}</span>
            {i < STEPS.length - 1 && <ArrowRight size={16} className="text-text-200 ml-2" />}
          </div>
        );
      })}
    </div>
  );
}

// ─── State machine ────────────────────────────────────────────────────────────
type FlowState = {
  step: Step;
  brand: Brand | null;
  amount: number | null;     // pesos
  customActive: boolean;     // denomType 'open': input libre visible
  termsAccepted: boolean;
  processing: boolean;
  result: RedeemResult | null;
  failure: RedeemFailure | null;
  transactionId: string | null;
};

type FlowAction =
  | { type: 'selectBrand'; brand: Brand }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'setAmount'; amount: number | null }
  | { type: 'setCustomActive'; active: boolean }
  | { type: 'toggleTerms' }
  | { type: 'submit'; transactionId: string }
  | { type: 'success'; result: RedeemResult }
  | { type: 'failure'; failure: RedeemFailure }
  | { type: 'retry' }
  | { type: 'reset' };

const initialState: FlowState = {
  step: 1, brand: null, amount: null, customActive: false,
  termsAccepted: false, processing: false, result: null, failure: null, transactionId: null,
};

function reducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'selectBrand':     return { ...state, brand: action.brand, amount: null, customActive: false, termsAccepted: false };
    case 'next':            return { ...state, step: Math.min(4, state.step + 1) as Step };
    case 'back':            return { ...state, step: Math.max(1, state.step - 1) as Step, failure: null };
    case 'setAmount':       return { ...state, amount: action.amount };
    case 'setCustomActive': return { ...state, customActive: action.active, amount: null };
    case 'toggleTerms':     return { ...state, termsAccepted: !state.termsAccepted };
    case 'submit':          return { ...state, processing: true, failure: null, transactionId: action.transactionId };
    case 'success':         return { ...state, processing: false, result: action.result, failure: null, step: 4 };
    case 'failure':         return { ...state, processing: false, failure: action.failure, result: null, step: 4 };
    case 'retry':           return { ...state, step: 3, failure: null, result: null };
    case 'reset':           return initialState;
    default:                return state;
  }
}

// ─── Paso 1 — Selecciona marca ───────────────────────────────────────────────
function BrandsScreen({ state, dispatch }: { state: FlowState; dispatch: React.Dispatch<FlowAction> }) {
  const [filter, setFilter] = useState<CategoryId>('all');
  const [query, setQuery]   = useState('');

  const filtered = useMemo(
    () => BRANDS.filter(b =>
      (filter === 'all' || b.cat === filter) &&
      b.name.toLowerCase().includes(query.toLowerCase()),
    ),
    [filter, query],
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Filtros + búsqueda */}
          <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
            <div className="flex items-center gap-2 flex-wrap">
              {CATS.map(c => {
                const count  = c.id === 'all' ? BRANDS.length : BRANDS.filter(b => b.cat === c.id).length;
                const active = filter === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setFilter(c.id)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary-500 text-white'
                        : 'bg-white border border-[#d9e2ec] text-[#334e68] hover:bg-[#f8fafc]'
                    }`}
                  >
                    {c.label} <span className={active ? 'text-white/70' : 'text-[#829ab1]'}>{count}</span>
                  </button>
                );
              })}
            </div>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar marca..."
              className="w-56 px-4 py-2 rounded-lg bg-white text-sm text-[#334e68] placeholder-[#9fb3c8] outline-none ring-0"
              style={{ border: '1px solid #d9e2ec' }}
            />
          </div>

          {/* Grid de marcas */}
          {filtered.length === 0 ? (
            <p className="text-text-100 text-sm py-12 text-center">No se encontraron marcas.</p>
          ) : (
            <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
              {filtered.map(b => {
                const selected = state.brand?.id === b.id;
                const tag = b.denomType === 'open' ? 'Abierto' : b.denomType === 'variable' ? 'Variable' : null;
                return (
                  <button
                    key={b.id}
                    onClick={() => dispatch({ type: 'selectBrand', brand: b })}
                    className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xl bg-white transition-all text-center ${
                      selected
                        ? 'border-2 border-primary-500 shadow-md'
                        : 'border border-[#d9e2ec] hover:border-primary-300 hover:shadow-sm'
                    }`}
                  >
                    {tag && (
                      <span className="absolute top-2 right-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#e6f4fa] text-primary-500">{tag}</span>
                    )}
                    {selected && (
                      <span className="absolute top-2 left-2 size-5 rounded-full bg-primary-500 flex items-center justify-center">
                        <Check size={11} className="text-white" />
                      </span>
                    )}
                    <BrandLogo brand={b} size={48} />
                    <span className="text-[#334e68] text-sm font-medium leading-tight">{b.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-[#f8fafc] px-8 py-4 shrink-0 flex items-center justify-between">
        <span className="text-[#829ab1] text-sm">{filtered.length} marcas disponibles</span>
        <Button disabled={!state.brand} onClick={() => dispatch({ type: 'next' })}>Continuar</Button>
      </div>
    </div>
  );
}

// ─── Paso 2 — Monto ───────────────────────────────────────────────────────────
function AmountScreen({ state, dispatch }: { state: FlowState; dispatch: React.Dispatch<FlowAction> }) {
  const brand = state.brand!;
  const [input, setInput] = useState(state.amount != null && state.customActive ? String(state.amount) : '');

  const isVariable = brand.denomType === 'variable';
  const isOpen     = brand.denomType === 'open';
  const showInput  = isVariable || (isOpen && state.customActive);
  const min = brand.min ?? 0;
  const max = brand.max ?? 0;

  const inputError = useMemo(() => {
    if (!showInput || input === '') return null;
    const v = Number(input);
    if (Number.isNaN(v)) return 'Ingresa un monto válido';
    if (v < min) return `El monto mínimo es ${formatMXN(min)}`;
    if (v > max) return `El monto máximo es ${formatMXN(max)}`;
    return null;
  }, [showInput, input, min, max]);

  const canContinue = state.amount != null && !inputError;

  const handleInput = (raw: string) => {
    const v = raw.replace(/[^0-9.]/g, '');
    setInput(v);
    const n = Number(v);
    dispatch({ type: 'setAmount', amount: v !== '' && !Number.isNaN(n) && n >= min && n <= max ? n : null });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-xl mx-auto">
          {/* Header de marca */}
          <div className="flex items-center gap-4 rounded-xl border border-[#d9e2ec] bg-white p-4 mb-6">
            <BrandLogo brand={brand} size={56} />
            <div>
              <p className="text-title-50 text-lg font-semibold">{brand.name}</p>
              <p className="text-[#829ab1] text-sm">
                {brand.denomType === 'fixed'
                  ? 'Montos predefinidos'
                  : brand.denomType === 'variable'
                  ? `Monto libre · ${formatMXN(min)} – ${formatMXN(max)}`
                  : `Montos sugeridos o monto libre · ${formatMXN(min)} – ${formatMXN(max)}`}
              </p>
            </div>
          </div>

          <p className="text-[#334e68] text-sm font-medium mb-3">
            Monto a pagar <span className="text-red-500">*</span>
          </p>

          {/* Chips de denominaciones (fixed / open) */}
          {brand.amounts && (
            <div className="flex flex-wrap gap-2 mb-4">
              {brand.amounts.map(a => {
                const active = !state.customActive && state.amount === a;
                return (
                  <button
                    key={a}
                    onClick={() => { dispatch({ type: 'setCustomActive', active: false }); dispatch({ type: 'setAmount', amount: a }); setInput(''); }}
                    className={`px-5 py-2.5 rounded-lg text-base font-medium transition-colors ${
                      active
                        ? 'bg-[#e6f4fa] border-2 border-primary-500 text-primary-500'
                        : 'bg-white border border-[#d9e2ec] text-[#334e68] hover:bg-[#f8fafc]'
                    }`}
                  >
                    {formatMXN(a)}
                  </button>
                );
              })}
              {isOpen && (
                <button
                  onClick={() => dispatch({ type: 'setCustomActive', active: !state.customActive })}
                  className={`px-5 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    state.customActive
                      ? 'bg-[#e6f4fa] border-2 border-primary-500 text-primary-500'
                      : 'bg-white border border-dashed border-[#9fb3c8] text-[#486581] hover:bg-[#f8fafc]'
                  }`}
                >
                  Monto libre
                </button>
              )}
            </div>
          )}

          {/* Input libre (variable / open con monto libre) */}
          <AnimatePresence>
            {showInput && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div
                  className="flex items-center gap-2 rounded-lg bg-white px-4 py-3"
                  style={{ border: `1px solid ${inputError ? '#fb3748' : '#d9e2ec'}` }}
                >
                  <span className="text-[#829ab1] text-base font-medium">$</span>
                  <input
                    inputMode="decimal"
                    value={input}
                    onChange={e => handleInput(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 text-base text-[#334e68] outline-none border-none ring-0 bg-transparent"
                  />
                  <span className="text-[#9fb3c8] text-sm">MXN</span>
                </div>
                <p className={`text-xs mt-1.5 ${inputError ? 'text-red-500' : 'text-[#829ab1]'}`}>
                  {inputError ?? `Entre ${formatMXN(min)} y ${formatMXN(max)}`}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-[#f8fafc] px-8 py-4 shrink-0 flex items-center justify-between">
        <button onClick={() => dispatch({ type: 'back' })} className="px-5 py-3 rounded-lg border border-[#d9e2ec] bg-white text-base font-medium text-[#334e68] hover:bg-[#f8fafc] transition">Regresar</button>
        <Button disabled={!canContinue} onClick={() => dispatch({ type: 'next' })}>Continuar</Button>
      </div>
    </div>
  );
}

// ─── Paso 3 — Confirmación ────────────────────────────────────────────────────
function ConfirmScreen({ state, dispatch, scenario }: { state: FlowState; dispatch: React.Dispatch<FlowAction>; scenario: SimScenario }) {
  const brand  = state.brand!;
  const amount = state.amount!;

  const confirm = () => {
    const txid = uuidv4();
    dispatch({ type: 'submit', transactionId: txid });
    simulateRedeem(brand, amount, scenario)
      .then(result => dispatch({ type: 'success', result }))
      .catch((failure: RedeemFailure) => dispatch({ type: 'failure', failure }));
  };

  if (state.processing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <DefaultSpinner />
        <p className="text-[#334e68] text-base font-medium">Procesando tu Gift Card…</p>
        <p className="text-[#829ab1] text-sm">No cierres esta ventana</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-xl mx-auto space-y-5">
          {/* Resumen */}
          <div className="rounded-xl border border-[#d9e2ec] bg-white p-5">
            <p className="text-title-50 text-base font-semibold mb-4">Resumen de tu compra</p>
            <div className="flex items-center justify-between py-2.5 border-b border-[#f8fafc]">
              <span className="text-[#829ab1] text-sm">Gift Card</span>
              <span className="flex items-center gap-2 text-[#334e68] text-sm font-medium">
                <BrandLogo brand={brand} size={24} /> {brand.name}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-[#829ab1] text-sm">Monto</span>
              <span className="text-title-50 text-xl font-bold">{formatMXN(amount)}</span>
            </div>
          </div>

          {/* Aviso antifraude — patrón de alerta amarilla de CrossBorder */}
          <div className="flex gap-2.5 rounded-xl border border-yellow-200 bg-yellow-50 px-3.5 py-3">
            <div className="size-6 rounded-lg bg-yellow-400 flex items-center justify-center shrink-0 mt-0.5">
              <QuestionMarkCircle size={13} className="text-white" />
            </div>
            <p className="text-yellow-800 text-xs leading-relaxed">
              <span className="font-semibold">Aviso de seguridad:</span> {ANTIFRAUD_NOTICE}
            </p>
          </div>

          {/* T&C BHN */}
          <div className="rounded-xl border border-[#d9e2ec] bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-[#f8fafc]">
              <p className="text-[#334e68] text-sm font-semibold">Términos y condiciones — Gift Card {brand.name}</p>
            </div>
            <div className="px-4 py-3 max-h-44 overflow-y-auto space-y-2.5">
              <p className="text-[#486581] text-xs leading-relaxed">
                Esta Gift Card es emitida por el proveedor de la marca correspondiente y distribuida por Blackhawk Network (BHN). Al adquirirla aceptas las siguientes condiciones:
              </p>
              {BHN_TERMS.map(t => (
                <p key={t.title} className="text-[#486581] text-xs leading-relaxed">
                  <span className="font-semibold text-[#334e68]">{t.title}</span> {t.body}
                </p>
              ))}
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={state.termsAccepted}
              onChange={() => dispatch({ type: 'toggleTerms' })}
              className="mt-0.5 size-4 accent-[#0894c8]"
            />
            <span className="text-[#334e68] text-sm">
              He leído y acepto los <span className="text-primary-500 font-medium">Términos y Condiciones</span> de esta Gift Card
            </span>
          </label>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-[#f8fafc] px-8 py-4 shrink-0 flex items-center justify-between">
        <button onClick={() => dispatch({ type: 'back' })} className="px-5 py-3 rounded-lg border border-[#d9e2ec] bg-white text-base font-medium text-[#334e68] hover:bg-[#f8fafc] transition">Regresar</button>
        <Button disabled={!state.termsAccepted} onClick={confirm}>Confirmar pago</Button>
      </div>
    </div>
  );
}

// ─── Paso 4 — Resultado ───────────────────────────────────────────────────────
function ResultScreen({ state, dispatch, onExit, onRedeem }: { state: FlowState; dispatch: React.Dispatch<FlowAction>; onExit: () => void; onRedeem: () => void }) {
  const brand = state.brand!;
  const [copied, setCopied]         = useState(false);
  const [stepsOpen, setStepsOpen]   = useState(false);

  // ── Error ──
  if (state.failure) {
    const f = state.failure;
    const canRetry = f.code === 'BHN-ERR-400' || f.code === 'BHN-ERR-503';
    return (
      <div className="flex-1 overflow-y-auto px-8 py-10">
        <div className="max-w-xl mx-auto text-center">
          <div className="size-14 rounded-full bg-red-50 border border-red-200 mx-auto flex items-center justify-center">
            <span className="text-red-500 text-2xl font-bold leading-none">✕</span>
          </div>
          <h2 className="text-title-50 text-xl font-semibold mt-4">No se pudo procesar</h2>
          <p className="text-[#486581] text-sm mt-1">{f.detail}</p>

          <div className="rounded-xl border border-[#d9e2ec] bg-white p-5 mt-6 text-left">
            <div className="flex items-center justify-between py-2 border-b border-[#f8fafc]">
              <span className="text-[#829ab1] text-sm">Código de error</span>
              <span className="text-[#334e68] text-sm font-mono font-medium">{f.code}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#f8fafc]">
              <span className="text-[#829ab1] text-sm">ID de transacción</span>
              <span className="text-[#334e68] text-sm font-mono">{state.transactionId?.slice(0, 18)}…</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[#829ab1] text-sm">Fecha</span>
              <span className="text-[#334e68] text-sm">{new Date().toLocaleString('es-MX')}</span>
            </div>
          </div>

          <p className="text-[#829ab1] text-xs mt-4">
            No se realizó ningún cargo a tu cuenta. {f.action}
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            {canRetry && (
              <Button onClick={() => dispatch({ type: 'retry' })}>
                <RefreshCircle1Clockwise size={14} className="text-white" />
                Reintentar
              </Button>
            )}
            <button onClick={() => dispatch({ type: 'reset' })} className="px-5 py-3 rounded-lg border border-[#d9e2ec] bg-white text-base font-medium text-[#334e68] hover:bg-[#f8fafc] transition">Nueva compra</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Éxito ──
  const r = state.result!;
  const steps = REDEEM_STEPS[brand.id] ?? REDEEM_STEPS._default;
  const copy = () => {
    navigator.clipboard?.writeText(r.transaction_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      <div className="max-w-xl mx-auto">
        <div className="text-center">
          <div className="size-14 rounded-full bg-green-50 border border-green-200 mx-auto flex items-center justify-center">
            <CheckCircle1 size={28} className="text-green-600" />
          </div>
          <h2 className="text-title-50 text-xl font-semibold mt-4">¡Gift Card procesada!</h2>
          <p className="text-[#486581] text-sm mt-1">Tu Gift Card está lista para usarse.</p>
        </div>

        {/* Detalle */}
        <div className="rounded-xl border border-[#d9e2ec] bg-white p-5 mt-6">
          <div className="flex items-center justify-between py-2 border-b border-[#f8fafc]">
            <span className="text-[#829ab1] text-sm">Marca</span>
            <span className="flex items-center gap-2 text-[#334e68] text-sm font-medium">
              <BrandLogo brand={brand} size={22} /> {brand.name}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#f8fafc]">
            <span className="text-[#829ab1] text-sm">Monto</span>
            <span className="text-[#334e68] text-sm font-semibold">{formatMXN(r.amount)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#f8fafc]">
            <span className="text-[#829ab1] text-sm">ID de transacción</span>
            <span className="flex items-center gap-2">
              <span className="text-[#334e68] text-sm font-mono">{r.transaction_id}</span>
              <button onClick={copy} className="text-primary-500 text-xs font-medium hover:underline">
                {copied ? 'Copiado ✓' : 'Copiar'}
              </button>
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#f8fafc]">
            <span className="text-[#829ab1] text-sm">Fecha</span>
            <span className="text-[#334e68] text-sm">{r.date.toLocaleString('es-MX')}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-[#829ab1] text-sm">Estado</span>
            <Badge color="success" size="sm">Procesado</Badge>
          </div>
        </div>

        {/* Código de canje — enmascarado: el código completo solo se revela en el portal BHN */}
        <div className="rounded-xl border-2 border-dashed border-primary-300 bg-[#e6f4fa]/40 p-5 mt-4 text-center">
          <p className="text-[#829ab1] text-xs uppercase tracking-wider font-semibold">Código de canje</p>
          <p className="text-title-50 text-lg font-bold font-mono tracking-[0.2em] mt-1">
            •••• •••• •••• {r.redemption_code.slice(-4)}
          </p>
          <p className="text-[#486581] text-xs mt-2">Por tu seguridad, el código completo se muestra únicamente en el portal de canje de BHN.</p>
        </div>

        {/* Cómo canjear */}
        <div className="rounded-xl border border-[#d9e2ec] bg-white overflow-hidden mt-4">
          <button onClick={() => setStepsOpen(o => !o)} className="w-full px-4 py-3 flex items-center justify-between text-[#334e68] text-sm font-semibold hover:bg-[#f8fafc] transition">
            Cómo canjear tu Gift Card
            <ChevronDown size={16} className={`text-[#829ab1] transition-transform ${stepsOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {stepsOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <ol className="px-4 pb-4 space-y-2">
                  {steps.map((s, i) => (
                    <li key={i} className="flex gap-3 text-[#486581] text-sm leading-relaxed">
                      <span className="size-5 rounded-full bg-[#e6f4fa] text-primary-500 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Acciones */}
        <div className="mt-6 space-y-3">
          <button
            onClick={onRedeem}
            className="w-full py-3 rounded-lg text-base font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors"
          >
            Canjear Gift Card
          </button>
          <p className="text-[#829ab1] text-xs text-center -mt-1">Se abrirá el portal de canje de Blackhawk Network (BHN)</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => dispatch({ type: 'reset' })} className="px-5 py-3 rounded-lg border border-[#d9e2ec] bg-white text-base font-medium text-[#334e68] hover:bg-[#f8fafc] transition">Nueva Gift Card</button>
            <button onClick={onExit} className="px-5 py-3 rounded-lg text-base font-medium text-[#829ab1] hover:text-[#334e68] transition">Salir</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Portal de canje BHN — "Activation Spot" simulado ────────────────────────
// Réplica del patrón productivo: el partner nunca muestra el código completo;
// el cliente abre la eGift URL y BHN renderiza la experiencia de canje.
function RedeemPortal({ brand, result, onBack }: { brand: Brand; result: RedeemResult; onBack: () => void }) {
  const [loading, setLoading]   = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied]     = useState(false);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 1100); return () => clearTimeout(t); }, []);

  const copy = () => {
    navigator.clipboard?.writeText(result.redemption_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f0f4f8]">
      {/* Barra de navegador simulada */}
      <div className="bg-white border-b border-[#d9e2ec] px-4 py-2.5 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[#334e68] text-sm font-medium hover:text-primary-500 transition">
          <ArrowRight size={16} className="rotate-180" />
          Volver a BillPay
        </button>
        <div className="flex-1 flex items-center gap-2 bg-[#f0f4f8] rounded-lg px-3 py-1.5">
          <span className="size-3.5 rounded-full bg-green-500/20 border border-green-500 shrink-0" title="Conexión segura" />
          <span className="text-[#486581] text-xs font-mono truncate">{result.egift_url}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <DefaultSpinner />
          <p className="text-[#829ab1] text-sm">Conectando con Blackhawk Network…</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Header BHN */}
          <div className="bg-[#1a2231] px-6 py-3 flex items-center justify-between">
            <span className="text-white text-sm font-bold tracking-wide">BHN <span className="font-normal text-white/60">| eGift</span></span>
            <span className="text-white/40 text-xs">Powered by Blackhawk Network</span>
          </div>

          <div className="max-w-md mx-auto px-6 py-8">
            {/* Tarjeta de la marca */}
            <div className="rounded-2xl overflow-hidden shadow-lg border border-[#d9e2ec] bg-white">
              <div className="h-36 flex items-center justify-center" style={{ background: brand.color }}>
                <div className="bg-white rounded-xl p-2 shadow">
                  <BrandLogo brand={brand} size={56} />
                </div>
              </div>
              <div className="p-5 text-center">
                <p className="text-title-50 text-lg font-semibold">{brand.name} eGift</p>
                <p className="text-[#486581] text-2xl font-bold mt-1">{formatMXN(result.amount)}</p>

                {/* Código — revelar */}
                <div className="mt-5 rounded-xl border border-[#d9e2ec] bg-[#f8fafc] p-4">
                  <p className="text-[#829ab1] text-[11px] uppercase tracking-wider font-semibold">Número de tarjeta</p>
                  <p className="text-title-50 text-lg font-bold font-mono tracking-wider mt-1">
                    {revealed ? result.redemption_code : `•••• •••• •••• ${result.redemption_code.slice(-4)}`}
                  </p>
                  <p className="text-[#829ab1] text-[11px] uppercase tracking-wider font-semibold mt-3">PIN</p>
                  <p className="text-title-50 text-base font-bold font-mono mt-0.5">
                    {revealed ? result.pin : '••••'}
                  </p>

                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                      onClick={() => setRevealed(v => !v)}
                      className="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition"
                    >
                      {revealed ? 'Ocultar código' : 'Revelar código'}
                    </button>
                    {revealed && (
                      <button onClick={copy} className="px-4 py-2 rounded-lg border border-[#d9e2ec] bg-white text-[#334e68] text-sm font-medium hover:bg-[#f8fafc] transition">
                        {copied ? 'Copiado ✓' : 'Copiar'}
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[#829ab1] text-xs mt-4 leading-relaxed">
                  Usa este número y PIN en {brand.domain} o en tienda según las instrucciones de la marca.
                  No compartas tu código con nadie.
                </p>
              </div>
            </div>

            {/* Footer del portal */}
            <div className="text-center mt-6 space-y-1">
              <p className="text-[#829ab1] text-xs">ID de transacción: <span className="font-mono">{result.transaction_id}</span></p>
              <p className="text-[#9fb3c8] text-[11px]">Términos y condiciones aplicables según la marca emisora · blackhawknetwork.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sidebar — mismo patrón que CrossBorder ───────────────────────────────────
function GCSidebar() {
  const NAV_MAIN = [
    { label: 'BillPay',     icon: Doller,        active: false },
    { label: 'Top-Ups',     icon: RefreshCircle1Clockwise, active: false },
    { label: 'Gift Cards',  icon: Layers2,       active: true  },
    { label: 'Cash-In/Out', icon: UserMultiple4, active: false },
  ];

  return (
    <aside className="h-full w-[280px] shrink-0 flex flex-col bg-white border-r border-[#f8fafc] p-5">
      <div className="flex items-center justify-between h-7 mb-7">
        <img src={LogoDefault} alt="monato" className="h-[18px] w-auto" />
        <button className="text-[#829ab1] hover:text-[#334e68] transition size-5 flex items-center justify-center">
          <Layers2 size={16} className="text-[#829ab1]" />
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-[#829ab1] text-xs font-normal leading-4 tracking-tight">Services</p>
          <div className="flex flex-col gap-1">
            {NAV_MAIN.map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                disabled={!active}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                  active
                    ? 'bg-[#e6f4fa] text-primary-500 font-semibold'
                    : 'text-[#1e1e22] font-medium cursor-not-allowed opacity-60'
                }`}
              >
                <Icon size={24} className={active ? 'text-primary-500' : 'text-[#1e1e22]'} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          {[{ label: 'Support', icon: Bell1 }, { label: 'Settings', icon: Gear1 }].map(({ label, icon: Icon }) => (
            <button key={label} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm font-medium text-[#1e1e22] hover:bg-[#f8fafc] transition-colors">
              <Icon size={24} className="text-[#1e1e22]" />
              {label}
            </button>
          ))}
        </div>

        <div className="border-t border-[#f8fafc] pt-5 flex items-center gap-3">
          <div className="size-12 rounded-full bg-[#b2deee] flex items-center justify-center shrink-0">
            <span className="text-primary-500 text-lg font-semibold">DG</span>
          </div>
          <div className="min-w-0">
            <p className="text-[#334e68] text-base font-medium leading-6">Damaris Guadarrama</p>
            <p className="text-[#829ab1] text-sm leading-5 truncate">
              <span className="font-bold">damaris</span>.guadarrama@monato.com
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Mac Desktop wrapper — igual que CrossBorder ─────────────────────────────
function GCApp({ onExit }: { onExit: () => void }) {
  const [state, dispatch]   = useReducer(reducer, initialState);
  const [scenario, setScenario] = useState<SimScenario>('200');
  const [redeemOpen, setRedeemOpen] = useState(false);

  const stepLabels = ['Selecciona marca', 'Monto', 'Confirmación', 'Resultado'];
  const scenarios: SimScenario[] = ['200', '400', '409', '503', 'timeout'];

  const ScreenComponent = (() => {
    switch (state.step) {
      case 1: return <BrandsScreen state={state} dispatch={dispatch} />;
      case 2: return <AmountScreen key={state.brand?.id} state={state} dispatch={dispatch} />;
      case 3: return <ConfirmScreen state={state} dispatch={dispatch} scenario={scenario} />;
      case 4: return <ResultScreen state={state} dispatch={dispatch} onExit={onExit} onRedeem={() => setRedeemOpen(true)} />;
    }
  })();

  return (
    <div className="w-full h-full overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-[1440px] rounded-xl overflow-hidden shadow-2xl flex flex-col border border-white/10 relative"
        style={{ height: 'min(1000px, calc(100vh - 32px))' }}
      >
        {/* Mac title bar */}
        <div className="h-9 bg-[#1e1e1e] flex items-center px-4 gap-2 shrink-0">
          <button
            onClick={onExit}
            className="size-3 rounded-full bg-red-500 hover:bg-red-400 transition flex items-center justify-center group"
            title="Volver al catálogo"
          >
            <span className="text-red-900 text-[8px] font-bold opacity-0 group-hover:opacity-100">✕</span>
          </button>
          <div className="size-3 rounded-full bg-yellow-500" />
          <div className="size-3 rounded-full bg-green-500" />
          <div className="flex-1 flex justify-center">
            <span className="text-white/40 text-[11px]">Gift Cards — Monato · {stepLabels[state.step - 1]}</span>
          </div>
          {/* Dev: simulador de response */}
          <div className="flex items-center gap-1">
            <span className="text-white/30 text-[10px] mr-1">API:</span>
            {scenarios.map(s => (
              <button
                key={s}
                onClick={() => setScenario(s)}
                className={`text-[10px] px-1.5 py-0.5 rounded transition ${
                  scenario === s ? 'bg-white/15 text-white' : 'text-white/35 hover:text-white/60'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* App content — o portal BHN si el usuario "navegó" al canje */}
        {redeemOpen && state.brand && state.result ? (
          <RedeemPortal brand={state.brand} result={state.result} onBack={() => setRedeemOpen(false)} />
        ) : (
        <div className="flex-1 flex overflow-hidden bg-background-50">
          <GCSidebar />

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Breadcrumb header */}
            <div className="bg-white border-b border-[#f8fafc] px-6 py-4 shrink-0 flex items-center">
              <p className="text-[#334e68] text-xl font-medium leading-7">
                <span className="font-medium">Gift Cards</span>{' '}
                <span className="font-normal text-[#334e68]">/ {stepLabels[state.step - 1]}</span>
              </p>
            </div>

            {/* Stepper */}
            <div className="bg-white border-b border-[#f8fafc] px-6 py-4 shrink-0 flex items-center justify-center">
              <Stepper current={state.step} />
            </div>

            {/* Screens */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${state.step}-${state.failure ? 'err' : 'ok'}-${state.processing ? 'p' : ''}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className="flex-1 flex flex-col h-full"
                >
                  {ScreenComponent}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Entry card en el catálogo — mismo patrón que CrossBorder ────────────────
export default function GiftcardsPrototype() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="rounded-xl border border-base-100 bg-background-50 overflow-hidden">
        <div className="border-b border-base-100 bg-background-soft-50 px-4 py-2.5 flex items-center justify-between">
          <span className="text-text-200 text-[11px] font-medium uppercase tracking-widest">Gift Cards v2.0 — Prototipo navegable</span>
          <Badge color="primary" size="sm">Prototype</Badge>
        </div>
        <div className="p-6 flex items-center gap-6">
          <div className="relative w-72 h-44 rounded-lg overflow-hidden border border-base-100 bg-background-soft-50 shrink-0">
            <div className="absolute inset-0 flex">
              <div className="w-14 border-r border-base-100 bg-background-50 p-2 flex flex-col gap-1.5">
                <div className="h-2 bg-primary-500/20 rounded" />
                <div className="h-1.5 bg-base-100 rounded" />
                <div className="h-1.5 bg-base-100 rounded" />
              </div>
              <div className="flex-1 p-3 flex flex-col gap-2">
                <div className="h-1.5 bg-base-100 rounded w-2/3" />
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className={`h-8 rounded ${i === 2 ? 'border border-primary-500 bg-primary-500/10' : 'bg-base-100'}`} />
                  ))}
                </div>
                <div className="h-5 bg-primary-500 rounded w-3/4 mx-auto mt-1" />
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-title-50 text-base font-semibold">Gift Cards — Compra B2C (BillPay)</h3>
              <p className="text-text-100 text-sm mt-1">Flujo de 4 pasos: catálogo con 21 marcas por categoría, montos fijos/variables/abiertos, aviso antifraude, T&C de BHN y entrega de código con pasos de canje.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['Catálogo', 'FIXED/RANGE', 'Antifraude', 'T&C BHN', 'Código de canje', 'Simulador de errores'].map(tag => (
                <Badge key={tag} color="gray" size="sm">{tag}</Badge>
              ))}
            </div>
            <Button onClick={() => setOpen(true)}>
              <Doller size={14} className="text-white" />
              Abrir prototipo
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
          >
            <GCApp onExit={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
