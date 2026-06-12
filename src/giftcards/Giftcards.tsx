// ─────────────────────────────────────────────────────────────────────────────
// Giftcards v3.0 — Marketplace B2C sobre el shell de CrossBorder
// Figma DS Web 2026 (nau30mpaZ43tyBjogqSvMV):
//   · Nav de filtros + mega menu  → nodo 9515-26950 (sustituye al stepper)
//   · "Los más vendidos"          → nodo 9644-5520  (Featured Products V3)
//   · "Más marcas"                → nodo 9900-8993  (Product Grids V6)
//   · Confirmación (checkout)     → nodo 9964-17551 (Shopping Cart V4)
//   · Resultado                   → nodo 9709-2376  (Order Summaries V3)
// Pago: saldo ligado a la cuenta (BillPay) — sin captura de tarjeta.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useReducer, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Doller, UserMultiple4, ChevronDown,
  ArrowRight, RefreshCircle1Clockwise,
  QuestionMarkCircle, Layers2,
  Bell1, Gear1,
} from '@tailgrids/icons';

import LogoDefault from '../assets/logo-default.png';
import { Button } from '../components/core/button';
import { Badge } from '../components/core/badge';
import { DefaultSpinner } from '../components/core/spinner/default';

import {
  BRANDS, REDEEM_STEPS, BHN_TERMS, ANTIFRAUD_NOTICE, SERVICE_FEE_MXN,
  simulateRedeem, uuidv4, formatMXN,
} from './data';
import type { Brand, CategoryId, SimScenario, RedeemResult, RedeemFailure } from './data';

// ─── Demo: cuenta ligada (Damaris: "una sola bolsa ligada") ──────────────────
const ACCOUNT_EMAIL  = 'damaris.guadarrama@monato.com';
const BALANCE_MXN    = 3500;

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
      className="object-contain shrink-0"
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
}

// ─── Banner generado — gradiente de marca + glow + logo watermark ────────────
// Si brand.bannerSrc existe (asset real), lo usa; si no, genera el banner.
function GeneratedBanner({ brand, className = '', rounded = 'rounded-lg', children }: { brand: Brand; className?: string; rounded?: string; children?: React.ReactNode }) {
  const dark = shade(brand.color, -0.45);
  if (brand.bannerSrc) {
    return (
      <div className={`relative overflow-hidden ${rounded} ${className}`}>
        <img src={brand.bannerSrc} alt={brand.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />
        {children}
      </div>
    );
  }
  return (
    <div
      className={`relative overflow-hidden ${rounded} ${className}`}
      style={{ background: `linear-gradient(125deg, ${brand.color} 0%, ${dark} 100%)` }}
    >
      {/* glow radial */}
      <div className="absolute -right-10 -top-16 size-56 rounded-full opacity-40 blur-2xl" style={{ background: shade(brand.color, 0.5) }} />
      {/* logo watermark gigante a la derecha */}
      <motion.div
        className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-20"
        animate={{ rotate: [0, 4, 0], scale: [1, 1.04, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      >
        <BrandLogo brand={brand} size={150} />
      </motion.div>
      {children}
    </div>
  );
}

// Aclara/oscurece un hex (-1..1)
function shade(hex: string, amt: number) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
  return `rgb(${r},${g},${b})`;
}

// ─── Variants de Motion compartidos ──────────────────────────────────────────
const containerStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};
const itemRise = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 30 } },
};
const cardHover = {
  rest:  { y: 0, boxShadow: '0 1px 2px rgba(16,24,40,0.04)' },
  hover: { y: -5, boxShadow: '0 18px 40px -12px rgba(16,24,40,0.22)' },
};

// ─── Rating stars — Figma: 16px, naranja ─────────────────────────────────────
function Star({ dim }: { dim?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={dim ? '#d9e2ec' : '#f59e0b'} className="-mr-px shrink-0">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
function Stars({ n = 5 }: { n?: number }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map(i => <Star key={i} dim={i > n} />)}
    </div>
  );
}

const priceLabel = (b: Brand) =>
  b.denomType === 'fixed' ? `Desde ${formatMXN(Number(b.amounts![0]))}` : `Desde ${formatMXN(b.min!)}`;

// ─── State machine ────────────────────────────────────────────────────────────
type Step = 'market' | 'confirm' | 'result';

type FlowState = {
  step: Step;
  brand: Brand | null;
  amount: number | null;
  amountModalOpen: boolean;
  termsAccepted: boolean;
  processing: boolean;
  result: RedeemResult | null;
  failure: RedeemFailure | null;
  transactionId: string | null;
};

type FlowAction =
  | { type: 'openAmount'; brand: Brand }
  | { type: 'closeAmount' }
  | { type: 'setAmount'; amount: number | null }
  | { type: 'toConfirm' }
  | { type: 'toggleTerms' }
  | { type: 'backToMarket' }
  | { type: 'submit'; transactionId: string }
  | { type: 'success'; result: RedeemResult }
  | { type: 'failure'; failure: RedeemFailure }
  | { type: 'retry' }
  | { type: 'reset' };

const initialState: FlowState = {
  step: 'market', brand: null, amount: null, amountModalOpen: false,
  termsAccepted: false, processing: false, result: null, failure: null, transactionId: null,
};

function reducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'openAmount':   return { ...state, brand: action.brand, amount: null, amountModalOpen: true, termsAccepted: false };
    case 'closeAmount':  return { ...state, amountModalOpen: false };
    case 'setAmount':    return { ...state, amount: action.amount };
    case 'toConfirm':    return { ...state, amountModalOpen: false, step: 'confirm' };
    case 'toggleTerms':  return { ...state, termsAccepted: !state.termsAccepted };
    case 'backToMarket': return { ...state, step: 'market', failure: null };
    case 'submit':       return { ...state, processing: true, failure: null, transactionId: action.transactionId };
    case 'success':      return { ...state, processing: false, result: action.result, failure: null, step: 'result' };
    case 'failure':      return { ...state, processing: false, failure: action.failure, result: null, step: 'result' };
    case 'retry':        return { ...state, step: 'confirm', failure: null, result: null };
    case 'reset':        return initialState;
    default:             return state;
  }
}

// ─── Nav de filtros + mega menu — Figma 9515-26950 (solo Nav Menu, sin header) ─
const MEGA_ITEMS: { cat: Exclude<CategoryId, 'all'>; title: string; desc: string; sample: string }[] = [
  { cat: 'gaming',    title: 'Gaming',       desc: 'Consolas, créditos y suscripciones',   sample: 'xbox' },
  { cat: 'streaming', title: 'Streaming',    desc: 'Series, música y entretenimiento',     sample: 'netflix' },
  { cat: 'tiendas',   title: 'Tiendas',      desc: 'Retail y compras en línea',            sample: 'amazon' },
  { cat: 'exp',       title: 'Experiencias', desc: 'Café, cine, viajes y más',             sample: 'starbucks' },
];

function FilterNav({ filter, setFilter }: { filter: CategoryId; setFilter: (c: CategoryId) => void }) {
  const [megaOpen, setMegaOpen] = useState(false);

  const linkCls = (active: boolean) =>
    `flex items-center gap-1 rounded-lg text-[16px] font-medium tracking-[-0.2px] leading-6 transition-colors ${
      active ? 'text-[#0787b6]' : 'text-[#334e68] hover:text-[#0787b6]'
    }`;

  const pick = (c: CategoryId) => { setFilter(c); setMegaOpen(false); };

  return (
    <div className="relative bg-white border-b border-[#d9e2ec] px-6 py-6 shrink-0 flex items-center justify-center">
      <div className="flex items-center gap-7">
        {/* "Hot Offer" → Más vendidos, con icono */}
        <button onClick={() => pick('all')} className={`${linkCls(filter === 'all' && !megaOpen)} gap-2`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" /><path d="M15 9.4 9 15M9.5 9.5h.01M14.5 14.5h.01" />
          </svg>
          Más vendidos
        </button>

        {/* "Shop ⌃" → Categorías, abre el mega menu */}
        <button onClick={() => setMegaOpen(o => !o)} className="flex items-center gap-1 rounded-lg text-[16px] font-medium tracking-[-0.2px] leading-6 text-[#0787b6]">
          Categorías
          <ChevronDown size={20} className={`transition-transform ${megaOpen ? 'rotate-180' : ''}`} />
        </button>

        {MEGA_ITEMS.map(m => (
          <button key={m.cat} onClick={() => pick(m.cat)} className={linkCls(filter === m.cat)}>
            {m.title}
          </button>
        ))}

        {/* "Sale 20% OFF" → Monto libre + badge */}
        <div className="flex items-center gap-1.5">
          <button onClick={() => pick('all')} className={linkCls(false)}>Monto libre</button>
          <span className="bg-[#eff6ff] text-[#2441b5] text-[12px] font-medium leading-4 tracking-[-0.2px] px-2 py-0.5 rounded-[16px]">
            {BRANDS.filter(b => b.denomType !== 'fixed').length} marcas
          </span>
        </div>
      </div>

      {/* Mega menu — Figma: flotante, rounded-xl, 2 columnas + divider */}
      <AnimatePresence>
        {megaOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-30 border border-[#f8fafc] rounded-xl overflow-hidden bg-white p-3"
            style={{ boxShadow: '0px 12px 8px rgba(16,24,40,0.08), 0px 4px 3px rgba(16,24,40,0.03)' }}
          >
            <div className="flex items-center gap-9">
              {[MEGA_ITEMS.slice(0, 2), MEGA_ITEMS.slice(2)].map((col, ci) => (
                <div key={ci} className={`flex flex-col w-[320px] ${ci === 0 ? '' : ''}`} style={ci === 1 ? { borderLeft: '1px solid #d9e2ec', paddingLeft: 36, marginLeft: -36 } : undefined}>
                  {col.map(m => {
                    const sample = BRANDS.find(b => b.id === m.sample)!;
                    return (
                      <button
                        key={m.cat}
                        onClick={() => pick(m.cat)}
                        className="flex items-start gap-3 p-3 rounded-lg w-full text-left transition-colors hover:bg-[#f0f4f8]"
                      >
                        <div className="size-12 rounded-md flex items-center justify-center shrink-0 bg-[#f0f4f8]">
                          <BrandLogo brand={sample} size={32} />
                        </div>
                        <div className="w-[260px]">
                          <p className="text-[#334e68] text-[16px] font-medium leading-6 tracking-[-0.2px]">{m.title}</p>
                          <p className="text-[#829ab1] text-[14px] font-normal leading-5 tracking-[-0.2px]">{m.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── "Los más vendidos" — Figma 9644-5520 (Featured Products V3) ─────────────
const FEATURED_TALL_L  = 'amazon';
const FEATURED_STACK   = ['netflix', 'spotify'];
const FEATURED_TALL_R  = 'playstation';

function FeaturedTile({ brand, tall }: { brand: Brand; tall?: boolean }) {
  return (
    <GeneratedBanner brand={brand} rounded="rounded-lg" className={`w-full ${tall ? 'aspect-[376/500]' : 'aspect-[376/202]'}`}>
      <div className={`relative h-full flex flex-col justify-end ${tall ? 'p-6' : 'p-5'}`}>
        <div className="bg-white/95 backdrop-blur rounded-xl p-2.5 w-fit mb-3 shadow-lg">
          <BrandLogo brand={brand} size={tall ? 44 : 32} />
        </div>
        <p className={`text-white font-bold leading-tight drop-shadow ${tall ? 'text-2xl' : 'text-lg'}`}>{brand.name}</p>
        {brand.tagline && <p className="text-white/85 text-sm mt-0.5 drop-shadow max-w-[80%]">{brand.tagline}</p>}
      </div>
    </GeneratedBanner>
  );
}

function FeaturedTextRow({ brand, tall }: { brand: Brand; tall?: boolean }) {
  return (
    <div className={`flex items-start justify-between w-full px-4 ${tall ? 'py-7' : 'py-4'}`}>
      <div className="flex flex-col gap-2 items-start">
        <p className="text-[#334e68] text-[18px] font-medium leading-7 tracking-[-0.2px]">{brand.name}</p>
        <Stars />
      </div>
      <p className="text-[#334e68] text-[20px] font-semibold leading-7 tracking-[-0.2px] whitespace-nowrap">{priceLabel(brand)}</p>
    </div>
  );
}

function FeaturedSection({ onPick }: { onPick: (b: Brand) => void }) {
  const tallL = BRANDS.find(b => b.id === FEATURED_TALL_L)!;
  const tallR = BRANDS.find(b => b.id === FEATURED_TALL_R)!;
  const stack = FEATURED_STACK.map(id => BRANDS.find(b => b.id === id)!);

  return (
    <div className="bg-[#f0f4f8] py-16 px-8">
      <div className="max-w-[1216px] mx-auto flex flex-col gap-16 items-center">
        {/* Section Title — Figma: semibold 48/52 centrado + sub 16 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-4 items-center text-center max-w-[640px]"
        >
          <p className="text-[#334e68] text-[48px] font-semibold leading-[52px]">Los más vendidos</p>
          <p className="text-[#829ab1] text-[16px] font-normal leading-6 tracking-[-0.2px]">
            Las marcas favoritas de nuestros clientes, con entrega digital inmediata.
          </p>
        </motion.div>

        {/* Card group: alta + (2 apiladas) + alta */}
        <motion.div variants={containerStagger} initial="hidden" animate="show" className="flex gap-5 items-start w-full">
          {/* Card alta izquierda — con corazón y botón outline, badge gris */}
          <motion.button
            variants={itemRise} initial="rest" whileHover="hover" animate="rest"
            onClick={() => onPick(tallL)} className="relative flex-1 min-w-0 bg-white rounded-xl p-2 flex flex-col items-start text-left group"
          >
            <motion.div variants={cardHover} className="w-full rounded-xl">
              <FeaturedTile brand={tallL} tall />
            </motion.div>
            <FeaturedTextRow brand={tallL} tall />
            <motion.div whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }} className="absolute right-[26px] top-[26px] size-[44px] rounded-full bg-white flex items-center justify-center shadow-md z-10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#334e68" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
            </motion.div>
            <div className="absolute left-[26px] top-[26px] z-10">
              <span className="bg-white/90 backdrop-blur text-[#486581] text-[14px] font-medium leading-5 tracking-[-0.2px] px-3 py-1 rounded-2xl shadow">Top ventas</span>
            </div>
          </motion.button>

          {/* Columna central: 2 cards apiladas */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">
            {stack.map((b, i) => (
              <motion.button
                key={b.id} variants={itemRise} initial="rest" whileHover="hover" animate="rest"
                onClick={() => onPick(b)} className="relative w-full bg-white rounded-xl p-2 flex flex-col items-start text-left"
              >
                <motion.div variants={cardHover} className="w-full rounded-xl">
                  <FeaturedTile brand={b} />
                </motion.div>
                <FeaturedTextRow brand={b} />
                {i === 0 && (
                  <div className="absolute left-[22px] top-[22px] z-10">
                    <span className="bg-white/90 backdrop-blur text-[#033e54] text-[14px] font-medium leading-5 tracking-[-0.2px] px-3 py-1 rounded-2xl shadow">Más vendido</span>
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Card alta derecha */}
          <motion.button
            variants={itemRise} initial="rest" whileHover="hover" animate="rest"
            onClick={() => onPick(tallR)} className="flex-1 min-w-0 bg-white rounded-xl p-2 flex flex-col items-start text-left"
          >
            <motion.div variants={cardHover} className="w-full rounded-xl">
              <FeaturedTile brand={tallR} tall />
            </motion.div>
            <FeaturedTextRow brand={tallR} tall />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

// ─── "Más marcas" — Figma 9900-8993 (Product Grids V6) ───────────────────────
function MoreBrandsSection({ filter, onPick }: { filter: CategoryId; onPick: (b: Brand) => void }) {
  const featured = [FEATURED_TALL_L, ...FEATURED_STACK, FEATURED_TALL_R];
  const list = BRANDS.filter(b =>
    (filter === 'all' ? !featured.includes(b.id) : b.cat === filter),
  );

  return (
    <div className="bg-white py-16 px-8">
      <div className="max-w-[1216px] mx-auto flex flex-col gap-9">
        <motion.p
          key={filter}
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}
          className="text-[#334e68] text-[36px] font-bold leading-10"
        >
          {filter === 'all' ? 'Más marcas' : `Marcas · ${list.length}`}
        </motion.p>
        <motion.div layout variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-4 gap-7">
          <AnimatePresence mode="popLayout">
            {list.map((b, i) => {
              const freeBadge = b.denomType !== 'fixed';
              return (
                <motion.button
                  key={b.id}
                  layout
                  variants={itemRise}
                  initial="hidden" animate="show" exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  onClick={() => onPick(b)} className="flex flex-col gap-5 items-start text-left group"
                >
                  <div className="relative w-full">
                    <GeneratedBanner brand={b} rounded="rounded-lg" className="aspect-[283/274] w-full">
                      <div className="relative h-full flex items-center justify-center">
                        <motion.div whileHover={{ scale: 1.06 }} className="bg-white/95 backdrop-blur rounded-xl p-3 shadow-lg">
                          <BrandLogo brand={b} size={64} />
                        </motion.div>
                      </div>
                    </GeneratedBanner>
                    {freeBadge && (
                      <div className="absolute left-4 top-4 z-10">
                        <span className="bg-white/90 backdrop-blur text-[#16894c] text-[14px] font-medium leading-5 tracking-[-0.2px] px-3 py-1 rounded-2xl shadow">Monto libre</span>
                      </div>
                    )}
                    {/* Hover action bar — Figma: ♥ | Add to cart | 👁 */}
                    <motion.div
                      initial={{ y: 8, opacity: 0 }} whileHover={{}} 
                      className="absolute left-2 right-2 bottom-2 bg-white border border-[#d9e2ec] rounded-lg overflow-hidden flex items-stretch opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-10"
                    >
                      <div className="size-12 flex items-center justify-center border-r border-[#d9e2ec]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#486581" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                      </div>
                      <div className="flex-1 h-12 flex items-center justify-center gap-2">
                        <span className="text-[#486581] text-[14px] font-medium leading-5 tracking-[-0.2px]">Comprar</span>
                      </div>
                      <div className="size-12 flex items-center justify-center border-l border-[#d9e2ec]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#486581" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                      </div>
                    </motion.div>
                  </div>
                  <div className="flex flex-col gap-3 w-full">
                    <div className="flex items-start justify-between gap-2 w-full">
                      <p className="text-[#829ab1] text-[16px] font-medium leading-6 tracking-[-0.2px]">{b.name}</p>
                      <p className="text-[#334e68] text-[16px] font-medium leading-6 tracking-[-0.2px] whitespace-nowrap">{priceLabel(b)}</p>
                    </div>
                    <Stars n={4 - (i % 2)} />
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Marketplace (paso 1) ─────────────────────────────────────────────────────
function MarketplaceScreen({ dispatch }: { dispatch: React.Dispatch<FlowAction> }) {
  const [filter, setFilter] = useState<CategoryId>('all');
  const pick = (b: Brand) => dispatch({ type: 'openAmount', brand: b });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <FilterNav filter={filter} setFilter={setFilter} />
      <div className="flex-1 overflow-y-auto">
        {filter === 'all' && <FeaturedSection onPick={pick} />}
        <MoreBrandsSection filter={filter} onPick={pick} />
      </div>
    </div>
  );
}

// ─── Modal de monto (sobre el marketplace) ────────────────────────────────────
function AmountModal({ state, dispatch }: { state: FlowState; dispatch: React.Dispatch<FlowAction> }) {
  const brand = state.brand!;
  const [input, setInput] = useState('');
  const [customActive, setCustomActive] = useState(brand.denomType === 'variable');

  const min = brand.min ?? 0;
  const max = brand.max ?? 0;
  const showInput = brand.denomType === 'variable' || (brand.denomType === 'open' && customActive);

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
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 bg-black/40 flex items-center justify-center p-6"
      onClick={() => dispatch({ type: 'closeAmount' })}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className="w-[520px] bg-white rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header banner generado — uniforme con marketplace */}
        <GeneratedBanner brand={brand} rounded="" className="h-32">
          <div className="relative h-full flex items-end justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="bg-white/95 backdrop-blur rounded-xl p-2 shadow-lg">
                <BrandLogo brand={brand} size={40} />
              </div>
              <div>
                <p className="text-white text-lg font-bold leading-tight drop-shadow">{brand.name}</p>
                {brand.tagline && <p className="text-white/85 text-xs drop-shadow">{brand.tagline}</p>}
              </div>
            </div>
            <button onClick={() => dispatch({ type: 'closeAmount' })} className="size-7 rounded-full bg-white/90 backdrop-blur text-[#334e68] hover:bg-white text-sm leading-none transition flex items-center justify-center shadow">✕</button>
          </div>
        </GeneratedBanner>

        <div className="p-6">
        <p className="text-[#829ab1] text-sm mb-3">
          {brand.denomType === 'fixed' ? 'Montos predefinidos'
            : brand.denomType === 'variable' ? `Monto libre · ${formatMXN(min)} – ${formatMXN(max)}`
            : `Montos sugeridos o monto libre · ${formatMXN(min)} – ${formatMXN(max)}`}
        </p>

        <p className="text-[#334e68] text-sm font-medium mb-3">Monto a pagar <span className="text-red-500">*</span></p>

        {brand.amounts && (
          <motion.div variants={containerStagger} initial="hidden" animate="show" className="flex flex-wrap gap-2 mb-3">
            {brand.amounts.map(a => {
              const active = !customActive && state.amount === a;
              return (
                <motion.button
                  key={a} variants={itemRise} whileTap={{ scale: 0.94 }}
                  onClick={() => { setCustomActive(false); setInput(''); dispatch({ type: 'setAmount', amount: a }); }}
                  className={`px-5 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    active ? 'bg-[#e6f4fa] border-2 border-primary-500 text-primary-500'
                           : 'bg-white border border-[#d9e2ec] text-[#334e68] hover:bg-[#f8fafc]'
                  }`}
                >
                  {formatMXN(a)}
                </motion.button>
              );
            })}
            {brand.denomType === 'open' && (
              <motion.button
                variants={itemRise} whileTap={{ scale: 0.94 }}
                onClick={() => { setCustomActive(v => !v); dispatch({ type: 'setAmount', amount: null }); }}
                className={`px-5 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  customActive ? 'bg-[#e6f4fa] border-2 border-primary-500 text-primary-500'
                               : 'bg-white border border-dashed border-[#9fb3c8] text-[#486581] hover:bg-[#f8fafc]'
                }`}
              >
                Monto libre
              </motion.button>
            )}
          </motion.div>
        )}

        <AnimatePresence>
          {showInput && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-3" style={{ border: `1px solid ${inputError ? '#fb3748' : '#bcccdc'}` }}>
                <span className="text-[#829ab1] text-base font-medium">$</span>
                <input
                  inputMode="decimal"
                  value={input}
                  onChange={e => handleInput(e.target.value)}
                  placeholder="0.00"
                  autoFocus
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

        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={() => dispatch({ type: 'closeAmount' })} className="px-5 py-3 rounded-lg border border-[#d9e2ec] bg-white text-base font-medium text-[#334e68] hover:bg-[#f8fafc] transition">Cancelar</button>
          <Button disabled={!canContinue} onClick={() => dispatch({ type: 'toConfirm' })}>Continuar</Button>
        </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Confirmación — Figma 9964-17551 (Shopping Cart V4) + saldo ligado ───────
function ConfirmScreen({ state, dispatch, scenario }: { state: FlowState; dispatch: React.Dispatch<FlowAction>; scenario: SimScenario }) {
  const brand  = state.brand!;
  const amount = state.amount!;
  const total  = amount + SERVICE_FEE_MXN;
  const insufficient = total > BALANCE_MXN;

  const confirm = () => {
    const txid = uuidv4();
    dispatch({ type: 'submit', transactionId: txid });
    simulateRedeem(brand, amount, scenario)
      .then(result => dispatch({ type: 'success', result }))
      .catch((failure: RedeemFailure) => dispatch({ type: 'failure', failure }));
  };

  if (state.processing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-[#f0f4f8]">
        <DefaultSpinner />
        <p className="text-[#334e68] text-base font-medium">Procesando tu Gift Card…</p>
        <p className="text-[#829ab1] text-sm">No cierres esta ventana</p>
      </div>
    );
  }

  const rowLabel = 'text-[#486581] text-[16px] font-normal leading-6 tracking-[-0.2px]';
  const rowValue = 'text-[#486581] text-[16px] font-medium leading-6 tracking-[-0.2px] text-right';

  return (
    <div className="flex-1 overflow-y-auto bg-[#f0f4f8]">
      <div className="max-w-[1224px] mx-auto px-7 py-10 flex flex-col gap-11">
        <p className="text-[#334e68] text-[36px] font-bold leading-10">Confirma tu compra</p>

        <div className="flex gap-6 items-start">
          {/* ── Tabla de producto (izquierda) ── */}
          <div className="flex-1 bg-white border border-[#f8fafc] rounded-xl flex flex-col">
            {/* Title bar */}
            <div className="flex items-center gap-10 p-6 border-b border-[#d9e2ec]">
              <p className="w-[80px] text-[#334e68] text-[16px] font-medium tracking-[-0.2px]">Producto</p>
              <p className="w-[280px] text-[#334e68] text-[16px] font-medium tracking-[-0.2px]">Detalles</p>
              <p className="w-[130px] text-[#334e68] text-[16px] font-medium tracking-[-0.2px]">Cantidad</p>
              <p className="w-[100px] text-[#334e68] text-[16px] font-medium tracking-[-0.2px]">Precio</p>
            </div>
            {/* Product row */}
            <div className="flex items-center gap-10 p-6 border-b border-[#f8fafc]">
              <div className="size-[80px] rounded-lg border border-[#d9e2ec] overflow-hidden flex items-center justify-center shrink-0" style={{ background: brand.color }}>
                <div className="bg-white rounded-md p-1"><BrandLogo brand={brand} size={44} /></div>
              </div>
              <div className="w-[280px] flex flex-col gap-3">
                <div>
                  <p className="text-[#334e68] text-[16px] font-medium leading-6 tracking-[-0.2px]">Gift Card {brand.name}</p>
                  <p className="text-[#829ab1] text-[14px] font-normal leading-5 tracking-[-0.2px]">EGift digital · Blackhawk Network</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => dispatch({ type: 'backToMarket' })} className="text-[#829ab1] text-[14px] font-medium tracking-[-0.2px] hover:text-[#334e68] transition">Cambiar</button>
                  <span className="w-px h-[13px] bg-[#d9e2ec]" />
                  <button onClick={() => dispatch({ type: 'reset' })} className="text-[#829ab1] text-[14px] font-medium tracking-[-0.2px] hover:text-[#334e68] transition">Quitar</button>
                </div>
              </div>
              {/* Quantity counter — fijo en 1 para EGift */}
              <div className="w-[130px]">
                <div className="inline-flex items-center h-[40px] bg-white border border-[#d9e2ec] rounded-lg">
                  <span className="size-[40px] flex items-center justify-center border-r border-[#d9e2ec] text-[#bcccdc] text-lg select-none">−</span>
                  <span className="w-[50px] text-center text-[#334e68] text-[14px] font-medium">1</span>
                  <span className="size-[40px] flex items-center justify-center border-l border-[#d9e2ec] text-[#bcccdc] text-lg select-none">+</span>
                </div>
              </div>
              <p className="w-[100px] text-[#334e68] text-[16px] font-semibold tracking-[-0.2px]">{formatMXN(amount)}</p>
            </div>
            {/* Antifraude + T&C (contenido del proto) */}
            <div className="p-6 flex flex-col gap-4">
              <div className="flex gap-2.5 rounded-xl border border-yellow-200 bg-yellow-50 px-3.5 py-3">
                <div className="size-6 rounded-lg bg-yellow-400 flex items-center justify-center shrink-0 mt-0.5">
                  <QuestionMarkCircle size={13} className="text-white" />
                </div>
                <p className="text-yellow-800 text-xs leading-relaxed">
                  <span className="font-semibold">Aviso de seguridad:</span> {ANTIFRAUD_NOTICE}
                </p>
              </div>
              <div className="rounded-xl border border-[#d9e2ec] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#f8fafc]">
                  <p className="text-[#334e68] text-sm font-semibold">Términos y condiciones — Gift Card {brand.name}</p>
                </div>
                <div className="px-4 py-3 max-h-36 overflow-y-auto space-y-2.5">
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
                <input type="checkbox" checked={state.termsAccepted} onChange={() => dispatch({ type: 'toggleTerms' })} className="mt-0.5 size-4 accent-[#0894c8]" />
                <span className="text-[#334e68] text-sm">
                  He leído y acepto los <span className="text-primary-500 font-medium">Términos y Condiciones</span> de esta Gift Card
                </span>
              </label>
            </div>
          </div>

          {/* ── Columna derecha (444px) ── */}
          <div className="w-[444px] shrink-0 flex flex-col gap-6">
            {/* Método de pago — saldo ligado a la cuenta */}
            <div className="bg-white border border-[#f8fafc] rounded-xl flex flex-col pb-6">
              <div className="p-6 border-b border-[#d9e2ec]">
                <p className="text-[#334e68] text-[16px] font-medium tracking-[-0.2px]">Método de pago</p>
              </div>
              <div className="px-6 pt-5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-[#e6f4fa] flex items-center justify-center shrink-0">
                    <Doller size={22} className="text-primary-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[#334e68] text-[16px] font-medium leading-6 tracking-[-0.2px]">Saldo BillPay</p>
                    <p className="text-[#829ab1] text-[14px] leading-5 tracking-[-0.2px] truncate">{ACCOUNT_EMAIL}</p>
                  </div>
                  <span className="bg-[#e9f9f0] text-[#16894c] text-[12px] font-medium px-2 py-0.5 rounded-2xl shrink-0">Ligado</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-t border-[#f8fafc]">
                  <p className={rowLabel}>Saldo disponible</p>
                  <p className={rowValue}>{formatMXN(BALANCE_MXN)}</p>
                </div>
                <div className="flex items-center justify-between -mt-4 py-2.5">
                  <p className={rowLabel}>Después de esta compra</p>
                  <p className={`${rowValue} ${insufficient ? 'text-red-600' : ''}`}>{formatMXN(BALANCE_MXN - total)}</p>
                </div>
                {insufficient && (
                  <p className="text-red-600 text-xs -mt-2">Saldo insuficiente para completar esta compra. Recarga tu cuenta para continuar.</p>
                )}
              </div>
            </div>

            {/* Resumen del pedido */}
            <div className="bg-white border border-[#f8fafc] rounded-xl flex flex-col gap-6 pb-6">
              <div className="p-6 border-b border-[#d9e2ec]">
                <p className="text-[#334e68] text-[16px] font-medium tracking-[-0.2px]">Resumen del pedido</p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="px-6 flex flex-col">
                  <div className="flex items-start justify-between py-2.5">
                    <p className={rowLabel}>Gift Card {brand.name}</p>
                    <p className={rowValue}>{formatMXN(amount)}</p>
                  </div>
                  <div className="flex items-start justify-between py-2.5">
                    <p className={rowLabel}>Comisión de servicio</p>
                    <p className={rowValue}>{formatMXN(SERVICE_FEE_MXN)}</p>
                  </div>
                </div>
                <div className="h-px bg-[#d9e2ec] w-full" />
                <div className="px-6 flex items-center justify-between">
                  <p className="text-[#334e68] text-[18px] font-semibold leading-7 tracking-[-0.2px]">Total</p>
                  <p className="text-[#334e68] text-[18px] font-bold leading-7 tracking-[-0.2px]">{formatMXN(total)}</p>
                </div>
              </div>
              <div className="px-6 flex flex-col gap-3">
                <button
                  disabled={!state.termsAccepted || insufficient}
                  onClick={confirm}
                  className={`w-full px-5 py-3 rounded-lg text-[16px] font-medium tracking-[-0.2px] transition-colors ${
                    state.termsAccepted && !insufficient
                      ? 'bg-[#0894c8] text-white hover:bg-primary-600'
                      : 'bg-[#f0f4f8] text-[#9fb3c8] cursor-not-allowed'
                  }`}
                >
                  Confirmar pago
                </button>
                <button onClick={() => dispatch({ type: 'backToMarket' })} className="w-full px-5 py-3 rounded-lg border border-[#d9e2ec] bg-white text-[16px] font-medium text-[#334e68] tracking-[-0.2px] hover:bg-[#f8fafc] transition">
                  Seguir comprando
                </button>
              </div>
              <div className="px-6 flex items-center justify-center gap-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16894c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>
                <p className="text-[#829ab1] text-[16px] font-normal leading-6 tracking-[-0.2px] text-center">Pago seguro con tu saldo Monato</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Resultado — Figma 9709-2376 (Order Summaries V3) ────────────────────────
function ResultScreen({ state, dispatch, onExit, onRedeem }: { state: FlowState; dispatch: React.Dispatch<FlowAction>; onExit: () => void; onRedeem: () => void }) {
  const brand = state.brand!;
  const [copied, setCopied]       = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);

  // ── Error ──
  if (state.failure) {
    const f = state.failure;
    const canRetry = f.code === 'BHN-ERR-400' || f.code === 'BHN-ERR-503';
    return (
      <div className="flex-1 overflow-y-auto bg-[#f0f4f8] flex items-start justify-center py-14 px-6">
        <div className="w-[660px] flex flex-col items-center gap-10">
          <div className="flex flex-col gap-3 items-center text-center w-[464px]">
            <p className="text-[#334e68] text-[36px] font-semibold leading-10">No se pudo procesar</p>
            <p className="text-[#829ab1] text-[16px] leading-6 tracking-[-0.2px]">{f.detail}</p>
          </div>
          <div className="bg-white rounded-3xl p-8 w-full flex flex-col gap-6">
            <div className="flex items-center justify-between py-2 border-b border-[#f8fafc]">
              <span className="text-[#829ab1] text-sm">Código de error</span>
              <span className="text-[#334e68] text-sm font-mono font-medium">{f.code}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#f8fafc] -mt-4">
              <span className="text-[#829ab1] text-sm">ID de transacción</span>
              <span className="text-[#334e68] text-sm font-mono">{state.transactionId?.slice(0, 18)}…</span>
            </div>
            <div className="flex items-center justify-between py-2 -mt-4">
              <span className="text-[#829ab1] text-sm">Fecha</span>
              <span className="text-[#334e68] text-sm">{new Date().toLocaleString('es-MX')}</span>
            </div>
            <p className="text-[#829ab1] text-xs">No se realizó ningún cargo a tu saldo. {f.action}</p>
            <div className="flex items-center justify-center gap-3">
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
    <div className="flex-1 overflow-y-auto bg-[#f0f4f8]">
      <div className="flex flex-col items-center gap-16 py-14 px-6">
        {/* Section Title — Figma: semibold 36/40 centrado + sub con email destacado */}
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="flex flex-col gap-3 items-center text-center w-[464px]"
        >
          <p className="text-[#334e68] text-[36px] font-semibold leading-10">¡Tu Gift Card está confirmada!</p>
          <p className="text-[#829ab1] text-[16px] font-normal leading-6 tracking-[-0.2px]">
            Tu código de canje está ligado a <span className="text-[#334e68]">{ACCOUNT_EMAIL}</span>. Consérvalo para canjearlo en el portal de BHN.
          </p>
        </motion.div>

        {/* Card — Figma: bg white, rounded-3xl, p-8, w-660 */}
        <div className="bg-white rounded-3xl p-8 w-[660px] flex flex-col gap-12">
          {/* Order ID + botón */}
          <div className="flex items-center justify-between">
            <p className="text-[18px] font-semibold leading-7 tracking-[-0.2px]">
              <span className="text-[#829ab1]">Order ID:</span>
              <span className="text-[#334e68]"> #{r.transaction_id}</span>
            </p>
            <button onClick={onRedeem} className="px-4 py-2.5 rounded-lg border border-[#d9e2ec] bg-white text-[16px] font-medium text-[#334e68] tracking-[-0.2px] hover:bg-[#f8fafc] transition">
              Canjear Gift Card
            </button>
          </div>

          {/* Producto — tile 153×86 + nombre + monto */}
          <div className="flex items-center gap-5 -mt-4">
            <div className="w-[153px] h-[86px] rounded-lg border border-[#f8fafc] overflow-hidden flex items-center justify-center shrink-0" style={{ background: brand.color }}>
              <div className="bg-white rounded-md p-1.5"><BrandLogo brand={brand} size={40} /></div>
            </div>
            <div className="flex-1 flex flex-col gap-1 justify-center">
              <p className="text-[#334e68] text-[16px] font-medium leading-6 tracking-[-0.2px]">Gift Card {brand.name}</p>
              <p className="text-[#829ab1] text-[12px] font-normal leading-4 tracking-[-0.2px]">EGift digital · 1x</p>
              <p className="text-[#486581] text-[14px] font-semibold leading-5 tracking-[-0.2px]">{formatMXN(r.amount)}</p>
            </div>
          </div>

          {/* Código de canje — enmascarado (lógica del proto) */}
          <div className="rounded-xl border-2 border-dashed border-primary-300 bg-[#e6f4fa]/40 p-5 text-center -mt-4">
            <p className="text-[#829ab1] text-xs uppercase tracking-wider font-semibold">Código de canje</p>
            <p className="text-[#334e68] text-lg font-bold font-mono tracking-[0.2em] mt-1">
              •••• •••• •••• {r.redemption_code.slice(-4)}
            </p>
            <p className="text-[#486581] text-xs mt-2">Por tu seguridad, el código completo se muestra únicamente en el portal de canje de BHN.</p>
            <button onClick={copy} className="mt-2 text-primary-500 text-xs font-medium hover:underline">
              {copied ? 'Order ID copiado ✓' : 'Copiar Order ID'}
            </button>
          </div>

          {/* Montos — rows + divider + total */}
          <div className="flex flex-col gap-3 -mt-4">
            <div className="flex flex-col">
              <div className="flex items-start justify-between py-2.5">
                <p className="text-[#486581] text-[16px] font-normal leading-6 tracking-[-0.2px]">Subtotal</p>
                <p className="text-[#486581] text-[16px] font-medium leading-6 tracking-[-0.2px]">{formatMXN(r.amount)}</p>
              </div>
              <div className="flex items-start justify-between py-2.5">
                <div className="flex items-center gap-2">
                  <p className="text-[#486581] text-[16px] font-normal leading-6 tracking-[-0.2px]">Comisión de servicio</p>
                  <span className="bg-[#e9f9f0] text-[#16894c] text-[12px] font-medium leading-4 px-2 py-0.5 rounded-2xl">BHN</span>
                </div>
                <p className="text-[#486581] text-[16px] font-medium leading-6 tracking-[-0.2px]">{formatMXN(SERVICE_FEE_MXN)}</p>
              </div>
            </div>
            <div className="h-px bg-[#d9e2ec] w-full" />
            <div className="flex items-center justify-between py-2.5">
              <p className="text-[#334e68] text-[18px] font-medium leading-7 tracking-[-0.2px]">Total</p>
              <p className="text-[#334e68] text-[20px] font-semibold leading-7 tracking-[-0.2px]">{formatMXN(r.amount + SERVICE_FEE_MXN)}</p>
            </div>
          </div>

          {/* Cómo canjear (lógica del proto) */}
          <div className="rounded-xl border border-[#d9e2ec] overflow-hidden -mt-6">
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
        </div>

        <div className="flex items-center gap-3 -mt-8">
          <button onClick={() => dispatch({ type: 'reset' })} className="px-5 py-3 rounded-lg border border-[#d9e2ec] bg-white text-base font-medium text-[#334e68] hover:bg-[#f8fafc] transition">Nueva Gift Card</button>
          <button onClick={onExit} className="px-5 py-3 rounded-lg text-base font-medium text-[#829ab1] hover:text-[#334e68] transition">Salir</button>
        </div>
      </div>
    </div>
  );
}

// ─── Portal de canje BHN — "Activation Spot" simulado ────────────────────────
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
          <div className="bg-[#1a2231] px-6 py-3 flex items-center justify-between">
            <span className="text-white text-sm font-bold tracking-wide">BHN <span className="font-normal text-white/60">| eGift</span></span>
            <span className="text-white/40 text-xs">Powered by Blackhawk Network</span>
          </div>

          <div className="max-w-md mx-auto px-6 py-8">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-[#d9e2ec] bg-white">
              <div className="h-36 flex items-center justify-center" style={{ background: brand.color }}>
                <div className="bg-white rounded-xl p-2 shadow">
                  <BrandLogo brand={brand} size={56} />
                </div>
              </div>
              <div className="p-5 text-center">
                <p className="text-title-50 text-lg font-semibold">{brand.name} eGift</p>
                <p className="text-[#486581] text-2xl font-bold mt-1">{formatMXN(result.amount)}</p>

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
    { label: 'BillPay',     icon: Doller,                  active: false },
    { label: 'Top-Ups',     icon: RefreshCircle1Clockwise, active: false },
    { label: 'Gift Cards',  icon: Layers2,                 active: true  },
    { label: 'Cash-In/Out', icon: UserMultiple4,           active: false },
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
  const [state, dispatch]       = useReducer(reducer, initialState);
  const [scenario, setScenario] = useState<SimScenario>('200');
  const [redeemOpen, setRedeemOpen] = useState(false);

  const stepLabels: Record<Step, string> = { market: 'Marketplace', confirm: 'Confirmación', result: 'Resultado' };
  const scenarios: SimScenario[] = ['200', '400', '409', '503', 'timeout'];

  const ScreenComponent = (() => {
    switch (state.step) {
      case 'market':  return <MarketplaceScreen dispatch={dispatch} />;
      case 'confirm': return <ConfirmScreen state={state} dispatch={dispatch} scenario={scenario} />;
      case 'result':  return <ResultScreen state={state} dispatch={dispatch} onExit={onExit} onRedeem={() => setRedeemOpen(true)} />;
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
            <span className="text-white/40 text-[11px]">Gift Cards — Monato · {stepLabels[state.step]}</span>
          </div>
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
          <div className="flex-1 flex overflow-hidden bg-background-50 relative">
            <GCSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Breadcrumb header */}
              <div className="bg-white border-b border-[#f8fafc] px-6 py-4 shrink-0 flex items-center">
                <p className="text-[#334e68] text-xl font-medium leading-7">
                  <span className="font-medium">Gift Cards</span>{' '}
                  <span className="font-normal text-[#334e68]">/ {stepLabels[state.step]}</span>
                </p>
              </div>

              {/* Screens (el FilterNav vive dentro del Marketplace, en el lugar del stepper) */}
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

            {/* Modal de monto sobre el marketplace */}
            <AnimatePresence>
              {state.amountModalOpen && state.brand && (
                <AmountModal key={state.brand.id} state={state} dispatch={dispatch} />
              )}
            </AnimatePresence>
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
          <span className="text-text-200 text-[11px] font-medium uppercase tracking-widest">Gift Cards v3.0 — Marketplace navegable</span>
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
                <div className="h-1.5 bg-base-100 rounded w-2/3 mx-auto" />
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
              <h3 className="text-title-50 text-base font-semibold">Gift Cards — Marketplace B2C (BillPay)</h3>
              <p className="text-text-100 text-sm mt-1">Marketplace con mega menu de categorías, secciones "Los más vendidos" y "Más marcas" (Figma DS), monto en modal, checkout con saldo ligado y resultado con canje en portal BHN.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['Mega menu', 'Featured', 'Grid 4 col', 'Modal de monto', 'Saldo BillPay', 'Portal BHN'].map(tag => (
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
