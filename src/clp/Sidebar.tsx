import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DashboardSquare1,
  Wallet2,
  UserMultiple1,
  Target3,
  Folder1,
  Headphone1Mic,
  Gear1,
  ChevronLeft,
  ChevronRight,
} from '@tailgrids/icons';
import LogoDefault from '@/assets/logo-default.png';
import LogoSymbol from '@/assets/Symbol.png';

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

export type ClpScreen = 'dashboard' | 'portafolio' | 'clientes' | 'estrategias' | 'plantillas';

interface NavItem {
  id: ClpScreen | 'soporte' | 'ajustes';
  label: string;
  icon: IconComponent;
  disabled?: boolean;
}

// Menú principal — matches CLP V1.0 sidebar
const NAV_MAIN: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardSquare1, disabled: true },
  { id: 'portafolio', label: 'Portafolio', icon: Wallet2 },
  { id: 'clientes', label: 'Clientes', icon: UserMultiple1 },
  { id: 'estrategias', label: 'Estrategias', icon: Target3, disabled: true },
  { id: 'plantillas', label: 'Plantillas', icon: Folder1, disabled: true },
];

const NAV_BOTTOM: NavItem[] = [
  { id: 'soporte', label: 'Soporte', icon: Headphone1Mic, disabled: true },
  { id: 'ajustes', label: 'Ajustes', icon: Gear1, disabled: true },
];

interface SidebarProps {
  active: ClpScreen;
  onNavigate: (id: ClpScreen) => void;
}

function NavButton({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const { label, icon: Icon, disabled } = item;
  return (
    <button
      onClick={() => !disabled && onClick()}
      disabled={disabled}
      title={collapsed ? label : undefined}
      aria-current={isActive ? 'page' : undefined}
      className={[
        'relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
        isActive
          ? 'bg-sidebar-nav-active-background text-sidebar-nav-active-text'
          : disabled
            ? 'text-text-200 opacity-60 cursor-not-allowed'
            : 'text-sidebar-nav-default-text hover:bg-background-soft-50',
      ].join(' ')}
    >
      <Icon
        size={20}
        className={`shrink-0 ${isActive ? 'text-sidebar-nav-active-text' : 'text-sidebar-nav-icon'}`}
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
  );
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 84 : 264 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex h-full flex-col overflow-hidden border-r border-base-100 bg-background-50"
    >
      {/* ── Header: logo + collapse ── */}
      <div
        className={[
          'flex h-[68px] shrink-0 items-center',
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

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            aria-label="Colapsar menú"
            className="shrink-0 rounded-lg p-1.5 text-sidebar-nav-icon transition-colors hover:bg-background-soft-50"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          aria-label="Expandir menú"
          className="mx-auto mb-2 rounded-lg p-1.5 text-sidebar-nav-icon transition-colors hover:bg-background-soft-50"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* ── Nav ── */}
      <nav className="flex flex-1 flex-col overflow-y-auto px-4 pt-2" aria-label="Menú principal">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.p
              key="label"
              className="mb-1.5 px-3 text-xs font-medium text-text-200"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
            >
              Menú principal
            </motion.p>
          )}
        </AnimatePresence>

        <ul className="flex list-none flex-col gap-1 p-0">
          {NAV_MAIN.map((item) => (
            <li key={item.id}>
              <NavButton
                item={item}
                isActive={active === item.id}
                collapsed={collapsed}
                onClick={() => onNavigate(item.id as ClpScreen)}
              />
            </li>
          ))}
        </ul>

        {/* Bottom group pushed down */}
        <ul className="mt-auto flex list-none flex-col gap-1 p-0 pb-4">
          {NAV_BOTTOM.map((item) => (
            <li key={item.id}>
              <NavButton item={item} isActive={false} collapsed={collapsed} onClick={() => {}} />
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Footer: user profile ── */}
      <div className="shrink-0 border-t border-base-100 px-4 py-3">
        <div className={['flex items-center gap-3', collapsed ? 'justify-center' : ''].join(' ')}>
          <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-500 text-xs font-semibold text-white">
            MS
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
                <p className="truncate text-sm font-medium text-title-50">Michael Scott</p>
                <p className="truncate text-xs text-text-100">m.scott@dundermifflin.com</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
