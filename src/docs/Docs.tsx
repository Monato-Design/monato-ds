// src/docs/Docs.tsx
// Shell of the documentation.
// Layout: Stripe-inspired structure, tokens/colors from Monato DS.
// Motion: framer-motion for tab underline, sidebar active pill, page transitions,
//         card hover, action-bar tap, and exit redirect loader.

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Button } from '../components/core/button';
import { TABS, PAGE_TO_TAB, type PageId, type TabId } from './nav';
import { PAGES, type Sample } from './pages';
import { DocsLoader } from './DocsLoader';
import LogoDefault from '../assets/logo-default.png';
import './docs.css';

interface DocsProps {
  onBackToDS: () => void;
}

export function Docs({ onBackToDS }: DocsProps) {
  const [activePage, setActivePage] = useState<PageId>('overview');
  const [isExiting, setIsExiting] = useState(false);
  const activeTab: TabId = PAGE_TO_TAB[activePage];

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [activePage]);

  const go = (id: PageId) => setActivePage(id);
  const goToTab = (tabId: TabId) => {
    const tab = TABS.find((t) => t.id === tabId);
    if (tab) setActivePage(tab.landing);
  };

  const handleBack = () => setIsExiting(true);

  const currentTab = useMemo(() => TABS.find((t) => t.id === activeTab)!, [activeTab]);
  const page = PAGES[activePage];

  // Exit loader takes over the whole viewport when leaving
  if (isExiting) {
    return (
      <DocsLoader
        variant="exit"
        onReady={onBackToDS}
        delayMs={2500}
      />
    );
  }

  return (
    <motion.div
      className="docs-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* ═══ Header (2 rows) ═══════════════════════════════════ */}
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
            <Button size="sm" appearance="outline" onClick={handleBack}>
              <BackIcon size={13} />
              Back to DS
            </Button>
          </motion.div>
        </div>

        <LayoutGroup id="docs-tabs">
          <nav className="docs-header__row2" aria-label="Secciones">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`docs-tab ${tab.id === activeTab ? 'docs-tab--active' : ''}`}
                onClick={() => goToTab(tab.id)}
              >
                {tab.label}
                {tab.id === activeTab && (
                  <motion.div
                    className="docs-tab__underline"
                    layoutId="docs-tab-underline"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
              </button>
            ))}
          </nav>
        </LayoutGroup>
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

          <LayoutGroup id={`docs-sidebar-${activeTab}`}>
            {currentTab.groups.map((group, gi) => (
              <div className="docs-nav__section" key={gi}>
                <div className="docs-nav__eyebrow">{group.eyebrow}</div>
                {group.items.map((item) => {
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
                          layoutId={`docs-sidebar-active-${activeTab}`}
                          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                        />
                      )}
                      {!isActive && <span className="docs-nav__link-hover-bg" aria-hidden />}
                      <span>{item.label}</span>
                      {item.method && (
                        <span className={`docs-nav__tag docs-tag--${item.method.toLowerCase()}`}>
                          {item.method}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ))}
          </LayoutGroup>

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
                {/* Breadcrumb */}
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

                {/* Action bar */}
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
// Icons (thin outline, 14px, sized by parent font)
// ─────────────────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7L8 2l6 5" />
      <path d="M4 6.5v7h8v-7" />
    </svg>
  );
}

function BackIcon({ size = 13 }: { size?: number }) {
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
