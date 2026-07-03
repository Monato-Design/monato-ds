// src/billpay/Sidebar.tsx
// BillPay Main sidebar (280px). Renders the 11 nav items exactly as in Figma
// node 2269-3279, including the Lottery "New" badge + Melate sub-item and the
// Damaris Guada user footer.

import {
  Home, CreditCard, BarChart2, User2, Wallet2, UserMultiple1, Layers2,
  Code1Square, Doller, Target3, Globe2, Gear1, ChevronDown,
} from '@tailgrids/icons';
import LogoDefault from '../assets/logo-default.png';
import Symbol from '../assets/Symbol.png';
import type { NavItemId } from './types';

interface SidebarProps {
  active: NavItemId;
  onSelect: (id: NavItemId) => void;
}

interface Item {
  id: NavItemId;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
  chevron?: boolean;
}

const ITEMS: Item[] = [
  { id: 'home',            label: 'Home',            Icon: Home },
  { id: 'payments',        label: 'Payments',        Icon: CreditCard },
  { id: 'balances',        label: 'Balances',        Icon: BarChart2 },
  { id: 'clients',         label: 'Clients',         Icon: User2 },
  { id: 'payees',          label: 'Payees',          Icon: Wallet2 },
  { id: 'users',           label: 'Users',           Icon: UserMultiple1 },
  { id: 'audit-logs',      label: 'Audit logs',      Icon: Layers2 },
  { id: 'request-records', label: 'Request records', Icon: Code1Square },
  { id: 'cash',            label: 'Cash',            Icon: Doller },
  { id: 'lottery',         label: 'Lottery',         Icon: Target3, badge: 'New', chevron: true },
];

export function Sidebar({ active, onSelect }: SidebarProps) {
  return (
    <aside className="bp-sidebar" aria-label="BillPay navigation">
      <div>
        {/* Logo */}
        <div className="bp-sidebar__brand">
          <img src={LogoDefault} alt="Monato" className="bp-sidebar__brand-logo" />
          <img src={Symbol} alt="" className="bp-sidebar__brand-icon" aria-hidden />
        </div>

        {/* Main menu */}
        <p className="bp-sidebar__eyebrow">Main menu</p>
        <nav className="bp-nav">
          {ITEMS.map((item) => {
            const isActive = item.id === active;
            return (
              <button
                key={item.id}
                type="button"
                className={`bp-nav__item ${isActive ? 'bp-nav__item--active' : ''}`}
                onClick={() => onSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.Icon size={24} />
                <span className="bp-nav__item-label">{item.label}</span>
                {(item.badge || item.chevron) && (
                  <span className="bp-nav__item-tail">
                    {item.badge && <span className="bp-nav__badge">{item.badge}</span>}
                    {item.chevron && <ChevronDown size={20} />}
                  </span>
                )}
              </button>
            );
          })}

          {/* Melate — sub-item of Lottery with left guide line */}
          <button
            type="button"
            className={`bp-nav__subitem ${active === 'melate' ? 'bp-nav__subitem--active' : ''}`}
            onClick={() => onSelect('melate')}
            aria-current={active === 'melate' ? 'page' : undefined}
          >
            Melate
          </button>

          {/* Remittances (last main item, sits after the sub-item as in Figma) */}
          <button
            type="button"
            className={`bp-nav__item ${active === 'remittances' ? 'bp-nav__item--active' : ''}`}
            onClick={() => onSelect('remittances')}
            aria-current={active === 'remittances' ? 'page' : undefined}
          >
            <Globe2 size={24} />
            <span className="bp-nav__item-label">Remittances</span>
          </button>
        </nav>
      </div>

      {/* User info footer */}
      <div className="bp-user">
        <div className="bp-user__settings-wrap">
          <button type="button" className="bp-nav__item" style={{ color: 'var(--bp-sidebar-default)' }}>
            <Gear1 size={24} />
            <span className="bp-nav__item-label">Settings</span>
          </button>
        </div>
        <div className="bp-user__row">
          <div className="bp-user__avatar">
            <span className="bp-user__avatar-txt">DG</span>
          </div>
          <div className="bp-user__meta">
            <span className="bp-user__name">Damaris Guada</span>
            <span className="bp-user__mail">
              <b>damaris</b>@<b>monato</b>.com
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
