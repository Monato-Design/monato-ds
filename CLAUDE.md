# CLAUDE.md — Monato Design System (monato-ds)

AI contract for this repo. Any AI assistant (Claude Code, Claude.ai) working here follows these rules.

## Project

- Monato Design System: component library + prototype platform for Monato's payment products (BillPay, IFPE, Cash, Monato Pay).
- Stack: React + TypeScript + Vite + Tailwind CSS v4 + CSS custom properties. framer-motion for animation. `@tailgrids/icons` for icons.
- Deployed on Vercel, auto-deploy on push to `main`.
- Figma source of truth: `DS Web 2026 (new)` — fileKey `nau30mpaZ43tyBjogqSvMV`.

## Token rules

- All styling via tokens in `src/tokens.css`. **Never hard-coded values.** If a token doesn't exist in `tokens.css`, it doesn't exist — do not invent token names.
- Primary color: Skyblue `#0894c8` → `--primitive-skyblue-500`.
- Typography: DM Sans (`--font-family-sans`).
- Button border radius: `--radius-default` (4px).
- **Approved deviations** (documented exceptions, do not "fix"):
  - Borders use `#d9e2ec` directly — the token `border-base-200` renders too dark.

## Component rules

- File layout: `src/components/[Name]/index.tsx` + `styles.css`.
- Icon props: `@tailgrids/icons` accepts only `size` and `className` — no `strokeWidth`.
- Inputs: `outline-none border-none ring-0` to suppress browser focus rings.
- All dropdowns/floating elements use `createPortal` (escapes the `overflow-hidden` Mac wrapper).
- Back buttons: bottom footer actions only — never duplicated at the top of screens.

## Prototype rules

- All prototypes use the **Mac-window wrapper**. Non-negotiable. Never remove it.
- Logo via static import: `import LogoDefault from './assets/logo-default.png'` — never a path string (breaks on Vercel).
- Prefer PNG over SVG for assets (Vite vs Vercel/Rollup resolve SVG imports differently).
- Asset paths are depth-sensitive: files in `src/[proto]/components/` reach assets via `../../assets/`.
- Binary assets must be staged explicitly: `git add src/assets/[file].png`.

## UI Patterns (docs/patterns/)

1. **Compose, don't invent.** Screen/section requests are resolved by composing patterns from `docs/patterns/README.md`. If a needed block has no spec, flag it as `UNMAPPED` in the pre-write — never improvise structure.
2. **Pattern IDs are the vocabulary.** Requests use IDs (`DASH-SIDEBAR`, `APP-TABLE`) or plain names that map to one. State the resolved Figma node-id in the pre-write.
3. **Slots are the contract.** Content fills a pattern's slots as defined in its spec. Restructuring a block's anatomy requires updating the spec first.
4. **Tickets follow `docs/patterns/REQUESTING-UI.md`.** Omitted ticket fields → DS defaults, assumptions stated in the pre-write.
5. **Specs win over memory.** When generating a pattern that has a spec, read the spec — tokens, variants and composition rules come from there.
6. **Status discipline.** When a pattern lands in code, update its spec (`Code status`, `Code path`) and the tracker in `docs/patterns/README.md` in the same commit.

## Workflow

1. **Pre-write before any code:** target file(s), tokens to use, patterns resolved (with Figma node-ids), pending decisions. Wait for confirmation.
2. **Surgical changes only.** Never rewrite what already works. No unrequested changes.
3. **Verify current file state before editing.** The most common source of lost work is patching an outdated file. Apply all pending changes in one pass.
4. Git: `git add [files] && git commit -m "[concise, accurate message]" && git push origin main`.

## Language

- Conversations in Spanish. Code, comments, commits and docs in English.
