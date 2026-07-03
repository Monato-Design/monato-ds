// src/billpay/Sidebar.tsx
// 280px vertical navbar. Uses motion for hover/tap + a shared layoutId to
// animate the active-item pill between selections.

import { motion, LayoutGroup } from 'framer-motion';
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
        <div className="bp-sidebar__brand">
          <img src={LogoDefault} alt="Monato" className="bp-sidebar__brand-logo" />
          <img src={Symbol} alt="" className="bp-sidebar__brand-icon" aria-hidden />
        </div>

        <p className="bp-sidebar__eyebrow">Main menu</p>

        <LayoutGroup id="bp-nav">
          <nav className="bp-nav">
            {ITEMS.map((item) => (
              <NavRow key={item.id} item={item} active={active} onSelect={onSelect} />
            ))}

            {/* Melate — sub-item */}
            <motion.button
              type="button"
              className={`bp-nav__subitem ${active === 'melate' ? 'bp-nav__subitem--active' : ''}`}
              onClick={() => onSelect('melate')}
              aria-current={active === 'melate' ? 'page' : undefined}
              whileTap={{ scale: 0.985 }}
            >
              {active === 'melate' && (
                <motion.span
                  layoutId="bp-nav-active"
                  className="bp-nav__pill"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <span className="bp-nav__subitem-label">Melate</span>
            </motion.button>

            <NavRow
              item={{ id: 'remittances', label: 'Remittances', Icon: Globe2 }}
              active={active}
              onSelect={onSelect}
            />
          </nav>
        </LayoutGroup>
      </div>

      <div className="bp-user">
        <motion.button
          type="button"
          className="bp-nav__item"
          style={{ color: 'var(--bp-sidebar-default)' }}
          whileHover={{ x: 1 }}
          whileTap={{ scale: 0.985 }}
        >
          <Gear1 size={24} />
          <span className="bp-nav__item-label">Settings</span>
        </motion.button>
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

/* ── Nav row ─────────────────────────────────────────────────── */

function NavRow({ item, active, onSelect }:
  { item: Item; active: NavItemId; onSelect: (id: NavItemId) => void }
) {
  const isActive = item.id === active;
  return (
    <motion.button
      type="button"
      className={`bp-nav__item ${isActive ? 'bp-nav__item--active' : ''}`}
      onClick={() => onSelect(item.id)}
      aria-current={isActive ? 'page' : undefined}
      whileTap={{ scale: 0.985 }}
    >
      {isActive && (
        <motion.span
          layoutId="bp-nav-active"
          className="bp-nav__pill"
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
      )}
      <span className="bp-nav__item-content">
        <item.Icon size={24} />
        <span className="bp-nav__item-label">{item.label}</span>
        {(item.badge || item.chevron) && (
          <span className="bp-nav__item-tail">
            {item.badge && <span className="bp-nav__badge">{item.badge}</span>}
            {item.chevron && <ChevronDown size={20} />}
          </span>
        )}
      </span>
    </motion.button>
  );
}
