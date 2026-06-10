import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DashboardSquare1,
  Wallet2,
  UserMultiple1,
  Gear1,
  ChevronLeft,
  ChevronRight,
  Bolt1,
} from '@tailgrids/icons';
import { Button } from '@/components/core/button';
import LogoDefault from '@/assets/logo-default.png';
import LogoSymbol from '@/assets/Symbol.png';

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

interface NavItem {
  id: string;
  label: string;
  icon: IconComponent;
}

interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'menu',
    label: 'MENU',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: DashboardSquare1 },
      { id: 'payments', label: 'Payments', icon: Wallet2 },
      { id: 'customers', label: 'Customers', icon: UserMultiple1 },
    ],
  },
  {
    id: 'support',
    label: 'SUPPORT',
    items: [{ id: 'settings', label: 'Settings', icon: Gear1 }],
  },
];

interface SidebarProps {
  defaultCollapsed?: boolean;
  activeItemId?: string;
  onItemClick?: (id: string) => void;
}

export function Sidebar({
  defaultCollapsed = false,
  activeItemId = 'payments',
  onItemClick,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [active, setActive] = useState(activeItemId);

  function handleItemClick(id: string) {
    setActive(id);
    onItemClick?.(id);
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 92 : 290 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex h-full flex-col overflow-hidden border-r border-base-50 bg-background-50"
    >
      {/* ── Header ── */}
      <div
        className={[
          'flex h-16 shrink-0 border-b border-base-50',
          collapsed
            ? 'flex-col items-center justify-center gap-1'
            : 'items-center justify-between px-5',
        ].join(' ')}
      >
        <AnimatePresence mode="wait" initial={false}>
          {collapsed ? (
            <motion.img
              key="symbol"
              src={LogoSymbol}
              alt="Monato"
              className="h-7 w-7 shrink-0 object-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            />
          ) : (
            <motion.img
              key="full"
              src={LogoDefault}
              alt="Monato"
              className="h-[26px] w-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            />
          )}
        </AnimatePresence>

        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={[
            'shrink-0 rounded-lg text-sidebar-nav-icon transition-colors hover:bg-sidebar-nav-hover-background hover:text-sidebar-nav-hover-text',
            collapsed ? 'p-1' : 'p-1.5',
          ].join(' ')}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* ── Nav ── */}
      <nav
        className="flex flex-1 flex-col gap-7 overflow-y-auto px-5 pt-8 pb-5"
        aria-label="Main"
      >
        {NAV_SECTIONS.map((section) => (
          <div key={section.id}>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.p
                  key="label"
                  className="mb-1.5 overflow-hidden whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-text-200"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 6 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {section.label}
                </motion.p>
              )}
            </AnimatePresence>

            <ul className="flex list-none flex-col gap-0.5 p-0">
              {section.items.map(({ id, label, icon: Icon }) => {
                const isActive = active === id;
                return (
                  <li key={id}>
                    <button
                      onClick={() => handleItemClick(id)}
                      title={collapsed ? label : undefined}
                      aria-current={isActive ? 'page' : undefined}
                      className={[
                        'relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-sidebar-nav-active-background text-sidebar-nav-active-text'
                          : 'text-sidebar-nav-default-text hover:bg-sidebar-nav-hover-background hover:text-sidebar-nav-hover-text',
                      ].join(' ')}
                    >
                      <Icon
                        size={24}
                        className={
                          isActive
                            ? 'shrink-0 text-sidebar-nav-active-text'
                            : 'shrink-0 text-sidebar-nav-icon'
                        }
                      />
                      <AnimatePresence initial={false}>
                        {!collapsed && (
                          <motion.span
                            key="label"
                            className="overflow-hidden whitespace-nowrap"
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            {label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Footer promo card ── */}
      <div className="shrink-0 px-5 pb-5">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="promo"
              className="overflow-hidden rounded-2xl bg-sidebar-footer-background"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
                  <Bolt1 size={18} className="text-primary-500" />
                </div>
                <p className="mb-0.5 text-sm font-semibold text-sidebar-footer-title">
                  Monato Pay
                </p>
                <p className="mb-3 text-xs leading-relaxed text-sidebar-footer-subtitle">
                  Cobra con SPEI y stablecoins
                </p>
                <Button size="sm" variant="primary" appearance="fill" className="w-full">
                  Ver demo
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
