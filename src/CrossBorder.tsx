// ─────────────────────────────────────────────────────────────────────────────
// CrossBorder v1.0 — Prototipo de transferencia internacional
// Flujo: Quote → Details → Review → Confirm → Fund
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useReducer, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarCircleStrokeRounded, UserMultiple4StrokeRounded,
  ChevronDownStrokeRounded, ChevronLeftStrokeRounded,
  ArrowRightStrokeRounded, CheckStrokeRounded,
  CheckCircle1StrokeRounded, RefreshDollar1StrokeRounded,
  Bolt2StrokeRounded, QuestionMarkCircleStrokeRounded,
  Locked1StrokeRounded, Layers1StrokeRounded, Wallet1StrokeRounded,
} from '@lineiconshq/free-icons';

import LogoDefault from './assets/logo-default.svg';
import { Button } from './components/core/button';
import { Badge } from './components/core/badge';
import { Avatar } from './components/core/avatar';
import { Modal } from './components/core/modal';

// ─── Currency data ────────────────────────────────────────────────────────────
type CurrencyCode = 'MXN' | 'USD' | 'EUR' | 'USDC/S' | 'USDC/P' | 'USDT/P';

type Currency = {
  code: CurrencyCode;
  label: string;
  flag?: string;           // ISO code para flag-icons
  isCrypto?: boolean;
  cryptoColor?: string;    // gradient class para cripto badges
};

const CURRENCIES: Currency[] = [
  { code: 'MXN',    label: 'Mexican Peso',   flag: 'mx' },
  { code: 'USD',    label: 'US Dollar',      flag: 'us' },
  { code: 'EUR',    label: 'Euro',           flag: 'eu' },
  { code: 'USDC/S', label: 'USDC on Solana', isCrypto: true, cryptoColor: 'from-blue-400 to-blue-600' },
  { code: 'USDC/P', label: 'USDC on Polygon', isCrypto: true, cryptoColor: 'from-purple-400 to-purple-600' },
  { code: 'USDT/P', label: 'USDT on Polygon', isCrypto: true, cryptoColor: 'from-emerald-400 to-emerald-600' },
];

// Tipo de cambio fijo de demo
const RATE_MXN_USD = 0.056;
const PROCESSING_FEE_MXN = 258.6685;

// ─── Currency Token (bandera/cripto) ──────────────────────────────────────────
function CurrencyToken({ currency, size = 22 }: { currency: Currency; size?: number }) {
  if (currency.isCrypto) {
    return (
      <div
        className={`rounded-full bg-gradient-to-br ${currency.cryptoColor} flex items-center justify-center text-white font-bold shrink-0`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {currency.code.split('/')[0].slice(0, 1)}
      </div>
    );
  }
  return (
    <span
      className={`fi fi-${currency.flag} rounded-full shrink-0`}
      style={{
        width: size,
        height: size,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'inline-block',
      }}
    />
  );
}

// ─── Currency Selector con portal ────────────────────────────────────────────

function CurrencySelector({
  value, onChange, exclude,
}: { value: CurrencyCode | null; onChange: (c: CurrencyCode) => void; exclude?: CurrencyCode | null }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const selected = CURRENCIES.find(c => c.code === value);
  const options = CURRENCIES.filter(c => c.code !== exclude);

  const handleOpen = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 8, left: r.left, width: Math.max(r.width, 200) });
    }
    setOpen(v => !v);
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 h-full min-w-[130px] transition hover:bg-background-soft-100 rounded-l-xl"
      >
        {selected ? (
          <>
            <CurrencyToken currency={selected} size={22} />
            <span className="text-title-50 text-sm font-semibold">{selected.code}</span>
          </>
        ) : (
          <span className="text-text-200 text-sm">Select...</span>
        )}
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="[&_svg]:fill-none [&_path]:fill-none ml-auto">
          <ChevronDownStrokeRounded size={13} strokeWidth={1.6} className="text-text-200" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && createPortal(
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              style={{ position: 'fixed', top: pos.top, left: pos.left, width: 220, zIndex: 9999 }}
              className="rounded-xl border border-base-100 bg-background-50 shadow-2xl p-1.5"
            >
              {options.map(c => (
                <button
                  key={c.code}
                  onClick={() => { onChange(c.code); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition hover:bg-background-soft-50 ${value === c.code ? 'bg-primary-500/5' : ''}`}
                >
                  <CurrencyToken currency={c} size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="text-title-50 text-sm font-medium">{c.code}</p>
                    <p className="text-text-200 text-[11px] truncate">{c.label}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          </>,
          document.body
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Stepper — estilo Tailgrids ───────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4;
const STEPS = [
  { id: 1, label: 'Quote' },
  { id: 2, label: 'Details' },
  { id: 3, label: 'Review' },
  { id: 4, label: 'Fund' },
] as const;

function Stepper({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, i) => {
        const isActive    = step.id === current;
        const isCompleted = step.id < current;
        return (
          <div key={step.id} className="flex items-center gap-1">
            <div className="flex items-center gap-2">
              <div className={`size-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                isActive    ? 'bg-primary-500 text-white' :
                isCompleted ? 'bg-primary-500 text-white' :
                              'bg-background-soft-100 text-text-200 border border-base-200'
              }`}>
                {isCompleted
                  ? <span className="[&_svg]:fill-none [&_path]:fill-none"><CheckStrokeRounded size={12} strokeWidth={2.2} /></span>
                  : step.id
                }
              </div>
              <span className={`text-sm font-medium transition-colors whitespace-nowrap ${
                isActive    ? 'text-primary-500' :
                isCompleted ? 'text-title-50' :
                              'text-text-200'
              }`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span className={`mx-2 [&_svg]:fill-none [&_path]:fill-none transition-colors ${
                step.id < current ? 'text-primary-500' : 'text-text-200'
              }`}>
                <ArrowRightStrokeRounded size={14} strokeWidth={1.6} />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── State global del flow ────────────────────────────────────────────────────
type FlowState = {
  step: Step;
  from: CurrencyCode | null;
  to: CurrencyCode | null;
  fromAmount: string;
  toAmount: string;
  country: string;
  firstName: string;
  middleName: string;
  firstLastName: string;
  secondLastName: string;
  alias: string;
  accountNumber: string;
  bank: string;
  fundingMethod: 'monato' | 'spei' | null;
  selectedAccount: string | null;
};

type FlowAction =
  | { type: 'set'; field: keyof FlowState; value: string | null | Step }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'goto'; step: Step }
  | { type: 'reset' };

const initialState: FlowState = {
  step: 1,
  from: 'MXN',
  to: 'USD',
  fromAmount: '',
  toAmount: '',
  country: 'US',
  firstName: '',
  middleName: '',
  firstLastName: '',
  secondLastName: '',
  alias: '',
  accountNumber: '',
  bank: '',
  fundingMethod: null,
  selectedAccount: null,
};

function reducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'set':  return { ...state, [action.field]: action.value };
    case 'next': return { ...state, step: Math.min(4, state.step + 1) as Step };
    case 'back': return { ...state, step: Math.max(1, state.step - 1) as Step };
    case 'goto': return { ...state, step: action.step };
    case 'reset': return initialState;
  }
}

// ─── Quote Screen (Step 1) ────────────────────────────────────────────────────
function QuoteScreen({ state, dispatch }: { state: FlowState; dispatch: React.Dispatch<FlowAction> }) {
  const both = !!(state.from && state.to);
  const hasAmount = both && (state.fromAmount !== '' || state.toAmount !== '');

  const handleFromChange = (v: string) => {
    const clean = v.replace(/[^\d.]/g, '');
    dispatch({ type: 'set', field: 'fromAmount', value: clean });
    if (clean && both) {
      const num = parseFloat(clean) || 0;
      dispatch({ type: 'set', field: 'toAmount', value: (num * RATE_MXN_USD).toFixed(2) });
    } else if (!clean) {
      dispatch({ type: 'set', field: 'toAmount', value: '' });
    }
  };

  const handleToChange = (v: string) => {
    const clean = v.replace(/[^\d.]/g, '');
    dispatch({ type: 'set', field: 'toAmount', value: clean });
    if (clean && both) {
      const num = parseFloat(clean) || 0;
      dispatch({ type: 'set', field: 'fromAmount', value: (num / RATE_MXN_USD).toFixed(2) });
    } else if (!clean) {
      dispatch({ type: 'set', field: 'fromAmount', value: '' });
    }
  };

  const swap = () => {
    const f = state.from, t = state.to, fa = state.fromAmount, ta = state.toAmount;
    dispatch({ type: 'set', field: 'from', value: t });
    dispatch({ type: 'set', field: 'to', value: f });
    dispatch({ type: 'set', field: 'fromAmount', value: ta });
    dispatch({ type: 'set', field: 'toAmount', value: fa });
  };

  return (
    <div className="max-w-xl w-full mx-auto py-10 px-4">
      {/* Cards */}
      <div className="relative space-y-2">
        {/* From card */}
        <div className="rounded-2xl border border-base-100 bg-background-50 p-5 shadow-sm">
          <p className="text-text-200 text-xs font-medium mb-3">You pay</p>
          <div className="flex items-center justify-between gap-4">
            <input
              value={state.fromAmount}
              onChange={e => handleFromChange(e.target.value)}
              placeholder="0.00"
              className="flex-1 text-4xl font-bold text-title-50 bg-transparent focus:outline-none placeholder:text-base-200 w-0"
            />
            <div className="rounded-xl border border-base-100 bg-background-soft-50 overflow-visible h-12 flex items-stretch shrink-0 min-w-[140px]">
              <CurrencySelector
                value={state.from}
                onChange={v => dispatch({ type: 'set', field: 'from', value: v })}
                exclude={state.to}
              />
            </div>
          </div>
          {both && state.fromAmount && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-text-200 text-xs mt-3">
              Includes processing fee: ${PROCESSING_FEE_MXN.toFixed(4)} {state.from}
            </motion.p>
          )}
        </div>

        {/* Swap button centrado entre cards */}
        <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10" style={{ top: '50%' }}>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={swap}
            className="flex items-center gap-1.5 h-8 px-4 rounded-full border border-base-200 bg-background-50 text-xs font-medium text-title-50 shadow-md hover:shadow-lg transition"
          >
            <span className="[&_svg]:fill-none [&_path]:fill-none text-primary-500">
              <RefreshDollar1StrokeRounded size={13} strokeWidth={1.6} />
            </span>
            Swap
          </motion.button>
        </div>

        {/* To card */}
        <div className="rounded-2xl border border-base-100 bg-background-50 p-5 shadow-sm">
          <p className="text-text-200 text-xs font-medium mb-3">Recipient gets</p>
          <div className="flex items-center justify-between gap-4">
            <input
              value={state.toAmount}
              onChange={e => handleToChange(e.target.value)}
              placeholder="0.00"
              className="flex-1 text-4xl font-bold text-title-50 bg-transparent focus:outline-none placeholder:text-base-200 w-0"
            />
            <div className="rounded-xl border border-base-100 bg-background-soft-50 overflow-visible h-12 flex items-stretch shrink-0 min-w-[140px]">
              <CurrencySelector
                value={state.to}
                onChange={v => dispatch({ type: 'set', field: 'to', value: v })}
                exclude={state.from}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      <AnimatePresence>
        {hasAmount && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
          >
            <div className="flex gap-2.5 rounded-xl border border-yellow-200 bg-yellow-50 px-3.5 py-3">
              <span className="[&_svg]:fill-none [&_path]:fill-none shrink-0 mt-0.5">
                <QuestionMarkCircleStrokeRounded size={14} strokeWidth={1.6} className="text-yellow-600" />
              </span>
              <p className="text-yellow-800 text-xs leading-relaxed">
                The exchange rate is dynamic. Once you review details and agree, this quote will expire in 2 hrs.{' '}
                <a href="#" className="underline font-medium">Read more</a> about after-hours rates.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rate */}
      <p className="text-text-100 text-xs text-center mt-5">
        Currency Rate:{' '}
        {hasAmount
          ? <span className="text-title-50 font-medium">$1 {state.from} = ${RATE_MXN_USD} {state.to}</span>
          : <span className="text-text-200">--</span>
        }
      </p>

      {/* Continue */}
      <div className="mt-7">
        <Button
          size="lg"
          disabled={!hasAmount}
          onClick={() => dispatch({ type: 'next' })}
          className="rounded-full w-full"
        >
          Continue
          <span className="[&_svg]:fill-none [&_path]:fill-none ml-1">
            <ArrowRightStrokeRounded size={14} strokeWidth={1.6} />
          </span>
        </Button>
      </div>
    </div>
  );
}

// ─── Details Screen (Step 2) ──────────────────────────────────────────────────
const COUNTRIES = [
  { code: 'US', label: 'United States', flag: 'us' },
  { code: 'MX', label: 'Mexico',        flag: 'mx' },
  { code: 'EU', label: 'Eurozone',      flag: 'eu' },
];

const BANKS = ['Banco Banorte', 'Bancomer', 'Citibanamex', 'HSBC', 'Santander', 'JPMorgan Chase Bank', 'Fincopay'];

function FormInput({
  label, value, onChange, placeholder, optional, error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  optional?: boolean;
  error?: string;
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
          error ? 'border-red-500 focus:border-red-500' : 'border-base-100 focus:border-primary-500'
        }`}
      />
      {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
    </div>
  );
}

function CountrySelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = COUNTRIES.find(c => c.code === value);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full h-10 rounded-xl border border-base-100 px-3.5 bg-background-50 flex items-center gap-2.5 text-left transition hover:border-primary-500/30"
      >
        {selected && (
          <span
            className={`fi fi-${selected.flag} rounded-full shrink-0`}
            style={{ width: 18, height: 18, backgroundSize: 'cover', display: 'inline-block' }}
          />
        )}
        <span className="flex-1 text-sm text-title-50">{selected?.label}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="[&_svg]:fill-none [&_path]:fill-none">
          <ChevronDownStrokeRounded size={13} strokeWidth={1.6} className="text-text-200" />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-base-100 bg-background-50 shadow-xl z-[999] p-1.5"
            >
              {COUNTRIES.map(c => (
                <button
                  key={c.code}
                  onClick={() => { onChange(c.code); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-background-soft-50 transition"
                >
                  <span className={`fi fi-${c.flag} rounded-full`} style={{ width: 18, height: 18, backgroundSize: 'cover', display: 'inline-block' }} />
                  <span className="text-sm text-title-50">{c.label}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function BankSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full h-10 rounded-xl border border-base-100 px-3.5 bg-background-50 flex items-center gap-2.5 text-left transition hover:border-primary-500/30"
      >
        <span className={`flex-1 text-sm ${value ? 'text-title-50' : 'text-text-200'}`}>
          {value || 'Ex. Banco Banorte'}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="[&_svg]:fill-none [&_path]:fill-none">
          <ChevronDownStrokeRounded size={13} strokeWidth={1.6} className="text-text-200" />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-base-100 bg-background-50 shadow-xl z-[999] p-1.5 max-h-64 overflow-y-auto"
            >
              {BANKS.map(b => (
                <button
                  key={b}
                  onClick={() => { onChange(b); setOpen(false); }}
                  className="w-full px-3 py-2 rounded-lg text-left text-sm text-title-50 hover:bg-background-soft-50 transition"
                >
                  {b}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailsScreen({ state, dispatch }: { state: FlowState; dispatch: React.Dispatch<FlowAction> }) {
  const [accountTouched, setAccountTouched] = useState(false);
  const accountValid = /^\d{8,18}$/.test(state.accountNumber);
  const showAccountError = accountTouched && state.accountNumber.length > 0 && !accountValid;

  const canContinue = state.firstName && state.firstLastName && accountValid && state.bank;

  return (
    <div className="max-w-lg w-full mx-auto py-10 px-4">

      {/* Back */}
      <motion.button
        whileHover={{ x: -2 }}
        onClick={() => dispatch({ type: 'back' })}
        className="flex items-center text-primary-500 mb-6"
      >
        <span className="[&_svg]:fill-none [&_path]:fill-none">
          <ChevronLeftStrokeRounded size={18} strokeWidth={1.8} />
        </span>
      </motion.button>

      <h2 className="text-title-50 text-2xl font-semibold">Who are you going to send it to?</h2>

      <div className="mt-6 space-y-5">
        {/* Country */}
        <div>
          <label className="text-text-50 text-xs font-medium mb-1.5 block">Country of destination</label>
          <CountrySelector
            value={state.country}
            onChange={v => dispatch({ type: 'set', field: 'country', value: v })}
          />
        </div>

        {/* Personal data */}
        <div>
          <h3 className="text-title-50 text-sm font-semibold mb-3">Personal data</h3>
          <div className="space-y-3">
            <FormInput label="First name"       value={state.firstName}      onChange={v => dispatch({ type: 'set', field: 'firstName',      value: v })} placeholder="Ex. Roberto" />
            <FormInput label="Middle name"      value={state.middleName}     onChange={v => dispatch({ type: 'set', field: 'middleName',     value: v })} placeholder="Ex. Felipe" />
            <FormInput label="First last name"  value={state.firstLastName}  onChange={v => dispatch({ type: 'set', field: 'firstLastName',  value: v })} placeholder="Ex. Lopez" />
            <FormInput label="Second last name" value={state.secondLastName} onChange={v => dispatch({ type: 'set', field: 'secondLastName', value: v })} placeholder="Ex. Perez" />
            <FormInput label="Alias"            value={state.alias}          onChange={v => dispatch({ type: 'set', field: 'alias',          value: v })} placeholder="Ex. Rob Main Account" optional />
          </div>
        </div>

        {/* Bank details */}
        <div>
          <h3 className="text-title-50 text-sm font-semibold mb-3">Bank details</h3>
          <div className="space-y-3">
            <FormInput
              label="Account Number"
              value={state.accountNumber}
              onChange={v => { dispatch({ type: 'set', field: 'accountNumber', value: v }); setAccountTouched(true); }}
              placeholder={showAccountError ? 'Please enter a valid number' : 'Ex. 734180999000000006'}
              error={showAccountError ? 'Please enter a valid number' : undefined}
            />
            <div>
              <label className="text-text-50 text-xs font-medium mb-1.5 block">Bank</label>
              <BankSelector value={state.bank} onChange={v => dispatch({ type: 'set', field: 'bank', value: v })} />
            </div>
          </div>
        </div>

        {/* Continue */}
        <div className="pt-2 flex justify-center">
          <Button
            size="lg"
            disabled={!canContinue}
            onClick={() => dispatch({ type: 'next' })}
            className="rounded-full px-10 w-full"
          >
            Continue
            <span className="[&_svg]:fill-none [&_path]:fill-none ml-1">
              <ArrowRightStrokeRounded size={14} strokeWidth={1.6} />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Review Screen (Step 3) ───────────────────────────────────────────────────
const MONATO_ACCOUNTS = [
  { id: 'mxn-main',  name: 'MXN Main Account',    clabe: '1234', balance: 850.00,     insufficient: true,  color: 'bg-blue-200' },
  { id: 'mxn-test',  name: 'Prueba MXN',          clabe: '1234', balance: 30.00,      insufficient: true,  color: 'bg-blue-200' },
  { id: 'mxn-ops-1', name: 'MXN Operations',      clabe: '4567', balance: 48200.00,   insufficient: false, color: 'bg-primary-500' },
  { id: 'mxn-wlt',   name: 'Wallet MXN',          clabe: '7890', balance: 8479.00,    insufficient: false, color: 'bg-orange-400' },
  { id: 'mxn-ops-2', name: 'MXN Operations',      clabe: '7890', balance: 8479.00,    insufficient: false, color: 'bg-green-500' },
];

function ReviewScreen({
  state, dispatch, onConfirmOpen,
}: { state: FlowState; dispatch: React.Dispatch<FlowAction>; onConfirmOpen: () => void }) {
  const fromCurrency = CURRENCIES.find(c => c.code === state.from)!;
  const toCurrency = CURRENCIES.find(c => c.code === state.to)!;
  const country = COUNTRIES.find(c => c.code === state.country)!;
  const fullName = [state.firstName, state.middleName, state.firstLastName, state.secondLastName].filter(Boolean).join(' ');

  return (
    <div className="max-w-lg w-full mx-auto py-10 px-4">

      <motion.button
        whileHover={{ x: -2 }}
        onClick={() => dispatch({ type: 'back' })}
        className="flex items-center text-primary-500 mb-6"
      >
        <span className="[&_svg]:fill-none [&_path]:fill-none">
          <ChevronLeftStrokeRounded size={18} strokeWidth={1.8} />
        </span>
      </motion.button>

      <h2 className="text-title-50 text-2xl font-semibold">Review details</h2>

      {/* Transfer details */}
      <div className="mt-5 pt-5 border-t border-base-100">
        <p className="text-title-50 text-sm font-semibold mb-4">Transfer details</p>

        <div className="text-center space-y-3">
          <div>
            <p className="text-text-100 text-xs">You pay</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <CurrencyToken currency={fromCurrency} size={20} />
              <p className="text-title-50 text-lg font-semibold">${state.fromAmount} {state.from}*</p>
            </div>
          </div>

          <motion.span
            initial={{ y: -3, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            className="[&_svg]:fill-none [&_path]:fill-none inline-block text-primary-500"
          >
            <ChevronDownStrokeRounded size={18} strokeWidth={1.6} />
          </motion.span>

          <div>
            <p className="text-text-100 text-xs">{state.firstName || 'Recipient'} gets</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <CurrencyToken currency={toCurrency} size={20} />
              <p className="text-title-50 text-lg font-semibold">{state.to} ${state.toAmount}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-1.5 text-xs">
          <div className="flex justify-between"><span className="text-text-100">Includes processing fee*</span><span className="text-title-50">-${PROCESSING_FEE_MXN.toFixed(4)} {state.from}</span></div>
          <div className="flex justify-between"><span className="text-text-100">Currency Rate</span><span className="text-title-50">$1 {state.from} = ${RATE_MXN_USD} {state.to}</span></div>
        </div>
      </div>

      {/* Funding method */}
      <div className="mt-6 pt-6 border-t border-base-100">
        <p className="text-title-50 text-sm font-semibold mb-3">Funding method</p>

        <div className="space-y-2.5">
          {/* Monato account option */}
          <motion.div
            initial={false}
            animate={{ borderColor: state.fundingMethod === 'monato' ? '#0894c8' : '#f4f4f5' }}
            className="rounded-xl border bg-background-50 overflow-hidden"
          >
            <button
              onClick={() => dispatch({ type: 'set', field: 'fundingMethod', value: 'monato' })}
              className="w-full flex items-start gap-3 p-3.5 text-left"
            >
              <div className={`size-4 rounded-full border-2 mt-0.5 shrink-0 transition ${
                state.fundingMethod === 'monato' ? 'border-primary-500 bg-primary-500' : 'border-base-200'
              }`}>
                {state.fundingMethod === 'monato' && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="size-full rounded-full flex items-center justify-center">
                    <span className="size-1.5 rounded-full bg-white" />
                  </motion.div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="size-7 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
                    <span className="[&_svg]:fill-none [&_path]:fill-none">
                      <Wallet1StrokeRounded size={13} strokeWidth={1.4} className="text-primary-500" />
                    </span>
                  </span>
                  <p className="text-title-50 text-sm font-medium">Fund from my Monato account</p>
                  <Badge color="success" size="sm" className="text-[10px]">
                    <span className="[&_svg]:fill-none [&_path]:fill-none mr-0.5">
                      <Bolt2StrokeRounded size={9} strokeWidth={2} />
                    </span>
                    INSTANT
                  </Badge>
                </div>
                <p className="text-text-100 text-xs mt-1.5 leading-relaxed">
                  Keep your balance ready by adding funds according to your daily volume needs.
                </p>
                <p className="text-primary-500 text-[11px] mt-1.5 font-medium">Available immediately · No fees</p>
              </div>
            </button>

            <AnimatePresence>
              {state.fundingMethod === 'monato' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-base-100"
                >
                  <div className="p-3.5 space-y-2 bg-background-soft-50/40">
                    {MONATO_ACCOUNTS.map(acc => {
                      const isSelected = state.selectedAccount === acc.id;
                      return (
                        <motion.button
                          key={acc.id}
                          disabled={acc.insufficient}
                          onClick={() => dispatch({ type: 'set', field: 'selectedAccount', value: acc.id })}
                          whileHover={!acc.insufficient ? { scale: 1.01 } : {}}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition text-left ${
                            acc.insufficient
                              ? 'opacity-50 cursor-not-allowed'
                              : isSelected
                              ? 'bg-primary-500/5 border border-primary-500/30'
                              : 'border border-transparent hover:bg-background-50'
                          }`}
                        >
                          <div className={`size-7 rounded-full ${acc.color} flex items-center justify-center text-white text-[9px] font-bold shrink-0`}>
                            MXN
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-title-50 text-xs font-medium">{acc.name}</p>
                            <p className="text-text-200 text-[10px]">CLABE: **** {acc.clabe}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-xs font-semibold ${acc.insufficient ? 'text-text-200 line-through' : 'text-title-50'}`}>
                              ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} MXN
                            </p>
                            {acc.insufficient && <p className="text-red-500 text-[10px]">Insufficient balance</p>}
                          </div>
                        </motion.button>
                      );
                    })}

                    {/* Pagination dummy */}
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button className="size-6 rounded-md border border-base-100 flex items-center justify-center text-text-200 hover:bg-background-50 transition">
                        <span className="[&_svg]:fill-none [&_path]:fill-none">
                          <ChevronLeftStrokeRounded size={11} strokeWidth={1.6} />
                        </span>
                      </button>
                      <span className="text-[11px] text-text-100">1 de 1</span>
                      <button className="size-6 rounded-md border border-base-100 flex items-center justify-center text-text-200 hover:bg-background-50 transition">
                        <span className="[&_svg]:fill-none [&_path]:fill-none">
                          <ArrowRightStrokeRounded size={11} strokeWidth={1.6} />
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* SPEI option */}
          <motion.button
            initial={false}
            animate={{ borderColor: state.fundingMethod === 'spei' ? '#0894c8' : '#f4f4f5' }}
            onClick={() => dispatch({ type: 'set', field: 'fundingMethod', value: 'spei' })}
            className="w-full flex items-start gap-3 p-3.5 text-left rounded-xl border bg-background-50"
          >
            <div className={`size-4 rounded-full border-2 mt-0.5 shrink-0 transition ${
              state.fundingMethod === 'spei' ? 'border-primary-500 bg-primary-500' : 'border-base-200'
            }`}>
              {state.fundingMethod === 'spei' && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="size-full rounded-full flex items-center justify-center">
                  <span className="size-1.5 rounded-full bg-white" />
                </motion.div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="size-7 rounded-lg bg-background-soft-100 flex items-center justify-center shrink-0">
                  <span className="[&_svg]:fill-none [&_path]:fill-none">
                    <Wallet1StrokeRounded size={13} strokeWidth={1.4} className="text-text-100" />
                  </span>
                </span>
                <p className="text-title-50 text-sm font-medium">Fund with external SPEI transfer</p>
              </div>
              <p className="text-text-100 text-xs mt-1.5 leading-relaxed">
                We'll give you a CLABE account to transfer from your bank.
              </p>
              <p className="text-primary-500 text-[11px] mt-1.5 font-medium">Usually 1–2 min · Standard SPEI fees apply</p>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Recipient details */}
      <div className="mt-6 pt-6 border-t border-base-100">
        <p className="text-title-50 text-sm font-semibold mb-3">Recipient details</p>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-text-100">Name of the account holder</span><span className="text-title-50">{fullName || '—'}</span></div>
          <div className="flex justify-between"><span className="text-text-100">Country</span><span className="text-title-50">{country.label}</span></div>
          <div className="flex justify-between"><span className="text-text-100">Account Number</span><span className="text-title-50">{state.accountNumber}</span></div>
          <div className="flex justify-between"><span className="text-text-100">Bank Name</span><span className="text-title-50">{state.bank}</span></div>
        </div>
      </div>

      {/* Lock alert */}
      <div className="mt-5 flex gap-2.5 rounded-xl border border-yellow-200 bg-yellow-50 px-3.5 py-3">
        <span className="[&_svg]:fill-none [&_path]:fill-none shrink-0 mt-0.5">
          <Locked1StrokeRounded size={13} strokeWidth={1.6} className="text-yellow-600" />
        </span>
        <p className="text-yellow-800 text-xs leading-relaxed">
          The exchange rate will be locked for 2 hours after you agree with the quote and details.{' '}
          <a href="#" className="underline font-medium">Read more</a> about after-hours rates.
        </p>
      </div>

      {/* Continue */}
      <div className="mt-6 flex justify-center">
        <Button
          size="lg"
          disabled={!state.fundingMethod || (state.fundingMethod === 'monato' && !state.selectedAccount)}
          onClick={onConfirmOpen}
          className="rounded-full px-10 w-full"
        >
          Continue
          <span className="[&_svg]:fill-none [&_path]:fill-none ml-1">
            <ArrowRightStrokeRounded size={14} strokeWidth={1.6} />
          </span>
        </Button>
      </div>
    </div>
  );
}

// ─── Fund Screen (Step 4 — success) ───────────────────────────────────────────
function FundScreen({ state, dispatch, onExit }: {
  state: FlowState;
  dispatch: React.Dispatch<FlowAction>;
  onExit: () => void;
}) {
  const fromCurrency = CURRENCIES.find(c => c.code === state.from)!;
  const toCurrency = CURRENCIES.find(c => c.code === state.to)!;
  const account = MONATO_ACCOUNTS.find(a => a.id === state.selectedAccount);

  return (
    <div className="max-w-lg w-full mx-auto py-10 px-4">

      {/* Success header */}
      <div className="text-center">
        <h2 className="text-title-50 text-xl font-semibold">Payment initiated</h2>
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
          className="mt-4 inline-flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/30"
        >
          <span className="[&_svg]:fill-none [&_path]:fill-none">
            <CheckCircle1StrokeRounded size={32} strokeWidth={1.8} className="text-white" />
          </span>
        </motion.div>
        <p className="text-text-100 text-sm mt-4 leading-relaxed max-w-sm mx-auto">
          Your balance has been successfully used to fund this transaction. We are now processing your cross-border payment,
          and it will be completed shortly.
        </p>
      </div>

      {/* Transfer details */}
      <div className="mt-7 pt-6 border-t border-base-100">
        <p className="text-title-50 text-sm font-semibold mb-4">Transfer details</p>
        <div className="text-center space-y-3">
          <div>
            <p className="text-text-100 text-xs">You pay</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <CurrencyToken currency={fromCurrency} size={20} />
              <p className="text-title-50 text-lg font-semibold">${state.fromAmount} {state.from}*</p>
            </div>
          </div>
          <motion.span initial={{ y: -3, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="[&_svg]:fill-none [&_path]:fill-none inline-block text-primary-500"
          >
            <ChevronDownStrokeRounded size={18} strokeWidth={1.6} />
          </motion.span>
          <div>
            <p className="text-text-100 text-xs">{state.firstName || 'Recipient'} gets</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <CurrencyToken currency={toCurrency} size={20} />
              <p className="text-title-50 text-lg font-semibold">{state.to} ${state.toAmount}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 space-y-1.5 text-xs">
          <div className="flex justify-between"><span className="text-text-100">Includes processing fee*</span><span className="text-title-50">-${PROCESSING_FEE_MXN.toFixed(4)} {state.from}</span></div>
          <div className="flex justify-between"><span className="text-text-100">Currency Rate</span><span className="text-title-50">$1 {state.from} = ${RATE_MXN_USD} {state.to}</span></div>
        </div>
      </div>

      {/* Funding details */}
      {account && (
        <div className="mt-6 pt-6 border-t border-base-100">
          <p className="text-title-50 text-sm font-semibold mb-3">Funding details</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-text-100">Name of the account</span><span className="text-title-50">{account.name}</span></div>
            <div className="flex justify-between"><span className="text-text-100">CLABE account</span><span className="text-title-50">**** {account.clabe}</span></div>
            <div className="flex justify-between"><span className="text-text-100">Bank</span><span className="text-title-50">Fincopay</span></div>
          </div>
        </div>
      )}

      {/* Lock alert */}
      <div className="mt-5 flex gap-2.5 rounded-xl border border-yellow-200 bg-yellow-50 px-3.5 py-3">
        <span className="[&_svg]:fill-none [&_path]:fill-none shrink-0 mt-0.5">
          <Locked1StrokeRounded size={13} strokeWidth={1.6} className="text-yellow-600" />
        </span>
        <p className="text-yellow-800 text-xs leading-relaxed">
          The exchange rate will be locked for 2 hours after details are saved.{' '}
          <a href="#" className="underline font-medium">Read more</a> about after-hours rates.
        </p>
      </div>

      {/* Got it */}
      <div className="mt-6 flex justify-center">
        <Button
          size="lg"
          onClick={() => { dispatch({ type: 'reset' }); onExit(); }}
          className="rounded-full px-10 w-full"
        >
          Got it
        </Button>
      </div>
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} onClose={onCancel}>
      <div className="w-full max-w-sm rounded-2xl bg-background-50 shadow-xl p-6 text-center">
        <h3 className="text-title-50 text-lg font-semibold">Confirm the operation</h3>
        <p className="text-text-100 text-sm mt-2">Are you sure you want to continue?</p>
        <div className="mt-6 flex gap-3">
          <Button appearance="outline" className="flex-1 rounded-full" onClick={onCancel}>Cancel</Button>
          <Button className="flex-1 rounded-full" onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
type SidebarItem = 'quote' | 'transactions' | 'accounts';

function CBSidebar({ active }: { active: SidebarItem }) {
  const items = [
    { id: 'quote'        as const, label: 'Quote',            icon: DollarCircleStrokeRounded,    disabled: false },
    { id: 'transactions' as const, label: 'All transactions', icon: Layers1StrokeRounded,         disabled: true  },
    { id: 'accounts'     as const, label: 'Accounts',         icon: UserMultiple4StrokeRounded,   disabled: true  },
  ];

  return (
    <aside className="h-full w-60 shrink-0 flex flex-col border-r border-base-100 bg-background-50">
      <div className="flex items-center gap-2 border-b border-base-100 px-5 py-3.5">
        <img src={LogoDefault} alt="monato" className="h-5 w-auto" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map(({ id, label, icon: Icon, disabled }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              disabled={disabled}
              className={[
                'w-full relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-colors',
                isActive
                  ? 'text-primary-500 font-medium'
                  : disabled
                  ? 'text-text-200 opacity-50 cursor-not-allowed'
                  : 'text-text-50 hover:bg-background-soft-50',
              ].join(' ')}
            >
              {isActive && (
                <motion.div
                  layoutId="cb-nav-bg"
                  className="absolute inset-0 rounded-lg bg-primary-500/10"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <span className="[&_svg]:fill-none [&_path]:fill-none relative z-10">
                <Icon size={15} strokeWidth={1.4} className={isActive ? 'text-primary-500' : 'text-text-200'} />
              </span>
              <span className="relative z-10">{label}</span>
              {disabled && (
                <Badge color="gray" size="sm" className="ml-auto relative z-10 text-[9px]">Pronto</Badge>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-base-100 px-4 py-3 flex items-center gap-2.5">
        <Avatar size="sm" fallback="KM" />
        <div className="min-w-0">
          <p className="text-title-50 text-xs font-medium truncate">Kathryn Murphy</p>
          <p className="text-text-200 text-[11px] truncate">murphy.mitc@example.com</p>
        </div>
      </div>
    </aside>
  );
}

// ─── Mac Desktop wrapper ──────────────────────────────────────────────────────
function CBDesktop({ onExit }: { onExit: () => void }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const ScreenComponent = (() => {
    switch (state.step) {
      case 1: return <QuoteScreen state={state} dispatch={dispatch} />;
      case 2: return <DetailsScreen state={state} dispatch={dispatch} />;
      case 3: return <ReviewScreen state={state} dispatch={dispatch} onConfirmOpen={() => setConfirmOpen(true)} />;
      case 4: return <FundScreen state={state} dispatch={dispatch} onExit={onExit} />;
    }
  })();

  return (
    <div className="w-full h-full overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-[1440px] rounded-xl shadow-2xl flex flex-col border border-white/10 relative overflow-clip"
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
            <span className="text-white/40 text-[11px]">CrossBorder — Monato · {STEPS[state.step - 1].label}</span>
          </div>
        </div>

        {/* App */}
        <div className="flex-1 flex overflow-hidden bg-background-50">
          <CBSidebar active="quote" />

          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Header con logo + stepper centrado — estilo PDF */}
            <div className="bg-background-50 border-b border-base-100 px-6 py-3 flex items-center shrink-0">
              <img src={LogoDefault} alt="monato" className="h-5 w-auto" />
              <div className="flex-1 flex justify-center">
                <Stepper current={state.step} />
              </div>
              <div className="w-24" />
            </div>

            {/* Screens */}
            <div className="flex-1 overflow-y-auto bg-background-soft-50/30">
              <AnimatePresence mode="wait">
                <motion.div
                  key={state.step}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  {ScreenComponent}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>

        {/* Confirm modal */}
        <ConfirmModal
          open={confirmOpen}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => { setConfirmOpen(false); dispatch({ type: 'next' }); }}
        />
      </motion.div>
    </div>
  );
}

// ─── Entry point del proto ────────────────────────────────────────────────────
export function CrossBorderPrototype() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Preview card — misma estructura que CLP */}
      <div className="rounded-xl border border-base-100 bg-background-50 overflow-hidden">
        <div className="border-b border-base-100 bg-background-soft-50 px-4 py-2.5 flex items-center justify-between">
          <span className="text-text-200 text-[11px] font-medium uppercase tracking-widest">CrossBorder v1.0 — Prototipo navegable</span>
          <Badge color="primary" size="sm">Prototype</Badge>
        </div>
        <div className="p-6 flex items-center gap-6">
          {/* Thumbnail */}
          <div className="relative w-72 h-44 rounded-lg overflow-hidden border border-base-100 bg-background-soft-50 shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <div className="w-48 h-32 rounded-lg bg-background-50 shadow-xl overflow-hidden border border-white/10 flex flex-col">
                <div className="h-4 bg-[#1e1e1e] flex items-center px-2 gap-1">
                  <div className="size-1.5 rounded-full bg-red-500" />
                  <div className="size-1.5 rounded-full bg-yellow-500" />
                  <div className="size-1.5 rounded-full bg-green-500" />
                </div>
                <div className="flex flex-1 overflow-hidden">
                  <div className="w-12 border-r border-base-100 bg-background-50 p-1.5 flex flex-col gap-1">
                    <div className="h-2 bg-primary-500/20 rounded" />
                    <div className="h-1.5 bg-base-100 rounded" />
                    <div className="h-1.5 bg-base-100 rounded" />
                  </div>
                  <div className="flex-1 p-2 space-y-1.5">
                    {/* Stepper mini */}
                    <div className="flex items-center gap-1">
                      <div className="size-2 rounded-full bg-primary-500" />
                      <div className="flex-1 h-px bg-base-100" />
                      <div className="size-2 rounded-full bg-base-200" />
                      <div className="flex-1 h-px bg-base-100" />
                      <div className="size-2 rounded-full bg-base-200" />
                    </div>
                    {/* Currency fields */}
                    <div className="h-5 bg-base-100 rounded flex items-center px-1 gap-1">
                      <div className="size-2 rounded-full bg-green-400" />
                      <div className="flex-1 h-1 bg-base-200 rounded" />
                    </div>
                    <div className="h-5 bg-base-100 rounded flex items-center px-1 gap-1">
                      <div className="size-2 rounded-full bg-blue-400" />
                      <div className="flex-1 h-1 bg-base-200 rounded" />
                    </div>
                    <div className="h-4 bg-primary-500 rounded w-2/3 mx-auto" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-title-50 text-base font-semibold">CrossBorder — Transferencia Internacional</h3>
              <p className="text-text-100 text-sm mt-1">Flujo completo de 4 pasos: cotización con conversión bidireccional MXN/USD/EUR/Cripto, datos del destinatario, revisión con selección de cuenta y confirmación.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['Quote', 'Details', 'Review', 'Fund', 'Banderas', 'Swap', 'Confirm modal'].map(tag => (
                <Badge key={tag} color="gray" size="sm">{tag}</Badge>
              ))}
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button onClick={() => setOpen(true)}>
                <span className="[&_svg]:fill-none [&_path]:fill-none">
                  <DollarCircleStrokeRounded size={14} strokeWidth={1.4} />
                </span>
                Abrir prototipo
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Fullscreen proto */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
          >
            <CBDesktop onExit={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
