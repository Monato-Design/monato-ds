import { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

type MenuSubItem = { label: string };

export type MenuItem = {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  danger?: boolean;
  checked?: boolean;
  submenu?: MenuSubItem[];
};

export type MenuSection = {
  items: MenuItem[];
  footer?: boolean;
};

export type MenuDef = {
  label: string;
  sections?: MenuSection[];
  disabled?: boolean;
};

export type MenuBarProps = {
  menus: MenuDef[];
  className?: string;
};

// ─── Submenu ──────────────────────────────────────────────────────────────────

function Submenu({ items }: { items: MenuSubItem[] }) {
  return (
    <div className="absolute left-full top-[-5px] z-50 w-40 drop-shadow-[0px_4px_4px_rgba(16,24,40,0.10),0px_2px_2px_rgba(16,24,40,0.06)]">
      <div className="bg-background-50 rounded-xl p-1.5 flex flex-col">
        {items.map((sub) => (
          <div
            key={sub.label}
            className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-background-soft-100 cursor-default"
          >
            <span className="text-text-50 text-sm font-medium">{sub.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dropdown ─────────────────────────────────────────────────────────────────

function MenuDropdown({ sections }: { sections: MenuSection[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<string | null>(null);

  const mainSections = sections.filter((s) => !s.footer);
  const footerSections = sections.filter((s) => s.footer);

  return (
    <div className="absolute left-0 top-10 z-50 w-40 drop-shadow-[0px_4px_4px_rgba(16,24,40,0.10),0px_2px_2px_rgba(16,24,40,0.06)]">
      {/* Main sections */}
      {mainSections.map((section, si) => (
        <div
          key={si}
          className={cn(
            'bg-background-50 p-1.5 flex flex-col',
            footerSections.length === 0 && si === mainSections.length - 1
              ? 'rounded-xl'
              : si === 0
                ? 'rounded-tl-xl rounded-tr-xl'
                : '',
          )}
        >
          {section.items.map((item, ii) => {
            const key = `${si}-${ii}`;
            return (
              <div
                key={key}
                className={cn(
                  'relative flex items-center justify-between px-3 py-1.5 rounded-lg cursor-default',
                  item.danger
                    ? 'bg-[#ffebed] hover:bg-[#ffd6da]'
                    : 'bg-background-50 hover:bg-background-soft-100',
                )}
                onMouseEnter={() => item.submenu ? setHoveredIdx(key) : setHoveredIdx(null)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Left side */}
                <div className="flex items-center gap-2">
                  {item.checked && (
                    <svg className="size-3.5 text-text-50 shrink-0" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l3.5 3.5L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {item.icon && (
                    <span className="size-4 text-text-50 flex items-center justify-center shrink-0">
                      {item.icon}
                    </span>
                  )}
                  <span
                    className={cn(
                      'text-sm font-medium whitespace-nowrap',
                      item.danger ? 'text-[#b22733]' : 'text-text-50',
                    )}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Right side */}
                {item.shortcut && (
                  <span className="text-text-200 text-xs font-medium ml-4 shrink-0">{item.shortcut}</span>
                )}
                {item.submenu && (
                  <svg className="size-3.5 text-text-200 shrink-0 ml-2" viewBox="0 0 14 14" fill="none">
                    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}

                {/* Submenu panel */}
                {item.submenu && hoveredIdx === key && (
                  <Submenu items={item.submenu} />
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Footer sections (danger zone) */}
      {footerSections.map((section, fi) => (
        <div
          key={`footer-${fi}`}
          className="bg-background-50 border-t border-base-100 p-1.5 flex flex-col rounded-bl-xl rounded-br-xl"
        >
          {section.items.map((item, ii) => (
            <div
              key={ii}
              className={cn(
                'flex items-center justify-between px-3 py-1.5 rounded-lg cursor-default',
                item.danger
                  ? 'bg-[#ffebed] hover:bg-[#ffd6da]'
                  : 'hover:bg-background-soft-100',
              )}
            >
              <div className="flex items-center gap-2">
                {item.icon && (
                  <span className="size-4 flex items-center justify-center shrink-0">
                    {item.icon}
                  </span>
                )}
                <span
                  className={cn(
                    'text-sm font-medium whitespace-nowrap',
                    item.danger ? 'text-[#b22733]' : 'text-text-50',
                  )}
                >
                  {item.label}
                </span>
              </div>
              {item.shortcut && (
                <span className="text-text-200 text-xs font-medium ml-4 shrink-0">{item.shortcut}</span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── MenuBar ──────────────────────────────────────────────────────────────────

export function MenuBar({ menus, className }: MenuBarProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenIdx(null);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 p-1 rounded-lg border border-base-200 bg-background-soft-100',
        className,
      )}
    >
      {menus.map((menu, i) => {
        const isOpen = openIdx === i;
        const hasDropdown = menu.sections && menu.sections.length > 0;

        return (
          <div key={menu.label} className="relative">
            <button
              onClick={() => {
                if (menu.disabled) return;
                setOpenIdx(isOpen ? null : i);
              }}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors select-none',
                menu.disabled
                  ? 'text-text-200 cursor-default'
                  : isOpen
                    ? 'bg-tab-active-background text-title-50 shadow-xs'
                    : 'text-title-50 hover:bg-background-soft-50 cursor-default',
              )}
            >
              {menu.label}
            </button>

            {isOpen && hasDropdown && (
              <MenuDropdown sections={menu.sections!} />
            )}
          </div>
        );
      })}
    </div>
  );
}
