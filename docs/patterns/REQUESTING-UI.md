# Requesting UI — Ticket Format

> Fixed structure for asking Claude (Claude.ai or Claude Code) to build screens, sections or components.
> The goal: you describe **what**, the catalog decides **how**. No need to explain which tokens, components or layout rules to use — that lives in the pattern specs and `CLAUDE.md`.

---

## The template

```md
## UI-REQ: [short title]

**Type:** screen | section | component | prototype-update
**Target:** [where it lives — e.g. src/prototypes/MonatoPayDemo.tsx | new prototype | DS Showcase]
**Layout:** [pattern IDs or names, in reading order]
**Content:** [real or placeholder data per slot — bullet list]
**Variants/States:** [which variants and states to implement]
**Theme:** light | dark | both
**Constraints:** [anything that overrides defaults — optional]
**Out of scope:** [explicitly excluded — optional]
```

### Field rules

- **Layout** is the heart of the ticket. Use Pattern IDs (`DASH-SIDEBAR + DASH-PAGETITLE + 2x DASH-CHART-BAR + DASH-PROFILE`) once the catalog exists. While pages are still `pending`, plain names are fine (`sidebar + page title + 2 bar charts + user info card`) — Claude maps them to the closest Figma block and tells you which node it used.
- **Content** fills slots, never restructures blocks. If your content doesn't fit a block's anatomy, that's a catalog conversation, not a ticket hack.
- **Constraints** is the only place for deviations. Anything not listed there follows DS defaults (tokens, Mac-window wrapper, portal dropdowns, etc.).
- Omitted fields = Claude applies defaults and states the assumptions in the pre-write. You confirm before code.

---

## What Claude does with a ticket

1. **Pre-write** (always, before any code): target file(s), patterns resolved with Figma node-ids, tokens involved, open decisions.
2. You confirm or adjust.
3. Surgical implementation, delivery in the agreed format (ZIP `update/` folder or direct file), commit message suggestion.

If a requested block is `UNMAPPED` (no spec yet), Claude flags it in the pre-write and proposes either: spec it first (adds one step) or build against the Figma node directly with a `TODO: spec` marker.

---

## Examples

### Example 1 — the canonical case

```md
## UI-REQ: Treasury overview dashboard

**Type:** screen
**Target:** new prototype src/prototypes/Treasury.tsx
**Layout:** DASH-SIDEBAR + DASH-PAGETITLE + 2x DASH-CHART-BAR + DASH-PROFILE
**Content:**
- Page title: "Treasury" / subtitle "SPEI + USDC balances"
- Chart 1: monthly SPEI volume (placeholder data, 6 months)
- Chart 2: USDC vs USDT split (placeholder data)
- Profile: user "Fernanda R.", role "Treasury Ops", avatar placeholder
**Variants/States:** sidebar expanded, charts default state only
**Theme:** light
**Constraints:** none
**Out of scope:** real data wiring, dark mode
```

### Example 2 — section inside an existing prototype

```md
## UI-REQ: Recipients verification banner

**Type:** section
**Target:** src/CrossBorder.tsx — Review screen, Recipient details card
**Layout:** APP-ALERT (warning variant)
**Content:** 4 states per CB-202 spec (unverified / pending / verified / error)
**Variants/States:** all four, switchable via prop
**Theme:** light
**Constraints:** border color #d9e2ec (approved deviation)
```

### Example 3 — minimal (defaults do the work)

```md
## UI-REQ: Settings page for Monato Pay demo

**Type:** screen
**Target:** Monato Pay prototype
**Layout:** settings page block (whatever the catalog has)
**Content:** profile section + notifications toggles + API keys table
```

→ Claude resolves layout to `DASH-SETTINGS`, proposes slot content in the pre-write, you confirm.

---

## Anti-patterns

| ❌ Don't | Why |
|---|---|
| "Make it like Stripe's dashboard" | External references bypass the catalog. Reference a pattern or attach the Figma node. |
| Describing pixel positions ("button 24px from the edge") | Spacing is token-driven; the spec owns it. Use **Constraints** only for approved deviations. |
| One ticket with 5 screens | One ticket = one screen or one section. Chain tickets for flows. |
| Restating DS rules in every ticket | They live in `CLAUDE.md` + specs. Repeating them invites drift. |
