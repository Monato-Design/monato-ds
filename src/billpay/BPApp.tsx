// src/billpay/BPApp.tsx
// The fullscreen BillPay Main prototype. Layout mirrors Figma:
//   [Sidebar 280px] · [Right column: top bar + main content]
// State-based routing (no router library) between Home and Cash.
// Nav items other than Home/Cash still switch the active state so the
// user sees the interaction, but currently render an empty placeholder.

import { useState } from 'react';
import { ArrowLeft } from '@tailgrids/icons';
import { Sidebar } from './Sidebar';
import { HomePage } from './pages/HomePage';
import { CashPage } from './pages/CashPage';
import type { NavItemId } from './types';
import './billpay.css';

interface BPAppProps {
  onExit: () => void;
}

// Maps nav id → title shown in the top bar
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

export function BPApp({ onExit }: BPAppProps) {
  const [active, setActive] = useState<NavItemId>('home');

  return (
    <div className="bp-root">
      <div className="bp-shell">
        <Sidebar active={active} onSelect={setActive} />

        <div className="bp-page">
          <header className="bp-topbar">
            <span className="bp-topbar__title">
              Billpay /{' '}
              <span className="bp-topbar__title-page">{PAGE_TITLES[active]}</span>
            </span>
            {/* Exit control — small, unobtrusive, top-right */}
            <button
              type="button"
              onClick={onExit}
              className="bp-btn-outline bp-btn-outline--soft"
              style={{ marginLeft: 'auto', height: 36, padding: '0 12px' }}
              aria-label="Exit prototype"
            >
              <ArrowLeft size={16} />
              Back to DS
            </button>
          </header>

          <main className="bp-main">
            <div className="bp-main__inner">
              {active === 'home' && <HomePage />}
              {active === 'cash' && <CashPage />}
              {active !== 'home' && active !== 'cash' && (
                <div className="bp-empty">
                  {PAGE_TITLES[active]} — coming soon
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
