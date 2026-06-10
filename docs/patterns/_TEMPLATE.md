# [PATTERN-ID] — [Pattern Name]

> Copy this file to the matching category folder and rename it `[PATTERN-ID].md` (e.g. `dashboard/DASH-SIDEBAR.md`).

| Field | Value |
|---|---|
| **Pattern ID** | `DASH-XXXX` |
| **Category** | Dashboard / Application / Core / E-Commerce / Marketing |
| **Figma page** | Page name — `node-id` |
| **Figma node(s)** | Component set node-id(s), one per variant group |
| **Code status** | `not-built` / `in-progress` / `built (path)` |
| **Code path** | `src/components/...` or `src/blocks/...` (if built) |
| **Last reviewed** | YYYY-MM-DD |

## Purpose

One or two sentences: what problem this block solves and where it lives in a screen. Plain, factual.

## When to use

- Concrete scenario 1
- Concrete scenario 2

## When NOT to use

- Anti-scenario 1 → use `[OTHER-ID]` instead
- Anti-scenario 2

## Anatomy (slots)

Named regions of the block. Slots are the contract: requests fill slots, they don't restructure the block.

| Slot | Required | Accepts | Notes |
|---|---|---|---|
| `header` | yes | Card Title (`CORE-CARDTITLE`) | |
| `body` | yes | content | |
| `footer` | no | Button group | |

## Variants & props

Mapped from Figma variant properties (`State=`, `Size=`, `View=`...).

| Prop | Type | Values | Default | Figma property |
|---|---|---|---|---|
| `size` | enum | `sm` `md` `lg` | `md` | `Size` |
| `state` | enum | `default` `hover` `active` | `default` | `State` |

## Tokens consumed

Only tokens that exist in `tokens.css`. Never raw values.

| Role | Token |
|---|---|
| Background | `--color-card-background` |
| Text | `--color-text-body` |
| Border | `--color-border-secondary` |
| Radius | `--radius-xl` |
| Spacing | `--space-4` / `--space-6` |

**Known deviations:** list any approved hard-coded values with the reason (e.g. border `#d9e2ec` instead of token — token renders too dark).

## Composition rules

- What this block can contain (children patterns/components)
- What can contain this block (parent layouts)
- Forbidden combinations
- Responsive behavior (desktop / mobile variant mapping)

## Dependencies

- Core components: `Button`, `Badge`, ...
- Other patterns: `DASH-CARDTITLE`, ...
- Libraries: framer-motion (if animated), createPortal (if floating)

## Accessibility notes

Keyboard behavior, focus order, ARIA roles where non-obvious.

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| | |

## Screenshot reference

`![PATTERN-ID](./assets/PATTERN-ID.png)` — exported from Figma node, committed alongside the spec.
