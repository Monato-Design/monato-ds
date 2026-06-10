# DASH-SIDEBAR — Sidebar (Vertical Navbar)

| Field | Value |
|---|---|
| **Pattern ID** | `DASH-SIDEBAR` |
| **Category** | Dashboard |
| **Figma page** | ↪ Sidebar (Vertical Navbar) — `10947:23748` |
| **Figma node(s)** | Component set `11422:67550` (light) · dark instances in section `11422:89698` |
| **Code status** | partial — a bespoke sidebar exists in the DS Showcase (`src/App.tsx`) and prototypes; not yet a reusable block |
| **Code path** | target: `src/blocks/Sidebar/` |
| **Last reviewed** | 2026-06-10 |

## Purpose

Primary vertical navigation for dashboard/product surfaces. Anchors the left edge of every dashboard screen, holds the logo, grouped nav sections and an optional promo/footer card.

## When to use

- Any dashboard-type screen (product consoles, admin views, Monato Pay / BillPay / IFPE surfaces).
- Prototypes that simulate a logged-in product experience.

## When NOT to use

- Marketing/landing pages → use `MKT-NAVBAR` (horizontal).
- Merchant/checkout demos where the host site owns navigation (e.g. 1xBet-style integrations) → navigation belongs to the host layout.
- Mobile viewports → collapses to `Mobile Header navigation` (page `❖ Components`, node `1570:26180`) — to be specced as `DASH-MOBILEHEADER`.

## Variants (Figma component set)

Five visual types × two views. **V1 is the canonical Monato variant** (carries the Monato logo in Figma); V2–V5 are alternative treatments kept for reference, not for production use unless explicitly requested.

| Type | Expanded width | Collapsed width | Distinguishing traits |
|---|---|---|---|
| **V1** ★ | 290px | 92px | Section labels (MENU/SUPPORT), dropdown groups, footer promo card |
| V2 | 272px | 90px | Search field on top, project list, status legend, credit/usage footer |
| V3 | 280px | 88px | Dark brand header, org switcher |
| V4 | 354px | 90px | Org/profile header, grouped sections (Main menu / Others) |
| V5 | 300px | 92px | User profile header, communities/groups lists |

All types support `View=Expanded | Collapsed`. Collapsed shows icons only (24px), tooltips on hover expected.

Dark mode: same structure, dark semantic tokens (Figma keeps a parallel dark section — do not build separate components; theme switches via `[data-theme="dark"]`).

## Anatomy (slots) — V1

```
Sidebar
├── header        → Logo (Logo component, State=Default, ~144×36)
├── nav[]         → one or more Nav sections:
│   ├── label     → uppercase section label (optional: "MENU", "SUPPORT")
│   └── items[]   → Nav item base (see below)
└── footer        → optional promo/info card OR user block (V4/V5 style)
```

| Slot | Required | Accepts | Notes |
|---|---|---|---|
| `header` | yes | Logo | Static import per DS rule (never path string) |
| `nav` | yes (≥1 section) | nav items, nav-with-dropdown groups | |
| `footer` | no | promo card / user profile block | Card: bg gray-primary, radius 2xl, padding 16 |

### Nav item base (sub-pattern, shared)

Figma `_Nav item base` (`1382:6902` in `❖ Components`) — the atom every sidebar consumes. Props from Figma variants:

| Prop | Values | Default |
|---|---|---|
| `state` | `default` `hover` `active` `focused` | `default` |
| `icon` | boolean | true |
| `arrow` | boolean (+ `direction: up/down`) | false |
| `badge` | boolean | false |

Layout: `px 12 / py 8`, `gap 12`, radius `--radius-lg` (8px), icon 24px, arrow 20px, label 14px Medium. Dropdown children indent `padding-left: 35px`, child rows `py 10`, gap between children 4px.

## Tokens consumed

Container:

| Role | Token |
|---|---|
| Background | `--color-background-white-primary` |
| Right border | `--color-border-primary` |
| Padding | `--space-5` (x) / `--space-8` top / `--space-5` bottom |
| Section gap | `--space-7` |

Nav items (dedicated token group already exists in `tokens.css`):

| Role | Token |
|---|---|
| Item default text | `--color-sidebar-navigation-nav-item-default-text` |
| Item icon | `--color-sidebar-navigation-nav-item-icon` |
| Hover bg / text | `--color-sidebar-navigation-nav-item-nav-hover-background` / `-hover-text` |
| Active bg / text | `--color-sidebar-navigation-nav-item-nav-active-background` / `-active-text` |
| Focused bg | `--color-sidebar-navigation-nav-item-nav-focused-background` |
| Badge bg / text | `--color-sidebar-navigation-nav-item-badge-background` / `-badge-text` |
| Item radius | `--radius-lg` |
| Section label | `--color-text-tertiary-text`, `--font-size-xs`, uppercase |

Footer card:

| Role | Token |
|---|---|
| Background | `--color-sidebar-navigation-footer-background` |
| Title / subtitle | `--color-sidebar-navigation-footer-title` / `-sub-title` |
| Radius | `--radius-2xl` |
| Button | standard `Button` primary tokens |

**Caveat:** Figma's CSS fallback values on this page come from an older palette (e.g. title `#334e68`). Token **names** match `tokens.css`; the **values** in `tokens.css` are the source of truth. Never copy raw hex from Figma output.

**Known deviations:** none specific to this pattern (global `#d9e2ec` border rule does not apply — this block uses `--color-border-primary` for its right edge).

## Composition rules

- Exactly **one** sidebar per screen, full viewport height, left-anchored.
- Pairs with `DASH-HEADER` (top bar) and a main content area; sidebar sits **outside** the scroll container of the content.
- Active state: exactly one item (or one dropdown child) active at a time; parent of an active child shows expanded dropdown.
- Inside prototypes, lives within the Mac-window wrapper like everything else.
- Expanded ↔ Collapsed is a state of the same component (animate width with framer-motion), not two components.
- Dropdown expand/collapse: `AnimatePresence`, chevron rotation — same behavior already shipped in the DS Showcase sidebar.

## Dependencies

- Core: `Logo`, `Badge`, `Button` (footer CTA), icons from `@tailgrids/icons` (24px nav / 20px arrows; `size` + `className` only).
- Sub-pattern: Nav item base (spec lives in this file until promoted).
- Libraries: framer-motion (expand/collapse, dropdowns).

## Accessibility notes

- `<nav aria-label="Main">` landmark; nav lists as `<ul>/<li>`.
- Dropdown triggers: `aria-expanded` + `aria-controls`.
- Active item: `aria-current="page"`.
- Collapsed view: labels via `aria-label` or tooltip; focus ring `--color-focus-ring` (do not suppress on nav items — the input no-ring rule applies to inputs only).

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Use V1 as default; other types only on explicit request | Mix traits from two types in one sidebar |
| Group items under uppercase section labels | Exceed ~2 sections + footer in prototypes (visual noise) |
| Drive active/hover via the `sidebar-navigation` token group | Hard-code `#e6f4fa` or any raw hex from Figma output |
| Keep footer card optional and content-light | Put critical navigation inside the footer card |

## Screenshot reference

`./assets/DASH-SIDEBAR.png` — export of component set `11422:67550` (pending: Figma asset URLs are short-lived; export and commit manually or via Figma export).
