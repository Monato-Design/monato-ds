// src/docs/theme.ts
// Theme state for docs. Scoped to docs only — sets data-theme on
// the docs-root element, not on <html>, so the DS itself is unaffected.

import { useEffect, useState, useCallback } from 'react';

export type DocsTheme = 'light' | 'dark';
const STORAGE_KEY = 'monato-docs-theme';

export function readStoredTheme(): DocsTheme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'dark' || v === 'light') return v;
  } catch { /* ignore */ }
  return 'light';
}

export function storeTheme(theme: DocsTheme) {
  try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
}

export function useDocsTheme() {
  const [theme, setTheme] = useState<DocsTheme>(() => readStoredTheme());

  useEffect(() => { storeTheme(theme); }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, setTheme, toggle };
}
