// ─────────────────────────────────────────────────────────────────────────────
// CrossBorder v2.0 — Réplica fiel de la interfaz del usuario
// Flujo: Quote → Details → Review → Confirm → Fund
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useReducer, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Doller, UserMultiple4, ChevronDown, ChevronLeft,
  ArrowRight, Check, CheckCircle1, RefreshCircle1Clockwise,
  QuestionMarkCircle, Locked3, Layers2,
  Home, Bell1, Gear1,
} from '@tailgrids/icons';

import LogoDefault from './assets/logo-default.png';
import { Button } from './components/core/button';
import { Badge } from './components/core/badge';
import { Avatar } from './components/core/avatar';
import { Modal } from './components/core/modal';
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

// ─── Stepper ──────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4;
const STEPS = [
  { id: 1 as Step, label: 'Quote' },
  { id: 2 as Step, label: 'Details' },
  { id: 3 as Step, label: 'Review' },
  { id: 4 as Step, label: 'Fund' },
];

function Stepper({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((step, i) => {
        const isActive    = step.id === current;
        const isCompleted = step.id < current;
        return (
          <div key={step.id} className="flex items-center gap-1.5">
            <div className="flex items-center gap-2">
              <div className={`size-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                isActive || isCompleted
                  ? 'bg-primary-500 text-white'
                  : 'bg-background-soft-100 text-text-200 border border-base-200'
              }`}>
                {isCompleted ? <Check size={11} className="text-white" /> : step.id}
              </div>
              <span className={`text-sm font-medium transition-colors ${
                isActive ? 'text-primary-500' : isCompleted ? 'text-title-50' : 'text-text-200'
              }`}>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <ArrowRight size={14} className={step.id < current ? 'text-primary-500' : 'text-text-200'} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Currency Selector con portal ────────────────────────────────────────────
function CurrencySelector({ value, onChange }: { value: CurrencyCode | null; onChange: (c: CurrencyCode) => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0 });
  const btnRef          = useRef<HTMLButtonElement>(null);
  const selected        = CURRENCIES.find(c => c.code === value);

  const handleOpen = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left });
    }
    setOpen(v => !v);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-base-200 bg-background-50 hover:bg-background-soft-50 transition min-w-[110px]"
      >
        {selected ? (
          <>
            <CurrencyToken currency={selected} size={20} />
            <span className="text-title-50 text-sm font-semibold">{selected.code}</span>
          </>
        ) : (
          <span className="text-text-200 text-sm">Select...</span>
        )}
        <ChevronDown size={13} className={`text-text-200 ml-auto transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && createPortal(
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.13 }}
              style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: 160, zIndex: 9999 }}
              className="rounded-xl border border-base-100 bg-background-50 shadow-xl p-1"
            >
              {CURRENCIES.map(c => (
                <button
                  key={c.code}
                  onClick={() => { onChange(c.code); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition hover:bg-background-soft-50 ${value === c.code ? 'bg-primary-500/5' : ''}`}
                >
                  <CurrencyToken currency={c} size={20} />
                  <span className="text-title-50 text-sm font-medium">{c.code}</span>
                </button>
              ))}
            </motion.div>
          </>,
          document.body
        )}
      </AnimatePresence>
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

// ─── Quote Screen ─────────────────────────────────────────────────────────────
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
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-10">
      <div className="w-full max-w-lg">
        <h1 className="text-title-50 text-2xl font-bold text-center">Currency Exchange</h1>
        <p className="text-text-200 text-sm text-center mt-1.5">Type in either field to get a quote.</p>

        <div className="mt-8">
          {/* FROM */}
          <div className="pb-5">
            <p className="text-text-200 text-xs font-medium mb-2">From</p>
            <div className="flex items-center justify-between gap-4">
              <input
                value={state.fromAmount}
                onChange={e => handleFromChange(e.target.value)}
                placeholder="0.00"
                className="flex-1 text-3xl font-bold text-title-50 bg-transparent focus:outline-none placeholder:text-base-200 w-0"
              />
              <CurrencySelector value={state.from} onChange={v => dispatch({ type: 'set', field: 'from', value: v })} />
            </div>
            <AnimatePresence>
              {hasAmount && state.toAmount && !state.calculating && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-1.5 mt-2 overflow-hidden"
                >
                  <QuestionMarkCircle size={13} className="text-text-200 shrink-0" />
                  <span className="text-text-200 text-xs">Plus processing fee: ${PROCESSING_FEE_MXN.toFixed(2)} {state.from}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SWAP */}
          <div className="flex justify-center items-center gap-0 border-t border-b border-base-100 py-0 -mt-px">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={swap}
              className="flex items-center gap-1.5 text-primary-500 text-xs font-medium px-3 py-2 hover:bg-primary-500/5 rounded-lg transition"
            >
              <RefreshCircle1Clockwise size={14} className="text-primary-500" />
              Swap
            </motion.button>
          </div>

          {/* TO */}
          <div className="pt-5">
            <p className="text-text-200 text-xs font-medium mb-2">To</p>
            <div className="flex items-center justify-between gap-4">
              {state.calculating ? (
                <div className="flex-1 flex items-center">
                  <DefaultSpinner size={34} percentage={70} className="animate-spin" />
                </div>
              ) : (
                <input
                  value={state.toAmount}
                  readOnly
                  placeholder="0.00"
                  className="flex-1 text-3xl font-bold text-title-50 bg-transparent focus:outline-none placeholder:text-base-200 w-0"
                />
              )}
              <CurrencySelector value={state.to} onChange={handleToSelect} />
            </div>
          </div>
        </div>

        {/* Alerta dinámica */}
        <AnimatePresence>
          {bothSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
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

        {/* Continue */}
        <div className="mt-6">
          <Button size="lg" disabled={!canContinue} onClick={() => dispatch({ type: 'next' })} className="w-full">
            Continue
          </Button>
        </div>

        {/* Currency rate — debajo del botón */}
        <AnimatePresence>
          {canContinue && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-text-200 text-xs text-center mt-3"
            >
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
          error ? 'border-red-500' : 'border-base-200 focus:border-primary-500'
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
        className="w-full h-10 rounded-xl border border-base-200 px-3.5 bg-background-50 flex items-center gap-2.5 text-left hover:border-primary-500/40 transition">
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
        className="w-full h-10 rounded-xl border border-base-200 px-3.5 bg-background-50 flex items-center text-left hover:border-primary-500/40 transition">
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
    <div className="flex-1 overflow-y-auto px-10 py-8">
      <motion.button whileHover={{ x: -2 }} onClick={() => dispatch({ type: 'back' })}
        className="flex items-center gap-1.5 text-primary-500 text-sm mb-6">
        <ChevronLeft size={16} className="text-primary-500" />
        Back
      </motion.button>

      <h2 className="text-title-50 text-xl font-bold mb-8">Who are you going to send it to?</h2>

      <div className="divide-y divide-base-100">

        {/* Country */}
        <div className="grid grid-cols-[260px_1fr] gap-12 py-8">
          <div>
            <p className="text-title-50 text-sm font-semibold">Country of destination</p>
            <p className="text-text-200 text-xs mt-1.5 leading-relaxed">Select the country where the funds will be received</p>
          </div>
          <div className="max-w-sm">
            <CountrySelector value={state.country} onChange={v => dispatch({ type: 'set', field: 'country', value: v })} />
          </div>
        </div>

        {/* Personal data */}
        <div className="grid grid-cols-[260px_1fr] gap-12 py-8">
          <div>
            <p className="text-title-50 text-sm font-semibold">Personal data</p>
            <p className="text-text-200 text-xs mt-1.5 leading-relaxed">Enter the recipient's full legal name as it appears on their ID</p>
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-xl">
            <FormInput label="First name"       value={state.firstName}      onChange={v => dispatch({ type: 'set', field: 'firstName',      value: v })} placeholder="Ex. Roberto" />
            <FormInput label="Middle name"      value={state.middleName}     onChange={v => dispatch({ type: 'set', field: 'middleName',     value: v })} placeholder="Ex. Felipe" />
            <FormInput label="First last name"  value={state.firstLastName}  onChange={v => dispatch({ type: 'set', field: 'firstLastName',  value: v })} placeholder="Ex. Lopez" />
            <FormInput label="Second last name" value={state.secondLastName} onChange={v => dispatch({ type: 'set', field: 'secondLastName', value: v })} placeholder="Ex. Perez" />
            <div className="col-span-2">
              <FormInput label="Alias" value={state.alias} onChange={v => dispatch({ type: 'set', field: 'alias', value: v })} placeholder="Ex. Rob Main Account" optional />
            </div>
          </div>
        </div>

        {/* Bank details */}
        <div className="grid grid-cols-[260px_1fr] gap-12 py-8">
          <div>
            <p className="text-title-50 text-sm font-semibold">Bank details</p>
            <p className="text-text-200 text-xs mt-1.5 leading-relaxed">Provide the recipient's banking information for the transfer</p>
          </div>
          <div className="space-y-4 max-w-xl">
            <FormInput
              label="Account Number"
              value={state.accountNumber}
              onChange={v => { dispatch({ type: 'set', field: 'accountNumber', value: v }); setAccountTouched(true); }}
              placeholder="Ex. 734180999000000006"
              error={showAccountErr ? 'Please enter a valid number' : undefined}
            />
            <div>
              <label className="text-text-50 text-xs font-medium mb-1.5 block">Bank</label>
              <BankSelector value={state.bank} onChange={v => dispatch({ type: 'set', field: 'bank', value: v })} />
            </div>
          </div>
        </div>

      </div>

      <div className="flex items-center gap-3 mt-6 pt-6 border-t border-base-100">
        <Button appearance="outline" onClick={() => dispatch({ type: 'back' })}>Back</Button>
        <Button disabled={!canContinue} onClick={() => dispatch({ type: 'next' })}>Continue</Button>
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
    <div className="flex-1 overflow-y-auto px-10 py-8">
      <motion.button whileHover={{ x: -2 }} onClick={() => dispatch({ type: 'back' })}
        className="flex items-center gap-1.5 text-primary-500 text-sm mb-6">
        <ChevronLeft size={16} className="text-primary-500" />
        Back
      </motion.button>
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
                <div className={`size-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition ${state.fundingMethod === 'monato' ? 'border-primary-500 bg-primary-500' : 'border-base-200'}`}>
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
              <div className={`size-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition ${state.fundingMethod === 'spei' ? 'border-primary-500 bg-primary-500' : 'border-base-200'}`}>
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
          <Button appearance="outline" onClick={() => dispatch({ type: 'back' })}>Back</Button>
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

// ─── Fund Screen ──────────────────────────────────────────────────────────────
function FundScreen({ state, dispatch, onExit }: {
  state: FlowState; dispatch: React.Dispatch<FlowAction>; onExit: () => void;
}) {
  const fromCurr = CURRENCIES.find(c => c.code === state.from)!;
  const toCurr   = CURRENCIES.find(c => c.code === state.to)!;
  const account  = MONATO_ACCOUNTS.find(a => a.id === state.selectedAccount);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-8 py-10">
      <div className="w-full max-w-sm text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
          className="inline-flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/30 mb-5"
        >
          <CheckCircle1 size={32} className="text-white" />
        </motion.div>

        <h2 className="text-title-50 text-xl font-bold">Payment initiated</h2>
        <p className="text-text-200 text-sm mt-2 leading-relaxed">
          Your balance has been successfully used to fund this transaction. We are now processing your cross-border payment.
        </p>

        <div className="mt-7 pt-6 border-t border-base-100 text-left space-y-5">
          <div>
            <p className="text-title-50 text-sm font-semibold mb-3">Transfer details</p>
            <div className="text-center space-y-2">
              <div>
                <p className="text-text-200 text-xs">You pay</p>
                <div className="flex items-center justify-center gap-2 mt-0.5">
                  <CurrencyToken currency={fromCurr} size={18} />
                  <p className="text-title-50 font-bold">${state.fromAmount} {state.from}*</p>
                </div>
              </div>
              <ChevronDown size={16} className="text-primary-500 mx-auto" />
              <div>
                <p className="text-text-200 text-xs">{state.firstName || 'Recipient'} gets</p>
                <div className="flex items-center justify-center gap-2 mt-0.5">
                  <CurrencyToken currency={toCurr} size={18} />
                  <p className="text-title-50 font-bold">{state.to} ${state.toAmount}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-base-100 space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-text-200">Processing fee</span><span className="text-title-50">-${PROCESSING_FEE_MXN.toFixed(2)} {state.from}</span></div>
              <div className="flex justify-between"><span className="text-text-200">Currency Rate</span><span className="text-title-50">${RATE_MXN_PER_USD.toFixed(2)} MXN = $1 USD</span></div>
            </div>
          </div>

          {account && (
            <div className="pt-4 border-t border-base-100">
              <p className="text-title-50 text-sm font-semibold mb-3">Funding details</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-text-200">Account</span><span className="text-title-50">{account.name}</span></div>
                <div className="flex justify-between"><span className="text-text-200">CLABE</span><span className="text-title-50">**** {account.clabe}</span></div>
              </div>
            </div>
          )}

          <div className="flex gap-2.5 rounded-xl border border-yellow-200 bg-yellow-50 px-3.5 py-3">
            <Locked3 size={13} className="text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-yellow-800 text-xs leading-relaxed">The exchange rate will be locked for 2 hours after details are saved.</p>
          </div>

          <Button className="w-full" onClick={() => { dispatch({ type: 'reset' }); onExit(); }}>Got it</Button>
        </div>
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
        <p className="text-text-200 text-sm mt-2">Are you sure you want to continue?</p>
        <div className="mt-6 flex gap-3">
          <Button appearance="outline" className="flex-1 rounded-full" onClick={onCancel}>Cancel</Button>
          <Button className="flex-1 rounded-full" onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function CBSidebar({ onExit: _onExit }: { onExit: () => void }) {
  const NAV = [
    { label: 'Currency exchange', icon: Doller,        active: true  },
    { label: 'Accounts',          icon: UserMultiple4, active: false },
    { label: 'All transactions',  icon: Layers2,       active: false },
  ];

  return (
    <aside className="h-full w-56 shrink-0 flex flex-col border-r border-base-100 bg-background-50">
      <div className="flex items-center justify-between border-b border-base-100 px-4 py-3.5">
        <img src={LogoDefault} alt="monato" className="h-5 w-auto" />
        <button className="text-text-200 hover:text-title-50 transition opacity-60 text-base">⊟</button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <p className="text-text-200 mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest">Main menu</p>
        {NAV.map(({ label, icon: Icon, active }) => (
          <button key={label} disabled={!active}
            className={[
              'w-full relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-colors mb-0.5',
              active ? 'text-primary-500 font-medium' : 'text-text-200 opacity-50 cursor-not-allowed',
            ].join(' ')}
          >
            {active && (
              <motion.div layoutId="cb-nav-bg"
                className="absolute inset-0 rounded-lg bg-primary-500/10"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
            <Icon size={15} className={`relative z-10 ${active ? 'text-primary-500' : 'text-text-200'}`} />
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </nav>

      <div className="px-3 py-2 space-y-0.5">
        {[{ label: 'Support', icon: Bell1 }, { label: 'Settings', icon: Gear1 }].map(({ label, icon: Icon }) => (
          <button key={label} disabled
            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-text-200 opacity-50 cursor-not-allowed">
            <Icon size={15} className="text-text-200" />
            {label}
          </button>
        ))}
      </div>

      <div className="border-t border-base-100 px-4 py-3 flex items-center gap-2.5">
        <Avatar size="sm" fallback="KM" />
        <div className="min-w-0 flex-1">
          <p className="text-title-50 text-xs font-medium truncate">Kathryn Murphy</p>
          <p className="text-text-200 text-[11px] truncate">murphy.mitc@example.com</p>
        </div>
      </div>
    </aside>
  );
}

// ─── App Layout ───────────────────────────────────────────────────────────────
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
    <div className="fixed inset-0 z-50 flex bg-background-50">
      <CBSidebar onExit={onExit} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Breadcrumb header */}
        <div className="bg-background-50 border-b border-base-100 px-7 py-4 shrink-0 flex items-center justify-between">
          <p className="text-text-200 text-sm">
            <span className="text-title-50 font-medium">Crossborder</span>
            {' / '}
            {stepLabels[state.step - 1]}
          </p>
          <button onClick={onExit}
            className="flex items-center gap-1.5 text-text-200 text-xs hover:text-title-50 transition">
            <Home size={13} className="text-text-200" />
            Volver al catálogo
          </button>
        </div>

        {/* Stepper */}
        <div className="bg-background-50 border-b border-base-100 px-7 py-3 shrink-0">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <CBApp onExit={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
