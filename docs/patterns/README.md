# Monato DS — UI Patterns Catalog

> **Source of truth:** Figma file `DS Web 2026 (new)` — fileKey `nau30mpaZ43tyBjogqSvMV`
> **Purpose:** Map every UI Block / Pattern in the Figma file so AI-assisted development composes screens from canonical blocks instead of inventing UI.
> **Status:** Phase 0 — Foundations. No pattern specs written yet; this index defines scope, taxonomy and order of work.

---

## How this catalog works

1. Every Figma page below gets analyzed once → produces one or more **pattern specs** (using `_TEMPLATE.md`).
2. Each pattern receives a stable **Pattern ID** (e.g. `DASH-SIDEBAR`, `APP-TABLE`, `MKT-HERO`). Requests reference these IDs.
3. A pattern spec records: purpose, when to use / not use, anatomy (slots), variants, tokens consumed, code status in `monato-ds`, and composition rules.
4. The catalog feeds `CLAUDE.md` (the AI contract) so generation is constrained to documented blocks only.

**Rule zero:** if a requested screen needs a block that has no spec here, the block gets specced first (or flagged as `UNMAPPED`) — never improvised.

---

## Figma page map (full inventory)

Node IDs are the page-level canvas IDs. Status: `pending` → `analyzed` → `specced` → `in-code`.

### ❖ Foundations — `1373:3920`

| Page | Node ID | Status | Notes |
|---|---|---|---|
| Colors | `1373:8125` | in-code | Synced to `tokens.css` (13 May 2026) |
| Typography | `1373:8122` | in-code | DM Sans scale in `tokens.css` |
| Icons | `1134:499` | in-code | `@tailgrids/icons` |
| Shadows | `5113:3475` | in-code | Traced manually from Figma effects |
| Spacing | `5118:4845` | in-code | Base-4 scale in `tokens.css` |
| Border Radius | `5120:16362` | in-code | `--radius-*` in `tokens.css` |
| Grid Layouts | `5118:5116` | pending | Listed under Marketing in Figma; belongs here conceptually |

### ❖ Core Components — `7233:7034`

Atomic/molecular components. These are the building blocks patterns consume — they map 1:1 to `src/components/`.

| Page | Node ID | Status | Code status |
|---|---|---|---|
| Alerts | `5126:9937` | pending | — |
| Avatars | `5110:8081` | pending | — |
| Buttons | `1397:20025` | pending | ✅ `Button` built |
| Badges | `5128:6174` | pending | ✅ `Badge` built |
| Checkbox | `5110:13405` | pending | — |
| Dropdowns | `7209:83966` | pending | — (portal pattern required) |
| Input fields | `5108:45417` | pending | ✅ `Input` built |
| Progress Bar | `5120:45366` | pending | — |
| Toggle | `5126:2563` | pending | — |
| Popovers | `5128:4603` | pending | — |
| Tooltips | `5128:4854` | pending | — |
| Pagination | `5128:49681` | pending | — |
| Breadcrumbs | `11245:39614` | pending | — |
| Sliders | `11252:41665` | pending | — |
| Clipboard | `7233:7032` | pending | — |
| Date Picker | `7241:2194` | pending | — |
| Time Picker | `7248:1752` | pending | — |
| Toast | `7278:1509` | pending | — |
| List | `7305:3119` | pending | — |
| Tabs | `7321:1180` | pending | — |
| Spinners | `7444:1456` | pending | — |
| Skeleton | `7468:1637` | pending | — |
| Accordion/FAQ | `9987:173304` | pending | — |
| Navigation Menu | `16431:3321` | pending | — |
| Menubar | `16436:27015` | pending | — |
| ❖ Components (shared symbols) | `7404:2362` | pending | Tab menu, Rating star, Section title, Logo, Author info, etc. |

### 🎛️ Application UI Blocks — prefix `APP-`

| Page | Node ID | Status |
|---|---|---|
| Blog sections | `7348:7186` | pending |
| Blog details | `7638:12015` | pending |
| Bento Grids | `7873:2069` | pending |
| Cards | `7521:2821` | pending |
| Contact sections | `7619:424` | pending |
| Cookies | `7655:1113` | pending |
| Error Pages | `7672:139` | pending |
| Mega Menu | `7259:1472` | pending |
| Modals | `7738:1298` | pending |
| Sign In / Sign Up | `7753:735` | in-code — adaptado a login en `src/CLP.tsx` (`LoginScreen`), basado en nodo `8549:1901` (variante "Sign up" adaptada como login) |
| Sticky Bars | `16256:2550` | pending |
| Gallery | `7483:327` | pending |
| Tables | `7832:3869` | pending |
| Search Modal | `10841:32001` | pending |
| Paywall | `11277:43358` | pending |
| Notifications | `11561:23909` | pending |
| File upload | `11598:73808` | pending |
| Forms | `16256:4851` | pending |

### 📊 Dashboard UI Blocks — prefix `DASH-` *(highest priority for Monato products)*

| Page | Node ID | Status |
|---|---|---|
| Charts | `3216:14155` | pending |
| Chat Boxes | `10300:7457` | pending |
| Chat List | `10489:108528` | pending |
| Calendars | `10513:49544` | pending |
| Data Stats | `10575:21854` | pending |
| Drawers | `10621:114172` | pending |
| Horizontal Navbar | `10687:3163` | pending |
| Maps | `10726:1611` | pending |
| Page Titles | `10718:49999` | pending |
| Steps | `10751:22651` | pending |
| Widget | `10744:67984` | pending |
| Profiles | `10886:10532` | pending |
| Select Box | `10886:7690` | pending |
| Settings Pages | `10947:23747` | pending |
| Sidebar (Vertical Navbar) | `10947:23748` | **in-code** → `dashboard/DASH-SIDEBAR.md` · `src/blocks/Sidebar/` |

### 📢 Marketing UI Blocks — prefix `MKT-`

| Page | Node ID | Status |
|---|---|---|
| Navbars | `7714:5644` | pending |
| Footers | `7799:2132` | pending |
| About | `7953:16850` | pending |
| Brands | `8044:3184` | pending |
| CTA | `8085:9591` | pending |
| Features & Services | `8111:4656` | pending |
| Header Hero Area | `8158:488` | pending |
| Newsletter | `8222:27657` | pending |
| Portfolio | `8240:36286` | pending |
| Pricing Tables | `8271:678` | pending |
| Stats | `8309:1902` | pending |
| Teams | `8365:7216` | pending |
| Testimonials | `8380:1377` | pending |

### 🛒 E-Commerce UI Blocks — prefix `ECOM-` *(relevant for merchant/checkout prototypes, e.g. 1xBet-style demos)*

| Page | Node ID | Status |
|---|---|---|
| Banner | `9307:16687` | pending |
| Checkout | `9324:28341` | in-code — adaptado como "Payment Experience" en `src/PaymentLinks.tsx`, basado en nodos `428:7237`/`429:7867`/`429:8118`/`321:7333`/`321:7218` del archivo `CLP V1.0 (May 2026)` (fileKey `2OYrByr8jqGsErdGtAQLRT`), no de este node. TODO: spec `ecommerce/ECOM-CHECKOUT.md` |
| E-Commerce Navbars | `9478:38074` | pending |
| E-Commerce Headers Hero Area | `9478:38094` | pending |
| E-Commerce Footers | `9478:38093` | pending |
| Featured Products | `9530:29322` | pending |
| Filter | `9618:12175` | pending |
| Product Reviews | `9697:2141` | pending |
| Product Carousels | `9730:23645` | pending |
| Product Details | `9741:4067` | pending |
| Product Grids | `9771:11814` | pending |
| Product Categories | `9795:4320` | pending |
| Quick Views | `9808:41692` | pending |
| Order Summaries | `9670:155719` | pending |
| Shopping Cart | `9808:41696` | pending |
| Wishlists | `9808:41693` | pending |

### 🤖 AI Components UI Blocks — prefix `AI-`

| Page | Node ID | Status | Notes |
|---|---|---|---|
| Sidebar | `10370:30437` | pending | |
| AI Hero | `10087:4822` | pending | |
| Text Generator | `10087:4823` | skip | Marked 🗑️ in Figma — deprecated |
| Code Generator | `10087:4825` | skip | Marked 🗑️ in Figma — deprecated |
| Image Generator | `10087:4824` | skip | Marked 🗑️ in Figma — deprecated |

---

## Analysis order (batches)

Priority follows Monato product needs: dashboards and application surfaces first, marketing last.

| Batch | Scope | Why first/last |
|---|---|---|
| **1** | Dashboard UI Blocks (15 pages) | Monato Pay / BillPay / IFPE product surfaces are dashboards |
| **2** | Application UI Blocks (18 pages) | Tables, Forms, Modals, Sign In — needed by every prototype |
| **3** | Core Components (26 pages) | Formal specs for atoms; several already in code |
| **4** | E-Commerce UI Blocks (16 pages) | Merchant-side demos (1xBet-style integrations) |
| **5** | Marketing + AI Blocks (15 pages) | Lowest product relevance |

Each batch = one working session. Per page: `get_metadata` (inventory) → `get_screenshot` (visual reference) → `get_design_context` (only on ambiguous nodes) → pattern spec(s) written from `_TEMPLATE.md` → Alex validates → status updated here.

---

## File layout

```
docs/patterns/
├── README.md            ← this file (index + tracker)
├── _TEMPLATE.md         ← pattern spec template
├── REQUESTING-UI.md     ← how to request UI (ticket format)
├── dashboard/           ← DASH-* specs
├── application/         ← APP-* specs
├── core/                ← CORE-* specs
├── ecommerce/           ← ECOM-* specs
└── marketing/           ← MKT-* / AI-* specs
```
