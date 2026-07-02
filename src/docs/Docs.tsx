// src/docs/Docs.tsx
// Shell of the documentation.
// Structure:
//   Header (single row): brand · search · theme toggle · Back to DS
//   Layout: Sidebar (collapsible groups with colored icons) + Main + Rail
// Theme: light | dark, persisted in localStorage, scoped to docs.
// Pattern: diagonal lines on both left and right edges (viewport gutter).

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Button } from '../components/core/button';
import {
  TABS,
  PAGE_TO_TAB,
  type PageId,
  type TabId,
  type TabIconKey,
} from './nav';
import { PAGES, type Sample } from './pages';
import { DocsLoader } from './DocsLoader';
import { useDocsTheme } from './theme';
import LogoDefault from '../assets/logo-default.png';
import './docs.css';

interface DocsProps {
  onBackToDS: () => void;
}

export function Docs({ onBackToDS }: DocsProps) {
  const [activePage, setActivePage] = useState<PageId>('overview');
  const [isExiting, setIsExiting] = useState(false);
  const activeTab: TabId = PAGE_TO_TAB[activePage];
  const { theme, toggle } = useDocsTheme();

  const [expandedGroups, setExpandedGroups] = useState<Set<TabId>>(
    () => new Set([activeTab])
  );

  useEffect(() => {
    setExpandedGroups((prev) => {
      if (prev.has(activeTab)) return prev;
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [activePage]);

  const go = (id: PageId) => setActivePage(id);
  const goToTab = (tabId: TabId) => {
    const tab = TABS.find((t) => t.id === tabId);
    if (tab) setActivePage(tab.landing);
  };
  const toggleGroup = (tabId: TabId) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(tabId)) next.delete(tabId);
      else next.add(tabId);
      return next;
    });
  };
  const handleBack = () => setIsExiting(true);

  const currentTab = useMemo(() => TABS.find((t) => t.id === activeTab)!, [activeTab]);
  const page = PAGES[activePage];

  if (isExiting) {
    return (
      <DocsLoader
        variant="exit"
        onReady={onBackToDS}
        delayMs={2500}
        theme={theme}
      />
    );
  }

  return (
    <motion.div
      className="docs-root"
      data-theme={theme}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Diagonal line pattern — both sides */}
      <div className="docs-pattern-decor docs-pattern-decor--left" aria-hidden />
      <div className="docs-pattern-decor docs-pattern-decor--right" aria-hidden />

      {/* ═══ Header ═══════════════════════════════════════════ */}
      <header className="docs-header">
        <div className="docs-header__row1">
          <motion.div
            className="docs-brand"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08, duration: 0.3, ease: 'easeOut' }}
          >
            <img src={LogoDefault} alt="Monato" className="docs-brand__logo" />
            <span className="docs-brand__sep">Docs</span>
          </motion.div>

          <motion.label
            className="docs-search"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.3, ease: 'easeOut' }}
          >
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="5" />
              <path d="M12 12l3 3" />
            </svg>
            <input placeholder="Buscar en la documentación" aria-label="Buscar" />
            <span className="docs-search__kbd">/</span>
          </motion.label>

          <motion.div
            className="docs-header__actions"
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.14, duration: 0.3, ease: 'easeOut' }}
          >
            <ThemeToggle theme={theme} onToggle={toggle} />
            <Button size="xs" appearance="outline" onClick={handleBack}>
              <BackIcon size={12} />
              Back to DS
            </Button>
          </motion.div>
        </div>
      </header>

      {/* ═══ Layout ═══════════════════════════════════════════ */}
      <div className="docs-layout">
        {/* Sidebar */}
        <motion.nav
          className="docs-nav"
          aria-label="Documentación"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3, ease: 'easeOut' }}
        >
          <motion.button
            className="docs-nav__home"
            onClick={() => setActivePage('overview')}
            whileTap={{ scale: 0.98 }}
          >
            <HomeIcon />
            Home
          </motion.button>

          {TABS.map((tab) => {
            const isExpanded = expandedGroups.has(tab.id);
            const items = tab.groups[0]?.items ?? [];
            return (
              <div className="docs-nav__group" key={tab.id}>
                <motion.button
                  className="docs-nav__group-header"
                  onClick={() => toggleGroup(tab.id)}
                  whileTap={{ scale: 0.985 }}
                  aria-expanded={isExpanded}
                >
                  <span className={`docs-nav__group-icon docs-nav__group-icon--${tab.color}`}>
                    <TabIcon iconKey={tab.iconKey} />
                  </span>
                  <span className="docs-nav__group-label">{tab.label}</span>
                  <motion.svg
                    className="docs-nav__group-chev"
                    width="12" height="12" viewBox="0 0 16 16"
                    fill="none" stroke="currentColor" strokeWidth="1.75"
                    strokeLinecap="round" strokeLinejoin="round"
                    animate={{ rotate: isExpanded ? 0 : -90 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    <path d="M4 6l4 4 4-4" />
                  </motion.svg>
                </motion.button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      className="docs-nav__group-items"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="docs-nav__group-items-inner">
                        <LayoutGroup id={`docs-sidebar-active-${tab.id}`}>
                          {items.map((item) => {
                            const isActive = item.id === activePage;
                            return (
                              <motion.button
                                key={item.id}
                                className={`docs-nav__link ${isActive ? 'docs-nav__link--active' : ''}`}
                                onClick={() => setActivePage(item.id)}
                                aria-current={isActive ? 'page' : undefined}
                                whileTap={{ scale: 0.985 }}
                              >
                                {isActive && (
                                  <motion.span
                                    className="docs-nav__link-active-bg"
                                    layoutId={`docs-sidebar-active-${tab.id}`}
                                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                                  />
                                )}
                                {!isActive && <span className="docs-nav__link-hover-bg" aria-hidden />}
                                <span className="docs-nav__link-label">{item.label}</span>
                                <span className="docs-nav__link-tail">
                                  {item.badge && (
                                    <span className={`docs-nav__badge docs-nav__badge--${item.badge.toLowerCase()}`}>
                                      {item.badge}
                                    </span>
                                  )}
                                  {item.method && (
                                    <span className={`docs-nav__tag docs-tag--${item.method.toLowerCase()}`}>
                                      {item.method}
                                    </span>
                                  )}
                                </span>
                              </motion.button>
                            );
                          })}
                        </LayoutGroup>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          <div className="docs-nav__footer">
            <div className="docs-nav__locale">
              <span className="docs-nav__locale-flag">🇲🇽</span>
              <span>México</span>
            </div>
            <div className="docs-nav__locale">
              <GlobeIcon />
              <span>Español (MX)</span>
            </div>
          </div>
        </motion.nav>

        {/* Main */}
        <main className="docs-main">
          <div
            className={
              page.layout === 'solo'
                ? 'docs-page docs-page--solo'
                : page.layout === 'full'
                ? 'docs-page docs-page--full'
                : page.sample
                ? 'docs-page docs-page--api'
                : 'docs-page'
            }
          >
            <AnimatePresence mode="wait">
              <motion.article
                key={activePage}
                className="docs-prose"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <div className="docs-crumb">
                  <button className="docs-crumb__link" onClick={() => setActivePage('overview')}>
                    Home
                  </button>
                  <span className="docs-crumb__sep">/</span>
                  <button className="docs-crumb__link" onClick={() => goToTab(activeTab)}>
                    {currentTab.label}
                  </button>
                  {page.crumb.length > 1 && (
                    <>
                      <span className="docs-crumb__sep">/</span>
                      <span className="docs-crumb__current">{page.title}</span>
                    </>
                  )}
                </div>

                <h1>{page.title}</h1>
                {page.intro != null && (
                  <p className="docs-sub">
                    {typeof page.intro === 'function' ? page.intro(go) : page.intro}
                  </p>
                )}

                <div className="docs-actionbar">
                  <ActionBtn label="Preguntar sobre esta página"><SparkleIcon /></ActionBtn>
                  <ActionBtn label="Copiar para LLM"><CopyIcon /></ActionBtn>
                  <ActionBtn label="Ver como Markdown"><MarkdownIcon /></ActionBtn>
                  <ActionBtn label="Instalar tools"><DownloadIcon /></ActionBtn>
                </div>

                <hr className="docs-divider" />

                {page.body(go)}
              </motion.article>
            </AnimatePresence>

            {page.layout !== 'solo' && page.layout !== 'full' && (
              <aside className="docs-rail">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePage}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut', delay: 0.06 }}
                  >
                    {page.sample ? (
                      <SamplePanel sample={page.sample} />
                    ) : page.toc && page.toc.length > 0 ? (
                      <TocPanel entries={page.toc} />
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </aside>
            )}
          </div>
        </main>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function ThemeToggle({ theme, onToggle }: { theme: 'light' | 'dark'; onToggle: () => void }) {
  return (
    <motion.button
      className="docs-theme-toggle"
      onClick={onToggle}
      aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
      whileTap={{ scale: 0.9 }}
      whileHover={{ rotate: theme === 'light' ? -20 : 20 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'light' ? (
          <motion.svg
            key="moon"
            width="15" height="15" viewBox="0 0 16 16"
            fill="none" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
            initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
            transition={{ duration: 0.2 }}
          >
            <path d="M13 9.5A6 6 0 0 1 6.5 3 6 6 0 1 0 13 9.5z" />
          </motion.svg>
        ) : (
          <motion.svg
            key="sun"
            width="15" height="15" viewBox="0 0 16 16"
            fill="none" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
            initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
            transition={{ duration: 0.2 }}
          >
            <circle cx="8" cy="8" r="3" />
            <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3 3l1 1M12 12l1 1M3 13l1-1M12 4l1-1" />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function ActionBtn({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <motion.button
      className="docs-actionbar__item"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {children}
      {label}
    </motion.button>
  );
}

function SamplePanel({ sample }: { sample: Sample }) {
  const langs = sample.langs && sample.langs.length > 0 ? sample.langs : null;
  const [activeLang, setActiveLang] = useState(sample.activeLang ?? langs?.[0] ?? '');

  const visibleBlocks = sample.blocks.filter((b) => {
    if (!b.lang) return true;
    return b.lang === activeLang;
  });

  return (
    <div className="docs-samples">
      <div className="docs-samples__top">
        <span className={`docs-verb docs-verb--${sample.method.toString().toLowerCase()}`}>
          {sample.method}
        </span>
        <span className="docs-path">{sample.path}</span>
      </div>
      {langs && (
        <div className="docs-samples__lang">
          {langs.map((l) => (
            <button
              key={l}
              className={l === activeLang ? 'is-active' : ''}
              onClick={() => setActiveLang(l)}
            >
              {l}
            </button>
          ))}
        </div>
      )}
      {visibleBlocks.map((block, i) => (
        <div key={i}>
          <div className="docs-samples__section">
            {block.section}
            <button className="docs-samples__copy" onClick={(e) => copyPre(e.currentTarget)}>
              Copiar
            </button>
          </div>
          <pre>{block.code}</pre>
        </div>
      ))}
    </div>
  );
}

function TocPanel({ entries }: { entries: { id: string; label: string }[] }) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <div className="docs-toc">
      <div className="docs-toc__title">En esta página</div>
      {entries.map((e) => (
        <motion.button
          key={e.id}
          className="docs-toc__link"
          onClick={() => scrollTo(e.id)}
          whileHover={{ x: 2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          {e.label}
        </motion.button>
      ))}
    </div>
  );
}

function copyPre(btn: HTMLButtonElement) {
  const section = btn.closest('.docs-samples__section');
  if (!section) return;
  let sib: Element | null = section.nextElementSibling;
  while (sib && sib.tagName !== 'PRE') sib = sib.nextElementSibling;
  if (!sib) return;
  const text = (sib as HTMLElement).innerText;
  try {
    navigator.clipboard.writeText(text);
    const original = btn.textContent;
    btn.textContent = '✓';
    setTimeout(() => { btn.textContent = original; }, 1000);
  } catch { /* noop */ }
}

// ─────────────────────────────────────────────────────────────
// Tab icons (in colored squares)
// ─────────────────────────────────────────────────────────────

function TabIcon({ iconKey }: { iconKey: TabIconKey }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (iconKey) {
    case 'lightning':
      return <svg viewBox="0 0 16 16" {...p}><path d="M9 1L3 9h4l-1 6 6-8H8z" /></svg>;
    case 'braces':
      return <svg viewBox="0 0 16 16" {...p}><path d="M6 2c-1.5 0-2 1-2 2v2c0 1-.5 2-2 2 1.5 0 2 1 2 2v2c0 1 .5 2 2 2M10 2c1.5 0 2 1 2 2v2c0 1 .5 2 2 2-1.5 0-2 1-2 2v2c0 1-.5 2-2 2" /></svg>;
    case 'lightbulb':
      return <svg viewBox="0 0 16 16" {...p}><path d="M5.5 10a4 4 0 1 1 5 0v1.5h-5V10z" /><path d="M6.5 13.5h3M7 15h2" /></svg>;
    case 'book':
      return <svg viewBox="0 0 16 16" {...p}><path d="M3 3h4a2 2 0 0 1 2 2v9a1 1 0 0 0-1-1H3V3z" /><path d="M13 3H9a2 2 0 0 0-2 2v9a1 1 0 0 1 1-1h5V3z" /></svg>;
    case 'flask':
      return <svg viewBox="0 0 16 16" {...p}><path d="M6 2h4M7 2v5.5L3.5 13.2c-.4.7.1 1.8 1 1.8h7c.9 0 1.4-1.1 1-1.8L9 7.5V2" /></svg>;
  }
}

// ─────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7L8 2l6 5" />
      <path d="M4 6.5v7h8v-7" />
    </svg>
  );
}
function BackIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3L5 8l5 5" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M2 8h12M8 2c1.8 2 2.8 4 2.8 6s-1 4-2.8 6c-1.8-2-2.8-4-2.8-6s1-4 2.8-6z" />
    </svg>
  );
}
function SparkleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v3M8 11v3M2 8h3M11 8h3" />
      <path d="M4 4l2 2M12 12l-2-2M4 12l2-2M12 4l-2 2" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="5" width="9" height="9" rx="1.5" />
      <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" />
    </svg>
  );
}
function MarkdownIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="4" width="13" height="8" rx="1.5" />
      <path d="M4 10V6l1.5 2L7 6v4M10 6v4M8.5 8L10 10l1.5-2" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v9M4 7l4 4 4-4M2.5 13.5h11" />
    </svg>
  );
}
