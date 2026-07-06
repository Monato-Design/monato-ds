// src/billpay/Sidebar.tsx
// 280px vertical navbar with collapsible mode (88px, icons-only). The toggle
// button lives where the Monato symbol used to be — click to shrink/expand
// with a spring-animated width. Labels, badges, sub-items and user meta all
// fade out via AnimatePresence so nothing "chops" during the transition.

import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';
import {
  Home, CreditCard, BarChart2, User2, Wallet2, UserMultiple1, Layers2,
  Code1Square, Doller, Target3, Globe2, Gear1, ChevronDown, Layout22,
} from '@tailgrids/icons';
import LogoDefault from '../assets/logo-default.png';
import type { NavItemId } from './types';

interface SidebarProps {
  active:    NavItemId;
  onSelect:  (id: NavItemId) => void;
  collapsed: boolean;
  onToggle:  () => void;
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

const LABEL_TRANSITION = { duration: 0.14, ease: 'easeOut' as const };

export function Sidebar({ active, onSelect, collapsed, onToggle }: SidebarProps) {
  return (
    <motion.aside
      className={`bp-sidebar ${collapsed ? 'bp-sidebar--collapsed' : ''}`}
      aria-label="BillPay navigation"
      animate={{ width: collapsed ? 88 : 280 }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
    >
      <div>
        {/* Brand + toggle */}
        <div className="bp-sidebar__brand">
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.img
                key="logo"
                src={LogoDefault}
                alt="Monato"
                className="bp-sidebar__brand-logo"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={LABEL_TRANSITION}
              />
            )}
          </AnimatePresence>
          <motion.button
            type="button"
            className="bp-sidebar__toggle"
            onClick={onToggle}
            whileHover={{ backgroundColor: 'var(--bp-active-bg)' }}
            whileTap={{ scale: 0.9 }}
            aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
            aria-expanded={!collapsed}
          >
            <Layout22 size={20} />
          </motion.button>
        </div>

        {/* Eyebrow */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.p
              key="eyebrow"
              className="bp-sidebar__eyebrow"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={LABEL_TRANSITION}
            >
              Main menu
            </motion.p>
          )}
        </AnimatePresence>

        <LayoutGroup id="bp-nav">
          <nav className="bp-nav">
            {ITEMS.map((item) => (
              <NavRow
                key={item.id}
                item={item}
                active={active}
                onSelect={onSelect}
                collapsed={collapsed}
              />
            ))}

            {/* Melate sub-item — hidden when collapsed */}
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.button
                  key="melate"
                  type="button"
                  className={`bp-nav__subitem ${active === 'melate' ? 'bp-nav__subitem--active' : ''}`}
                  onClick={() => onSelect('melate')}
                  aria-current={active === 'melate' ? 'page' : undefined}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 40 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={LABEL_TRANSITION}
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
              )}
            </AnimatePresence>

            <NavRow
              item={{ id: 'remittances', label: 'Remittances', Icon: Globe2 }}
              active={active}
              onSelect={onSelect}
              collapsed={collapsed}
            />
          </nav>
        </LayoutGroup>
      </div>

      {/* Footer — Settings + user */}
      <div className="bp-user">
        <motion.button
          type="button"
          className="bp-nav__item"
          style={{ color: 'var(--bp-sidebar-default)' }}
          whileHover={{ x: collapsed ? 0 : 1 }}
          whileTap={{ scale: 0.985 }}
        >
          <span className="bp-nav__item-content">
            <Gear1 size={24} />
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  key="settings-label"
                  className="bp-nav__item-label"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={LABEL_TRANSITION}
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </motion.button>

        <div className="bp-user__row">
          <div className="bp-user__avatar">
            <span className="bp-user__avatar-txt">DG</span>
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                key="user-meta"
                className="bp-user__meta"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={LABEL_TRANSITION}
              >
                <span className="bp-user__name">Damaris Guada</span>
                <span className="bp-user__mail">
                  <b>damaris</b>@<b>monato</b>.com
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}

/* ── Nav row ─────────────────────────────────────────────────── */

function NavRow({ item, active, onSelect, collapsed }:
  { item: Item; active: NavItemId; onSelect: (id: NavItemId) => void; collapsed: boolean }
) {
  const isActive = item.id === active;
  return (
    <motion.button
      type="button"
      className={`bp-nav__item ${isActive ? 'bp-nav__item--active' : ''}`}
      onClick={() => onSelect(item.id)}
      aria-current={isActive ? 'page' : undefined}
      whileTap={{ scale: 0.985 }}
      title={collapsed ? item.label : undefined}
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
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              key="label"
              className="bp-nav__item-label"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={LABEL_TRANSITION}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
        <AnimatePresence initial={false}>
          {!collapsed && (item.badge || item.chevron) && (
            <motion.span
              key="tail"
              className="bp-nav__item-tail"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={LABEL_TRANSITION}
            >
              {item.badge && <span className="bp-nav__badge">{item.badge}</span>}
              {item.chevron && <ChevronDown size={20} />}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}
