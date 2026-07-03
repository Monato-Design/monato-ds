// src/billpay/BPApp.tsx
// Fullscreen BillPay Main prototype, wrapped in the standard Monato DS
// "Mac Window" chrome (same pattern as GCApp / CrossBorder / Mandatos).

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { HomePage } from './pages/HomePage';
import { CashPage } from './pages/CashPage';
import type { NavItemId } from './types';
import './billpay.css';

interface BPAppProps { onExit: () => void; }

const PAGE_TITLES: Record<NavItemId, string> = {
  home: 'Home',
  payments: 'Payments',
  balances: 'Balances',
  clients: 'Clients',
  payees: 'Payees',
  users: 'Users',
  'audit-logs': 'Audit logs',
  'request-records': 'Request records',
  cash: 'Cash',
  lottery: 'Lottery',
  melate: 'Melate',
  remittances: 'Remittances',
};

type ApiScenario = '200' | '400' | '409' | '503' | 'timeout';
const SCENARIOS: ApiScenario[] = ['200', '400', '409', '503', 'timeout'];

export function BPApp({ onExit }: BPAppProps) {
  const [active, setActive]     = useState<NavItemId>('home');
  const [scenario, setScenario] = useState<ApiScenario>('200');

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
            title="Cerrar"
          >
            <span className="text-red-900 text-[8px] font-bold opacity-0 group-hover:opacity-100">✕</span>
          </button>
          <div className="size-3 rounded-full bg-yellow-500" />
          <div className="size-3 rounded-full bg-green-500" />
          <div className="flex-1 flex justify-center">
            <span className="text-white/40 text-[11px]">
              BillPay Main — Monato · {PAGE_TITLES[active]}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-white/30 text-[10px] mr-1">API:</span>
            {SCENARIOS.map((s) => (
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

        {/* App content — bounded (no viewport-height math inside) */}
        <div className="bp-root flex-1 overflow-hidden">
          <div className="bp-shell">
            <Sidebar active={active} onSelect={setActive} />

            <div className="bp-page">
              <header className="bp-topbar">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={active}
                    className="bp-topbar__title"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.16 }}
                  >
                    Billpay /{' '}
                    <span className="bp-topbar__title-page">{PAGE_TITLES[active]}</span>
                  </motion.span>
                </AnimatePresence>
              </header>

              <main className="bp-main">
                <div className="bp-main__inner">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="bp-page-content"
                    >
                      {active === 'home' && <HomePage />}
                      {active === 'cash' && <CashPage />}
                      {active !== 'home' && active !== 'cash' && (
                        <div className="bp-empty">{PAGE_TITLES[active]} — coming soon</div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </main>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
