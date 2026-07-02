// src/docs/nav.ts
// Estructura de navegación de la documentación.
// Top-level tabs (estilo Stripe) + sidebar por tab.
// Los IDs mapean 1:1 al keyof `pages` en ./pages.tsx.

export type PageId =
  // Get started
  | 'overview'
  | 'quickstart'
  | 'cred'
  | 'authg'
  | 'cfgwh'
  | 'sbx'
  // Trabajar con la API
  | 'pag'
  | 'idem'
  | 'err'
  | 'evt'
  // Conceptos
  | 'cliente'
  | 'cuenta'
  | 'numcuenta'
  | 'txc'
  | 'glosario'
  // API Reference
  | 'apiref'
  | 'authn'
  | 'catalog'
  | 'accounts'
  | 'accountnumbers'
  | 'transactions'
  | 'webhooks'
  | 'reports'
  // Sandbox
  | 'sim';

export type TabId =
  | 'get-started'
  | 'work-api'
  | 'concepts'
  | 'api-reference'
  | 'sandbox';

export type Method = 'GET' | 'POST' | 'DEL' | 'PUT';

/** Colored icon square colors (map to --primitive-<color>-* alpha tokens) */
export type TabColor = 'sky' | 'emerald' | 'violet' | 'orange' | 'pink';

/** Icon key — corresponds to a React icon component in Docs.tsx iconMap */
export type TabIconKey = 'lightning' | 'braces' | 'lightbulb' | 'book' | 'flask';

export type Badge = 'New' | 'Updated';

export type NavLink = {
  id: PageId;
  label: string;
  method?: Method;
  badge?: Badge;
};

export type NavGroup = {
  eyebrow: string;
  items: NavLink[];
};

export type TabConfig = {
  id: TabId;
  label: string;
  /** landing page id when tab is opened */
  landing: PageId;
  color: TabColor;
  iconKey: TabIconKey;
  groups: NavGroup[];
};

export const TABS: TabConfig[] = [
  {
    id: 'get-started',
    label: 'Get started',
    landing: 'overview',
    color: 'sky',
    iconKey: 'lightning',
    groups: [
      {
        eyebrow: 'Primeros pasos',
        items: [
          { id: 'overview', label: 'Overview', badge: 'New' },
          { id: 'quickstart', label: 'Quickstart' },
          { id: 'cred', label: 'Credenciales y token' },
          { id: 'authg', label: 'Autenticación' },
          { id: 'cfgwh', label: 'Configurar webhooks' },
          { id: 'sbx', label: 'Sandbox y pruebas' },
        ],
      },
    ],
  },
  {
    id: 'work-api',
    label: 'Trabajar con la API',
    landing: 'pag',
    color: 'emerald',
    iconKey: 'braces',
    groups: [
      {
        eyebrow: 'Trabajar con la API',
        items: [
          { id: 'pag', label: 'Paginación' },
          { id: 'idem', label: 'Idempotencia', badge: 'Updated' },
          { id: 'err', label: 'Errores' },
          { id: 'evt', label: 'Eventos y webhooks' },
        ],
      },
    ],
  },
  {
    id: 'concepts',
    label: 'Conceptos',
    landing: 'cliente',
    color: 'violet',
    iconKey: 'lightbulb',
    groups: [
      {
        eyebrow: 'Conceptos',
        items: [
          { id: 'cliente', label: 'Cliente' },
          { id: 'cuenta', label: 'Cuenta' },
          { id: 'numcuenta', label: 'Número de cuenta' },
          { id: 'txc', label: 'Transacción' },
          { id: 'glosario', label: 'Glosario' },
        ],
      },
    ],
  },
  {
    id: 'api-reference',
    label: 'API Reference',
    landing: 'apiref',
    color: 'orange',
    iconKey: 'book',
    groups: [
      {
        eyebrow: 'API Reference',
        items: [
          { id: 'apiref', label: 'Overview' },
          { id: 'authn', label: 'Authentication', method: 'GET' },
          { id: 'catalog', label: 'Catalog', method: 'GET' },
          { id: 'accounts', label: 'Accounts', method: 'POST' },
          { id: 'accountnumbers', label: 'Account Numbers', method: 'POST' },
          { id: 'transactions', label: 'Transactions', method: 'POST' },
          { id: 'webhooks', label: 'Webhooks', method: 'DEL', badge: 'Updated' },
          { id: 'reports', label: 'Reports', method: 'POST' },
        ],
      },
    ],
  },
  {
    id: 'sandbox',
    label: 'Sandbox',
    landing: 'sim',
    color: 'pink',
    iconKey: 'flask',
    groups: [
      {
        eyebrow: 'Sandbox',
        items: [{ id: 'sim', label: 'Simulaciones', badge: 'New' }],
      },
    ],
  },
];

// Reverse map: pageId → tabId (para saber en qué tab está una page)
export const PAGE_TO_TAB: Record<PageId, TabId> = TABS.reduce(
  (acc, tab) => {
    tab.groups.forEach((g) =>
      g.items.forEach((it) => {
        acc[it.id] = tab.id;
      })
    );
    return acc;
  },
  {} as Record<PageId, TabId>
);

export function findPage(id: PageId): NavLink | undefined {
  for (const tab of TABS) {
    for (const g of tab.groups) {
      for (const it of g.items) {
        if (it.id === id) return it;
      }
    }
  }
  return undefined;
}
