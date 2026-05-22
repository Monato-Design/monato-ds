// ─────────────────────────────────────────────────────────────────────────────
// CrossBorder v2.0 — Réplica fiel de la interfaz del usuario
// Flujo: Quote → Details → Review → Confirm → Fund
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useReducer, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Doller, UserMultiple4, ChevronDown,
  ArrowRight, Check, CheckCircle1, RefreshCircle1Clockwise,
  QuestionMarkCircle, Locked3, Layers2,
  Bell1, Gear1,
} from '@tailgrids/icons';

import LogoDefault from './assets/logo-default.png';
import { Button } from './components/core/button';
import { Badge } from './components/core/badge';
import { DefaultSpinner } from './components/core/spinner/default';

// ─── Tasa de cambio (demo) ────────────────────────────────────────────────────
const RATE_MXN_PER_USD = 17.30;
const PROCESSING_FEE_MXN = 258.67;

// ─── Currency data ────────────────────────────────────────────────────────────
type CurrencyCode = 'MXN' | 'USD' | 'EUR' | 'USDC/SOL' | 'USDT/POL' | 'USDC/POL';

type Currency = {
  code: CurrencyCode;
  label: string;
  flag?: string;
  isCrypto?: boolean;
  cryptoBg?: string;
};

const CURRENCIES: Currency[] = [
  { code: 'MXN',      label: 'Mexican Peso',    flag: 'mx' },
  { code: 'USD',      label: 'US Dollar',       flag: 'us' },
  { code: 'EUR',      label: 'Euro',            flag: 'eu' },
  { code: 'USDC/SOL', label: 'USDC on Solana',  isCrypto: true, cryptoBg: 'bg-blue-500' },
  { code: 'USDT/POL', label: 'USDT on Polygon', isCrypto: true, cryptoBg: 'bg-emerald-500' },
  { code: 'USDC/POL', label: 'USDC on Polygon', isCrypto: true, cryptoBg: 'bg-purple-500' },
];

// ─── Currency Token ───────────────────────────────────────────────────────────
function CurrencyToken({ currency, size = 22 }: { currency: Currency; size?: number }) {
  if (currency.isCrypto) {
    return (
      <div
        className={`rounded-full ${currency.cryptoBg} flex items-center justify-center text-white font-bold shrink-0`}
        style={{ width: size, height: size, fontSize: size * 0.38 }}
      >
        {currency.code[0]}
      </div>
    );
  }
  return (
    <span
      className={`fi fi-${currency.flag} rounded-full shrink-0`}
      style={{ width: size, height: size, backgroundSize: 'cover', backgroundPosition: 'center', display: 'inline-block' }}
    />
  );
}

// ─── Stepper — exacto Figma ───────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4;
const STEPS = [
  { id: 1 as Step, label: 'Quote' },
  { id: 2 as Step, label: 'Details' },
  { id: 3 as Step, label: 'Review' },
  { id: 4 as Step, label: 'Fund' },
];

function Stepper({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-4">
      {STEPS.map((step, i) => {
        const isActive    = step.id === current;
        const isCompleted = step.id < current;
        return (
          <div key={step.id} className="flex items-center gap-2">
            {/* Número en círculo */}
            <div className={`size-6 rounded-full flex items-center justify-center text-sm transition-all ${
              isActive || isCompleted
                ? 'bg-primary-500 text-white font-medium'
                : 'border border-base-100 text-text-100 font-medium'
            }`}>
              {isCompleted ? <Check size={11} className="text-white" /> : step.id}
            </div>
            {/* Label: bold si activo, regular si no */}
            <span className={`text-sm tracking-tight transition-colors ${
              isActive    ? 'font-bold text-[#486581]' :
              isCompleted ? 'font-medium text-title-50' :
                            'font-normal text-[#486581]'
            }`}>{step.label}</span>
            {/* Flecha separadora */}
            {i < STEPS.length - 1 && (
              <ArrowRight size={16} className="text-text-200 ml-2" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Currency Selector — exacto Figma ────────────────────────────────────────
function CurrencySelector({ value, onChange }: { value: CurrencyCode | null; onChange: (c: CurrencyCode) => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0, width: 0 });
  const btnRef          = useRef<HTMLButtonElement>(null);
  const selected        = CURRENCIES.find(c => c.code === value);

  const handleOpen = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    }
    setOpen(v => !v);
  };

  return (
    <>
      {/* Botón outline exacto del Figma: px-4 py-2.5, border #d9e2ec, rounded-lg */}
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="flex items-center gap-1 px-4 py-2.5 rounded-lg border border-[#d9e2ec] bg-white hover:bg-[#f8fafc] transition shrink-0"
      >
        {selected ? (
          <div className="flex items-center gap-2">
            <CurrencyToken currency={selected} size={20} />
            <span className="text-[#334e68] text-base font-medium">{selected.code}</span>
          </div>
        ) : (
          <span className="text-[#334e68] text-base font-medium">Select...</span>
        )}
        <ChevronDown size={20} className="text-[#334e68] ml-1" />
      </button>

      {/* Dropdown via portal — siempre encima del wrapper Mac */}
      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: Math.max(pos.width, 180), zIndex: 9999 }}
            className="rounded-xl border border-base-100 bg-white shadow-2xl py-1.5"
          >
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                onClick={() => { onChange(c.code); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#f8fafc] ${value === c.code ? 'bg-[#e6f4fa]' : ''}`}
              >
                <CurrencyToken currency={c} size={22} />
                <span className="text-[#334e68] text-sm font-medium">{c.code}</span>
              </button>
            ))}
          </motion.div>
        </>,
        document.body
      )}
    </>
  );
}

// ─── Flow state ───────────────────────────────────────────────────────────────
type FlowState = {
  step: Step;
  from: CurrencyCode | null;
  to: CurrencyCode | null;
  fromAmount: string;
  toAmount: string;
  calculating: boolean;
  country: string;
  firstName: string; middleName: string;
  firstLastName: string; secondLastName: string;
  alias: string; accountNumber: string; bank: string;
  fundingMethod: 'monato' | 'spei' | null;
  selectedAccount: string | null;
};

type FlowAction =
  | { type: 'set'; field: keyof FlowState; value: string | null | boolean | Step }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'reset' };

const initialState: FlowState = {
  step: 1, from: 'MXN', to: null,
  fromAmount: '', toAmount: '', calculating: false,
  country: 'US', firstName: '', middleName: '',
  firstLastName: '', secondLastName: '',
  alias: '', accountNumber: '', bank: '',
  fundingMethod: null, selectedAccount: null,
};

function reducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'set':  return { ...state, [action.field]: action.value };
    case 'next': return { ...state, step: Math.min(4, state.step + 1) as Step };
    case 'back': return { ...state, step: Math.max(1, state.step - 1) as Step };
    case 'reset': return initialState;
  }
}

// ─── Quote Screen — exacto Figma ─────────────────────────────────────────────
function QuoteScreen({ state, dispatch }: { state: FlowState; dispatch: React.Dispatch<FlowAction> }) {
  const calcTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerCalc = useCallback((fromVal: string) => {
    dispatch({ type: 'set', field: 'calculating', value: true });
    dispatch({ type: 'set', field: 'toAmount', value: '' });
    if (calcTimer.current) clearTimeout(calcTimer.current);
    calcTimer.current = setTimeout(() => {
      const num = parseFloat(fromVal) || 0;
      dispatch({ type: 'set', field: 'calculating', value: false });
      dispatch({ type: 'set', field: 'toAmount', value: num > 0 ? (num / RATE_MXN_PER_USD).toFixed(2) : '' });
    }, 1400);
  }, [dispatch]);

  const handleFromChange = (v: string) => {
    const clean = v.replace(/[^\d.]/g, '');
    dispatch({ type: 'set', field: 'fromAmount', value: clean });
    if (state.to && clean) triggerCalc(clean);
    else if (!clean) {
      dispatch({ type: 'set', field: 'toAmount', value: '' });
      dispatch({ type: 'set', field: 'calculating', value: false });
    }
  };

  const handleToSelect = (code: CurrencyCode) => {
    dispatch({ type: 'set', field: 'to', value: code });
    if (state.fromAmount && parseFloat(state.fromAmount) > 0) triggerCalc(state.fromAmount);
  };

  const swap = () => {
    dispatch({ type: 'set', field: 'from',       value: state.to });
    dispatch({ type: 'set', field: 'to',         value: state.from });
    dispatch({ type: 'set', field: 'fromAmount', value: state.toAmount });
    dispatch({ type: 'set', field: 'toAmount',   value: state.fromAmount });
  };

  const bothSelected = !!(state.from && state.to);
  const hasAmount    = !!state.fromAmount && parseFloat(state.fromAmount) > 0;
  const canContinue  = bothSelected && hasAmount && !!state.toAmount && !state.calculating;

  return (
    <div className="flex-1 flex flex-col items-center justify-start px-8 pt-8 pb-10 bg-[#f8fafc]">
      <div className="w-full max-w-[376px] flex flex-col gap-6">

        {/* Título */}
        <div className="text-center">
          <h1 className="text-[#334e68] text-[22px] font-semibold">Currency Exchange</h1>
          <p className="text-[#829ab1] text-sm mt-1">Type in either field to get a quote.</p>
        </div>

        {/* Cards + Swap — contenedor relativo para el Swap flotante */}
        <div className="flex flex-col gap-3 relative">

          {/* FROM card */}
          <div className="bg-white border border-[#f8fafc] rounded-2xl px-5 py-6 flex flex-col gap-2 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3">
              <p className="text-[#829ab1] text-sm font-normal">From</p>
            </div>
            <div className="flex items-center justify-between">
              <input
                value={state.fromAmount}
                onChange={e => handleFromChange(e.target.value)}
                placeholder="0.00"
                className="flex-1 text-[30px] font-semibold text-[#334e68] bg-transparent outline-none border-none ring-0 placeholder:text-[#bcccdc] w-0 leading-9"
              />
              <CurrencySelector value={state.from} onChange={v => dispatch({ type: 'set', field: 'from', value: v })} />
            </div>
            {/* Processing fee */}
            <AnimatePresence>
              {hasAmount && state.toAmount && !state.calculating && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="text-[#829ab1] text-xs overflow-hidden">
                  Plus processing fee: ${PROCESSING_FEE_MXN.toFixed(2)} {state.from}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Swap — flotando entre las dos cards, centrado */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={swap}
              className="flex items-center gap-1.5 bg-white border border-[#f8fafc] rounded-lg px-3.5 py-2.5 shadow-sm hover:shadow-md transition-shadow text-[#334e68] text-sm font-medium"
            >
              <RefreshCircle1Clockwise size={18} className="text-[#334e68]" />
              Swap
            </motion.button>
          </div>

          {/* TO card */}
          <div className="bg-white border border-[#f8fafc] rounded-2xl px-5 py-6 flex flex-col gap-2 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
            <p className="text-[#829ab1] text-sm font-normal">To</p>
            <div className="flex items-center justify-between">
              {state.calculating ? (
                <div className="flex-1">
                  <DefaultSpinner size={34} percentage={70} className="animate-spin" />
                </div>
              ) : (
                <input
                  value={state.toAmount}
                  readOnly
                  placeholder="0.00"
                  className="flex-1 text-[30px] font-semibold text-[#334e68] bg-transparent outline-none border-none ring-0 placeholder:text-[#bcccdc] w-0 leading-9"
                />
              )}
              <CurrencySelector value={state.to} onChange={handleToSelect} />
            </div>
          </div>
        </div>

        {/* Warning dinámica */}
        <AnimatePresence>
          {bothSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2.5 rounded-xl border border-yellow-200 bg-yellow-50 px-3.5 py-3">
                <div className="size-6 rounded-lg bg-yellow-400 flex items-center justify-center shrink-0 mt-0.5">
                  <QuestionMarkCircle size={13} className="text-white" />
                </div>
                <p className="text-yellow-800 text-xs leading-relaxed">
                  The exchange rate is dynamic. Once you review details and agree, this quote will expire in 2 hrs.{' '}
                  <a href="#" className="underline font-medium">Read more about</a> after-hours rates.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue — full width, estilo exacto Figma disabled */}
        <button
          disabled={!canContinue}
          onClick={() => canContinue && dispatch({ type: 'next' })}
          className={`w-full py-3 rounded-lg text-base font-medium transition-colors ${
            canContinue
              ? 'bg-primary-500 text-white hover:bg-primary-600'
              : 'bg-[#f0f4f8] text-[#9fb3c8] cursor-not-allowed'
          }`}
        >
          Continue
        </button>

        {/* Currency rate debajo del botón */}
        <AnimatePresence>
          {canContinue && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-[#829ab1] text-xs text-center -mt-3">
              Currency Rate: ${RATE_MXN_PER_USD.toFixed(2)} MXN = $1 USD
            </motion.p>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

// ─── Form Input ───────────────────────────────────────────────────────────────
function FormInput({ label, value, onChange, placeholder, optional, error }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; optional?: boolean; error?: string;
}) {
  return (
    <div>
      <label className={`text-xs font-medium mb-1.5 flex items-center gap-1 ${error ? 'text-red-500' : 'text-text-50'}`}>
        {label}
        {optional && <span className="text-text-200 font-normal">(Optional)</span>}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-10 rounded-xl border px-3.5 text-sm text-title-50 bg-background-50 placeholder:text-text-200 focus:outline-none transition ${
          error ? 'border-red-500' : 'border-[#d9e2ec] focus:border-primary-500'
        }`}
      />
      {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
    </div>
  );
}

// ─── Country Selector ─────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: 'US', label: 'United States', flag: 'us' },
  { code: 'MX', label: 'Mexico',        flag: 'mx' },
  { code: 'EU', label: 'Eurozone',      flag: 'eu' },
];

function CountrySelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0, width: 0 });
  const btnRef          = useRef<HTMLButtonElement>(null);
  const selected        = COUNTRIES.find(c => c.code === value);

  const handleOpen = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left, width: r.width });
    }
    setOpen(v => !v);
  };

  return (
    <>
      <button ref={btnRef} onClick={handleOpen}
        className="w-full h-10 rounded-xl border border-[#d9e2ec] px-3.5 bg-white flex items-center gap-2.5 text-left hover:border-primary-500/40 transition">
        {selected && <span className={`fi fi-${selected.flag} rounded-full shrink-0`} style={{ width: 18, height: 18, backgroundSize: 'cover', display: 'inline-block' }} />}
        <span className="flex-1 text-sm text-title-50">{selected?.label}</span>
        <ChevronDown size={13} className={`text-text-200 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
            className="rounded-xl border border-base-100 bg-background-50 shadow-xl p-1">
            {COUNTRIES.map(c => (
              <button key={c.code} onClick={() => { onChange(c.code); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-background-soft-50 transition">
                <span className={`fi fi-${c.flag} rounded-full`} style={{ width: 18, height: 18, backgroundSize: 'cover', display: 'inline-block' }} />
                <span className="text-sm text-title-50">{c.label}</span>
              </button>
            ))}
          </motion.div>
        </>,
        document.body
      )}
    </>
  );
}

// ─── Bank Selector ────────────────────────────────────────────────────────────
const BANKS = ['JPMorgan Chase Bank', 'Bank of America', 'Wells Fargo', 'Citibank', 'Fincopay', 'Banco Banorte', 'Bancomer'];

function BankSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0, width: 0 });
  const btnRef          = useRef<HTMLButtonElement>(null);

  const handleOpen = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left, width: r.width });
    }
    setOpen(v => !v);
  };

  return (
    <>
      <button ref={btnRef} onClick={handleOpen}
        className="w-full h-10 rounded-xl border border-[#d9e2ec] px-3.5 bg-white flex items-center text-left hover:border-primary-500/40 transition">
        <span className={`flex-1 text-sm ${value ? 'text-title-50' : 'text-text-200'}`}>{value || 'Select bank'}</span>
        <ChevronDown size={13} className={`text-text-200 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
            className="rounded-xl border border-base-100 bg-background-50 shadow-xl p-1 max-h-52 overflow-y-auto">
            {BANKS.map(b => (
              <button key={b} onClick={() => { onChange(b); setOpen(false); }}
                className="w-full px-3 py-2 rounded-lg text-left text-sm text-title-50 hover:bg-background-soft-50 transition">{b}</button>
            ))}
          </motion.div>
        </>,
        document.body
      )}
    </>
  );
}

// ─── Details Screen ───────────────────────────────────────────────────────────
function DetailsScreen({ state, dispatch }: { state: FlowState; dispatch: React.Dispatch<FlowAction> }) {
  const [accountTouched, setAccountTouched] = useState(false);
  const accountValid   = /^\d{8,18}$/.test(state.accountNumber);
  const showAccountErr = accountTouched && state.accountNumber.length > 0 && !accountValid;
  const canContinue    = !!(state.firstName && state.firstLastName && accountValid && state.bank);

  return (
    <div className="flex-1 overflow-y-auto px-10 py-8 bg-[#f8fafc]">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">

        {/* Título afuera del card — exacto Figma */}
        <h2 className="text-[#151515] text-2xl font-semibold">Who are you going to send it to?</h2>

        {/* Card blanco — exacto Figma 2694-8279 */}
        <div className="bg-white rounded-2xl border border-[#f8fafc] shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] p-5 flex flex-col gap-5">

          {/* Country */}
          <div className="flex gap-10 items-start">
            <div className="w-[307px] shrink-0">
              <p className="text-[#486581] text-base font-medium">Country of destination</p>
              <p className="text-[#9fb3c8] text-xs mt-0.5 leading-relaxed">Select the country where the funds will be received</p>
            </div>
            <div className="flex-1">
              <CountrySelector value={state.country} onChange={v => dispatch({ type: 'set', field: 'country', value: v })} />
            </div>
          </div>

          <div className="border-t border-[#f8fafc]" />

          {/* Personal data */}
          <div className="flex gap-10 items-start">
            <div className="w-[307px] shrink-0">
              <p className="text-[#486581] text-base font-medium">Personal data</p>
              <p className="text-[#9fb3c8] text-xs mt-0.5 leading-relaxed">{"Enter the recipient's full legal name as it appears on their ID"}</p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <FormInput label="First name"       value={state.firstName}      onChange={v => dispatch({ type: 'set', field: 'firstName',      value: v })} placeholder="Ex. Roberto" />
              <FormInput label="Middle name"      value={state.middleName}     onChange={v => dispatch({ type: 'set', field: 'middleName',     value: v })} placeholder="Ex. Felipe" />
              <FormInput label="First last name"  value={state.firstLastName}  onChange={v => dispatch({ type: 'set', field: 'firstLastName',  value: v })} placeholder="Ex. Lopez" />
              <FormInput label="Second last name" value={state.secondLastName} onChange={v => dispatch({ type: 'set', field: 'secondLastName', value: v })} placeholder="Ex. Perez" />
              <div className="col-span-2">
                <FormInput label="Alias" value={state.alias} onChange={v => dispatch({ type: 'set', field: 'alias', value: v })} placeholder="Ex. Rob Main Account" optional />
              </div>
            </div>
          </div>

          <div className="border-t border-[#f8fafc]" />

          {/* Bank details */}
          <div className="flex gap-10 items-start">
            <div className="w-[307px] shrink-0">
              <p className="text-[#486581] text-base font-medium">Bank details</p>
              <p className="text-[#9fb3c8] text-xs mt-0.5 leading-relaxed">{"Provide the recipient's banking information for the transfer"}</p>
            </div>
            <div className="flex-1 space-y-4">
              <FormInput
                label="Account Number"
                value={state.accountNumber}
                onChange={v => { dispatch({ type: 'set', field: 'accountNumber', value: v }); setAccountTouched(true); }}
                placeholder="Ex. 734180999000000006"
                error={showAccountErr ? 'Please enter a valid number' : undefined}
              />
              <div>
                <label className="text-[#486581] text-sm font-medium mb-1.5 block">Bank</label>
                <BankSelector value={state.bank} onChange={v => dispatch({ type: 'set', field: 'bank', value: v })} />
              </div>
            </div>
          </div>

        </div>

        {/* Botones afuera del card, derecha — exacto Figma */}
        <div className="flex items-center justify-end gap-4">
          <button onClick={() => dispatch({ type: 'back' })} className="px-5 py-3 rounded-lg border border-[#d9e2ec] bg-white text-base font-medium text-[#334e68] hover:bg-[#f8fafc] transition">Back</button>
          <Button disabled={!canContinue} onClick={() => dispatch({ type: 'next' })}>Continue</Button>
        </div>

      </div>
    </div>
  );
}

// ─── Review Screen ────────────────────────────────────────────────────────────
const MONATO_ACCOUNTS = [
  { id: 'mxn-main',  name: 'MXN Main Account', clabe: '1234', balance: 850.00,   insufficient: true,  color: 'bg-blue-200'   },
  { id: 'mxn-test',  name: 'Prueba MXN',        clabe: '1234', balance: 30.00,    insufficient: true,  color: 'bg-blue-200'   },
  { id: 'mxn-ops-1', name: 'MXN Operations',    clabe: '4567', balance: 48200.00, insufficient: false, color: 'bg-primary-500'},
  { id: 'mxn-wlt',   name: 'Wallet MXN',        clabe: '7890', balance: 8479.00,  insufficient: false, color: 'bg-orange-400' },
  { id: 'mxn-ops-2', name: 'MXN Operations',    clabe: '7890', balance: 8479.00,  insufficient: false, color: 'bg-green-500'  },
];

function ReviewScreen({ state, dispatch, onConfirm }: {
  state: FlowState; dispatch: React.Dispatch<FlowAction>; onConfirm: () => void;
}) {
  const fromCurr = CURRENCIES.find(c => c.code === state.from)!;
  const toCurr   = CURRENCIES.find(c => c.code === state.to)!;
  const fullName = [state.firstName, state.middleName, state.firstLastName, state.secondLastName].filter(Boolean).join(' ');

  return (
    <div className="flex-1 overflow-y-auto px-10 py-8 bg-[#f8fafc]">
      <h2 className="text-title-50 text-xl font-bold mb-6">Review details</h2>

      <div className="max-w-xl space-y-6">
        {/* Transfer summary */}
        <div className="rounded-2xl border border-base-100 p-5 space-y-4">
          <p className="text-title-50 text-sm font-semibold">Transfer details</p>
          <div className="text-center space-y-2">
            <div>
              <p className="text-text-200 text-xs">You pay</p>
              <div className="flex items-center justify-center gap-2 mt-0.5">
                <CurrencyToken currency={fromCurr} size={18} />
                <p className="text-title-50 text-lg font-bold">${state.fromAmount} {state.from}*</p>
              </div>
            </div>
            <ChevronDown size={18} className="text-primary-500 mx-auto" />
            <div>
              <p className="text-text-200 text-xs">{state.firstName || 'Recipient'} gets</p>
              <div className="flex items-center justify-center gap-2 mt-0.5">
                <CurrencyToken currency={toCurr} size={18} />
                <p className="text-title-50 text-lg font-bold">{state.to} ${state.toAmount}</p>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-base-100 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-text-200">Includes processing fee*</span>
              <span className="text-title-50">-${PROCESSING_FEE_MXN.toFixed(2)} {state.from}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-200">Currency Rate</span>
              <span className="text-title-50">${RATE_MXN_PER_USD.toFixed(2)} MXN = $1 USD</span>
            </div>
          </div>
        </div>

        {/* Funding */}
        <div>
          <p className="text-title-50 text-sm font-semibold mb-3">Funding method</p>
          <div className="space-y-2.5">
            <div className={`rounded-2xl border overflow-hidden transition ${state.fundingMethod === 'monato' ? 'border-primary-500' : 'border-base-100'}`}>
              <button onClick={() => dispatch({ type: 'set', field: 'fundingMethod', value: 'monato' })}
                className="w-full flex items-start gap-3 p-4 text-left">
                <div className={`size-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition ${state.fundingMethod === 'monato' ? 'border-primary-500 bg-primary-500' : 'border-[#d9e2ec]'}`}>
                  {state.fundingMethod === 'monato' && <span className="size-1.5 rounded-full bg-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-title-50 text-sm font-medium">Fund from my Monato account</p>
                    <Badge color="success" size="sm">INSTANT</Badge>
                  </div>
                  <p className="text-text-200 text-xs mt-1">Available immediately · No fees</p>
                </div>
              </button>
              <AnimatePresence>
                {state.fundingMethod === 'monato' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-base-100">
                    <div className="p-4 space-y-2 bg-background-soft-50/40">
                      {MONATO_ACCOUNTS.map(acc => (
                        <button key={acc.id} disabled={acc.insufficient}
                          onClick={() => dispatch({ type: 'set', field: 'selectedAccount', value: acc.id })}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-left border ${
                            acc.insufficient ? 'opacity-50 cursor-not-allowed border-transparent' :
                            state.selectedAccount === acc.id ? 'border-primary-500/30 bg-primary-500/5' : 'border-transparent hover:bg-background-50'
                          }`}>
                          <div className={`size-7 rounded-full ${acc.color} flex items-center justify-center text-white text-[9px] font-bold shrink-0`}>MXN</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-title-50 text-xs font-medium">{acc.name}</p>
                            <p className="text-text-200 text-[10px]">CLABE: **** {acc.clabe}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-xs font-semibold ${acc.insufficient ? 'line-through text-text-200' : 'text-title-50'}`}>
                              ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} MXN
                            </p>
                            {acc.insufficient && <p className="text-red-500 text-[10px]">Insufficient balance</p>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => dispatch({ type: 'set', field: 'fundingMethod', value: 'spei' })}
              className={`w-full flex items-start gap-3 p-4 text-left rounded-2xl border transition ${state.fundingMethod === 'spei' ? 'border-primary-500' : 'border-base-100'}`}>
              <div className={`size-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition ${state.fundingMethod === 'spei' ? 'border-primary-500 bg-primary-500' : 'border-[#d9e2ec]'}`}>
                {state.fundingMethod === 'spei' && <span className="size-1.5 rounded-full bg-white" />}
              </div>
              <div>
                <p className="text-title-50 text-sm font-medium">Fund with external SPEI transfer</p>
                <p className="text-text-200 text-xs mt-1">Usually 1–2 min · Standard SPEI fees apply</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recipient */}
        <div>
          <p className="text-title-50 text-sm font-semibold mb-3">Recipient details</p>
          <div className="space-y-2 text-xs">
            {[['Name', fullName || '—'], ['Account Number', state.accountNumber || '—'], ['Bank', state.bank || '—']].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-text-200">{k}</span>
                <span className="text-title-50 font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lock alert */}
        <div className="flex gap-2.5 rounded-xl border border-yellow-200 bg-yellow-50 px-3.5 py-3">
          <Locked3 size={13} className="text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-yellow-800 text-xs leading-relaxed">
            The exchange rate will be locked for 2 hours after you agree.{' '}
            <a href="#" className="underline font-medium">Read more</a> about after-hours rates.
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => dispatch({ type: 'back' })} className="px-5 py-3 rounded-lg border border-[#d9e2ec] bg-white text-base font-medium text-[#334e68] hover:bg-[#f8fafc] transition">Back</button>
          <Button
            disabled={!state.fundingMethod || (state.fundingMethod === 'monato' && !state.selectedAccount)}
            onClick={onConfirm}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Fund Screen — exacto Figma 2753-8116 ────────────────────────────────────
function FundScreen({ state, dispatch, onExit }: {
  state: FlowState; dispatch: React.Dispatch<FlowAction>; onExit: () => void;
}) {
  const fromCurr = CURRENCIES.find(c => c.code === state.from)!;
  const toCurr   = CURRENCIES.find(c => c.code === state.to)!;
  const fullName = [state.firstName, state.middleName, state.firstLastName, state.secondLastName].filter(Boolean).join(' ');
  const amountExchanged = parseFloat(state.fromAmount || '0') - PROCESSING_FEE_MXN;

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 bg-[#f8fafc] flex justify-center">
      <div className="w-full max-w-[452px] flex flex-col gap-8 items-center">

        {/* Header */}
        <div className="flex flex-col gap-6 items-center text-center w-full">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
            className="size-16 rounded-full bg-[#1cb061] border-[10px] border-[rgba(22,163,74,0.3)] flex items-center justify-center"
          >
            <CheckCircle1 size={28} className="text-white" />
          </motion.div>
          <div className="flex flex-col gap-2 text-center w-full">
            <p className="text-[#334e68] text-2xl font-semibold">Payment initiated</p>
            <p className="text-[#627d98] text-base leading-6">
              Your balance has been successfully used to fund this transaction. We are now processing your cross-border payment, and it will be completed shortly.
            </p>
          </div>
        </div>

        {/* Transfer details card — white top, gray bottom */}
        <div className="w-full rounded-2xl border border-[#f0f4f8] overflow-hidden">
          {/* White inner section */}
          <div className="bg-white px-6 pt-6 pb-8 flex flex-col gap-2 items-center">
            <p className="text-[#829ab1] text-sm">You pay</p>
            <div className="flex items-center gap-4">
              <CurrencyToken currency={fromCurr} size={24} />
              <p className="text-[#334e68] text-3xl font-semibold">${parseFloat(state.fromAmount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })} {state.from}*</p>
            </div>
            <p className="text-[#829ab1] text-sm">Fee <span className="font-semibold">${PROCESSING_FEE_MXN.toFixed(1)} {state.from}</span> included</p>
            <ChevronDown size={20} className="text-[#0894c8]" />
            <p className="text-[#829ab1] text-sm">{state.firstName || 'Fernando'} gets</p>
            <div className="flex items-center gap-4">
              <CurrencyToken currency={toCurr} size={24} />
              <p className="text-[#334e68] text-3xl font-semibold">{state.to} {parseFloat(state.toAmount || '0').toFixed(2)}</p>
            </div>
          </div>
          {/* Gray bottom section */}
          <div className="bg-[#f0f4f8] px-6 py-5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[#627d98] text-xs">Includes processing fee*</span>
              <span className="text-[#486581] text-sm font-medium">-${PROCESSING_FEE_MXN.toFixed(4)} {state.from}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#627d98] text-xs">Amount exchanged</span>
              <span className="text-[#486581] text-sm font-bold">${amountExchanged.toLocaleString('en-US', { minimumFractionDigits: 1 })} {state.from}</span>
            </div>
            <div className="border-t border-[#d9e2ec] my-1" />
            <div className="flex items-center justify-between">
              <span className="text-[#627d98] text-xs">Currency Rate</span>
              <span className="text-[#486581] text-sm font-medium">$1 {state.from} = ${(1 / RATE_MXN_PER_USD).toFixed(3)} {state.to}</span>
            </div>
          </div>
        </div>

        {/* Recipient details */}
        <div className="bg-white rounded-xl p-8 flex flex-col gap-8 w-full">
          <p className="text-[#334e68] text-lg font-semibold">Recipient details</p>
          <div className="flex flex-col gap-2 text-base text-[#486581]">
            {[
              ['Name of the account holder', fullName || 'Fernando Villa Acuña'],
              ['Recipient Address', '123 Sunshine Blvd...'],
              ['Account Number', state.accountNumber || '9876543210'],
              ['Routing Number (ABA)', '021000021'],
              ['Bank Name', state.bank || 'JPMorgan Chase Bank'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-6">
                <span className="text-[#486581] font-normal">{label}</span>
                <span className="text-[#334e68] font-semibold text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Got it — full width skyblue */}
        <button
          onClick={() => { dispatch({ type: 'reset' }); onExit(); }}
          className="w-full bg-[#0894c8] hover:bg-[#0787b6] text-white text-base font-medium py-3 rounded-lg transition"
        >
          Got it
        </button>

      </div>
    </div>
  );
}
// ─── Confirm Modal — exacto Figma 2752-102300 ─────────────────────────────────
function ConfirmModal({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(100,108,133,0.8)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-2xl w-[400px] px-6 pt-7 pb-6 flex flex-col gap-7 items-center relative shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2.5 rounded-lg hover:bg-[#f8fafc] transition text-[#829ab1]"
        >
          ✕
        </button>

        {/* Icon — stacked layers como Figma */}
        <div className="size-20 rounded-full bg-[#e6f4fa] flex items-center justify-center">
          <div className="size-[34px] rounded-full bg-[#0894c8] flex items-center justify-center">
            <QuestionMarkCircle size={18} className="text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 items-center w-full">
          <div className="flex flex-col gap-4 w-full text-center">
            <p className="text-[#334e68] text-3xl font-semibold">Confirm the operation</p>
            <p className="text-[#627d98] text-base">Are you sure you want to continue?</p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 border border-[#d9e2ec] bg-white rounded-lg px-4 py-2.5 text-base font-medium text-[#334e68] hover:bg-[#f8fafc] transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-[#0ea5e9] rounded-lg px-4 py-2.5 text-base font-medium text-white hover:bg-[#0284c7] transition"
            >
              Confirm
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Sidebar — exacto Figma ───────────────────────────────────────────────────
function CBSidebar({ onExit: _onExit }: { onExit: () => void }) {
  const NAV_MAIN = [
    { label: 'Currency exchange', icon: Doller,        active: true  },
    { label: 'Accounts',          icon: UserMultiple4, active: false },
    { label: 'All transactions',  icon: Layers2,       active: false },
  ];

  return (
    <aside className="h-full w-[280px] shrink-0 flex flex-col bg-white border-r border-[#f8fafc] p-5">
      {/* Logo + collapse icon */}
      <div className="flex items-center justify-between h-7 mb-7">
        <img src={LogoDefault} alt="monato" className="h-[18px] w-auto" />
        <button className="text-[#829ab1] hover:text-[#334e68] transition size-5 flex items-center justify-center">
          <Layers2 size={16} className="text-[#829ab1]" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-[#829ab1] text-xs font-normal leading-4 tracking-tight">Main menu</p>
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

      {/* Support + Settings + Avatar al fondo */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          {[{ label: 'Support', icon: Bell1 }, { label: 'Settings', icon: Gear1 }].map(({ label, icon: Icon }) => (
            <button key={label} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm font-medium text-[#1e1e22] hover:bg-[#f8fafc] transition-colors">
              <Icon size={24} className="text-[#1e1e22]" />
              {label}
            </button>
          ))}
        </div>

        {/* Avatar footer — exacto Figma: bg skyblue-100, iniciales azul */}
        <div className="border-t border-[#f8fafc] pt-5 flex items-center gap-3">
          <div className="size-12 rounded-full bg-[#b2deee] flex items-center justify-center shrink-0">
            <span className="text-primary-500 text-lg font-semibold">KM</span>
          </div>
          <div>
            <p className="text-[#334e68] text-base font-medium leading-6">Kathryn Murphy</p>
            <p className="text-[#829ab1] text-sm leading-5">
              <span className="font-bold">murphy</span>.mitc@example.com
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Mac Desktop wrapper — igual que CLP ─────────────────────────────────────
function CBApp({ onExit }: { onExit: () => void }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const stepLabels = ['Currency Exchange', 'Details', 'Review', 'Fund'];

  const ScreenComponent = (() => {
    switch (state.step) {
      case 1: return <QuoteScreen state={state} dispatch={dispatch} />;
      case 2: return <DetailsScreen state={state} dispatch={dispatch} />;
      case 3: return <ReviewScreen state={state} dispatch={dispatch} onConfirm={() => setConfirmOpen(true)} />;
      case 4: return <FundScreen state={state} dispatch={dispatch} onExit={onExit} />;
    }
  })();

  return (
    <div className="w-full h-full overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Window */}
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
            <span className="text-white/40 text-[11px]">CrossBorder — Monato · {stepLabels[state.step - 1]}</span>
          </div>
        </div>

        {/* App content */}
        <div className="flex-1 flex overflow-hidden bg-background-50">
          <CBSidebar onExit={onExit} />

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Breadcrumb header — exacto Figma */}
            <div className="bg-white border-b border-[#f8fafc] px-6 py-4 shrink-0 flex items-center">
              <p className="text-[#334e68] text-xl font-medium leading-7">
                <span className="font-medium">Crossborder</span>
                {' '}
                <span className="font-normal text-[#334e68]">/ {stepLabels[state.step - 1]}</span>
              </p>
            </div>

            {/* Stepper — centrado en la pantalla */}
            <div className="bg-white border-b border-[#f8fafc] px-6 py-4 shrink-0 flex items-center justify-center">
              <Stepper current={state.step} />
            </div>

            {/* Screens */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={state.step}
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
      </motion.div>

      <ConfirmModal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => { setConfirmOpen(false); dispatch({ type: 'next' }); }}
      />
    </div>
  );
}

// ─── Entry card en el catálogo ────────────────────────────────────────────────
export function CrossBorderPrototype() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="rounded-xl border border-base-100 bg-background-50 overflow-hidden">
        <div className="border-b border-base-100 bg-background-soft-50 px-4 py-2.5 flex items-center justify-between">
          <span className="text-text-200 text-[11px] font-medium uppercase tracking-widest">CrossBorder v2.0 — Prototipo navegable</span>
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
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-center gap-0.5">
                      <div className={`size-2 rounded-full ${i === 1 ? 'bg-primary-500' : 'bg-base-200'}`} />
                      <div className={`text-[6px] ${i === 1 ? 'text-primary-500' : 'text-text-200'} hidden sm:block`}>S{i}</div>
                      {i < 4 && <span className="text-[7px] text-text-200 mx-0.5">›</span>}
                    </div>
                  ))}
                </div>
                <div className="h-7 bg-base-100 rounded mt-1" />
                <div className="h-7 bg-base-100 rounded" />
                <div className="h-5 bg-primary-500 rounded w-3/4 mx-auto mt-1" />
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-title-50 text-base font-semibold">CrossBorder — Transferencia Internacional</h3>
              <p className="text-text-100 text-sm mt-1">Flujo completo de 4 pasos. Spinner de cálculo, conversión en tiempo real, settings layout en formulario y confirmación.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['Quote', 'Details', 'Review', 'Fund', 'Spinner', 'Banderas', 'Settings layout'].map(tag => (
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
            <CBApp onExit={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
