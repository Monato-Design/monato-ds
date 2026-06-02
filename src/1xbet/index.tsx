// ─────────────────────────────────────────────────────────────────────────────
// Demo 1xBet — Prototipo navegable (sección CrossBorder)
// Simula el sitio de recarga de 1xBet con Monato Pay como mejor opción de fondeo.
// Mismo patrón de entry-card + Mac window que CrossBorder.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/core/button';
import { Badge } from '../components/core/badge';
import Home from './pages/Home';
import Recharge from './pages/Recharge';
import './styles.css';
import './monato-pay.css';

type View = 'home' | 'recharge';

// ─── App con Mac window embebido — igual que CB ──────────────────────────────
function Xbet1App({ onExit }: { onExit: () => void }) {
  const [view, setView] = useState<View>('home');
  const url = view === 'home' ? '1-x.mx/es' : '1-x.mx/es/office/recharge';

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
            <span className="text-white/40 text-[11px]">🔒 {url}</span>
          </div>
        </div>

        {/* App content */}
        <div className="flex-1 overflow-auto">
          <div className="xbet-root">
            {view === 'home' ? (
              <Home onDeposit={() => setView('recharge')} />
            ) : (
              <Recharge onNavigateHome={() => setView('home')} />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Entry card en el catálogo — igual que CrossBorderPrototype ──────────────
export function Demo1xbetPrototype() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="rounded-xl border border-base-100 bg-background-50 overflow-hidden">
        <div className="border-b border-base-100 bg-background-soft-50 px-4 py-2.5 flex items-center justify-between">
          <span className="text-text-200 text-[11px] font-medium uppercase tracking-widest">Demo 1xBet — Fondeo con Monato Pay</span>
          <Badge color="primary" size="sm">Prototype</Badge>
        </div>
        <div className="p-6 flex items-center gap-6">
          {/* Thumbnail mockup — grid de pago con card destacada */}
          <div className="relative w-72 h-44 rounded-lg overflow-hidden border border-base-100 bg-[#abb8c5] shrink-0">
            <div className="absolute inset-0 flex flex-col">
              {/* header azul oscuro */}
              <div className="h-5 bg-[#1e3a5f] flex items-center px-2 gap-1">
                <div className="h-1.5 w-8 bg-white/80 rounded-sm" />
                <div className="ml-auto h-2 w-12 bg-[#8fa83f] rounded-sm" />
              </div>
              {/* grid */}
              <div className="flex-1 p-2 grid grid-cols-4 gap-1.5">
                {/* monato pay destacado */}
                <div className="col-span-2 row-span-2 rounded bg-white border border-[#0894c8] flex flex-col p-1.5 gap-1 relative">
                  <div className="absolute top-1 right-1 h-1.5 w-6 bg-[#22c55e] rounded-full" />
                  <div className="size-3 rounded-full bg-[#0894c8]" />
                  <div className="h-1 w-10 bg-[#0894c8]/40 rounded mt-auto" />
                  <div className="h-2.5 bg-[#0894c8] rounded" />
                </div>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="rounded bg-white flex flex-col overflow-hidden">
                    <div className="flex-1" />
                    <div className="h-2 bg-[#5a7ba0]" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-title-50 text-base font-semibold">Demo 1xBet — Recarga con Monato Pay</h3>
              <p className="text-text-100 text-sm mt-1">Simulación del sitio de recarga de 1xBet con Monato Pay integrado como mejor opción. Flujo de fondeo SPEI + Stablecoins sobre la UI del cliente.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['Home', 'Recharge', 'Monato Pay', 'SPEI', 'Crypto', 'Tu mejor opción'].map(tag => (
                <Badge key={tag} color="gray" size="sm">{tag}</Badge>
              ))}
            </div>
            <Button onClick={() => setOpen(true)}>
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
            <Xbet1App onExit={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
