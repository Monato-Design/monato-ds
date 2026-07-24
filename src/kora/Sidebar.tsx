import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Headphone1Mic,
  Wallet2,
  DoubleCheckMark,
  Shield1Check,
  Bell1,
  FileTextMultiple,
  ChevronLeft,
  ChevronRight,
} from '@tailgrids/icons';
import LogoSymbol from '@/assets/Symbol.png';
import { AGENTE_ACTUAL } from './data';
import type { KoraModule } from './types';

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

interface NavItem {
  id: KoraModule;
  label: string;
  icon: IconComponent;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  { label: 'General', items: [{ id: 'home', label: 'Inicio', icon: Home }] },
  {
    label: 'Módulos',
    items: [
      { id: 'atencion', label: 'Atención al Cliente', icon: Headphone1Mic },
      { id: 'productos', label: 'Productos', icon: Wallet2 },
      { id: 'onboarding', label: 'Onboarding', icon: DoubleCheckMark },
      { id: 'compliance', label: 'Compliance', icon: Shield1Check },
      { id: 'notificaciones', label: 'Notificaciones', icon: Bell1 },
    ],
  },
  {
    label: 'Sistema',
    items: [{ id: 'auditlog', label: 'Audit Log', icon: FileTextMultiple }],
  },
];

interface SidebarProps {
  active: KoraModule;
  onNavigate: (id: KoraModule) => void;
  onLogout: () => void;
}

export function Sidebar({ active, onNavigate, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      data-theme="dark"
      animate={{ width: collapsed ? 84 : 264 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex h-full flex-col overflow-hidden bg-background-50"
    >
      {/* ── Header ── */}
      <div
        className={[
          'flex h-[68px] shrink-0 items-center border-b border-base-50',
          collapsed ? 'justify-center px-3' : 'justify-between px-5',
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
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="min-w-0"
            >
              <p className="truncate text-[15px] font-semibold leading-tight text-white-100">
                Kora Central Desk
              </p>
              <p className="truncate text-xs text-[var(--primitive-white-a40)]">by Monato</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          className="shrink-0 rounded-lg p-1.5 text-sidebar-nav-icon transition-colors hover:bg-sidebar-nav-hover-background hover:text-sidebar-nav-hover-text"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pt-5 pb-4" aria-label="Menú principal">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.p
                  key="label"
                  className="mb-1.5 overflow-hidden px-3 text-[10px] font-semibold tracking-widest whitespace-nowrap text-[var(--primitive-white-a40)] uppercase"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
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
                      onClick={() => onNavigate(id)}
                      title={collapsed ? label : undefined}
                      aria-current={isActive ? 'page' : undefined}
                      className={[
                        'relative flex w-full items-center gap-3 rounded-lg border-l-[3px] px-3 py-2.5 text-left text-sm font-medium transition-colors',
                        isActive
                          ? 'border-[var(--primitive-skyblue-500)] bg-[var(--primitive-skyblue-a15)] text-white-100'
                          : 'border-transparent text-sidebar-nav-default-text hover:bg-sidebar-nav-hover-background hover:text-sidebar-nav-hover-text',
                      ].join(' ')}
                    >
                      <Icon
                        size={20}
                        className={isActive ? 'shrink-0 text-[var(--primitive-skyblue-400)]' : 'shrink-0 text-sidebar-nav-icon'}
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

      {/* ── Footer: agente + logout ── */}
      <div className="shrink-0 border-t border-base-50 px-4 py-3.5">
        <div className={['flex items-center gap-2.5', collapsed ? 'justify-center' : ''].join(' ')}>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--primitive-skyblue-500)] text-xs font-semibold text-white-100">
            {AGENTE_ACTUAL.iniciales}
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                key="user"
                className="min-w-0 overflow-hidden"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
              >
                <p className="truncate text-xs font-medium text-white-100">{AGENTE_ACTUAL.nombre}</p>
                <p className="truncate text-[11px] text-[var(--primitive-white-a40)]">{AGENTE_ACTUAL.rol}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {!collapsed && (
          <button
            onClick={onLogout}
            className="mt-2.5 w-full rounded-md bg-[var(--primitive-white-a05)] py-1.5 text-xs text-[var(--primitive-white-a60)] transition-colors hover:bg-[var(--primitive-white-a10)] hover:text-white-100"
          >
            Cerrar sesión
          </button>
        )}
      </div>
    </motion.aside>
  );
}
