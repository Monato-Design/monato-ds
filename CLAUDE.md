# Monato Design System

This is the official Monato design system repository. It contains the design tokens, core components, and interactive product prototypes for Monato's products.

## Project purpose

The Monato DS is the single source of truth for all visual and interactive decisions across Monato products. It exists so that designers and developers share the same language, the same tokens, and the same components — eliminating ambiguity and accelerating product development.

This repository follows Model B: code is the truth, Figma is the visual representation. Changes to the system originate here and are reflected in Figma, not the other way around. The only exception is token sync: tokens are read from Figma variables via MCP and materialized here.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4 for utility classes
- Motion (Framer Motion v11) for animations and interactions
- Plain CSS variables for design tokens (tokens.css)
- Components as isolated .tsx files under src/components/

## Where things live

- `src/design-system/tokens.css` — single source of truth for all design tokens. Never hardcode values.
- `src/components/` — one folder per component in PascalCase. Each has index.tsx and styles.css.
- `src/prototypes/billpay/` — interactive prototype for BillPay.
- `src/prototypes/ifpe/` — interactive prototype for IFPE.
- `src/prototypes/cash/` — interactive prototype for Cash.
- `.claude/skills/monato-ds/SKILL.md` — detailed system rules. Load whenever working with components.

## Rules Claude must always follow

1. **Tokens are sacred.** Never hardcode color, spacing, radius, or font values. Always use CSS variables from tokens.css. If a needed token does not exist, propose adding it first.
2. **Tailwind for layout, tokens for brand.** Tailwind classes for spacing, flex, grid. CSS variables for colors, radii, shadows, typography.
3. **Motion for animations.** All animations use the Motion library. Simple transitions can use Tailwind utilities.
4. **Pre-write step is mandatory.** Before writing any component, state: which tokens it will use, which variants and states, and a one-sentence behavior description. Wait for confirmation.
5. **Accessibility is non-negotiable.** WCAG 2.1 AA minimum. Focus-visible, sufficient contrast, keyboard navigation on every interactive element.
6. **Desktop-first.** Functional at minimum 375px width without breaking.
7. **English for code, Spanish for conversation.** Component names and props in English. Conversations in Spanish. Vocabulary map in SKILL.md.
8. **Components stay small.** ~80 lines max. Suggest splitting if larger.
9. **Prototypes use DesktopShell.** Every prototype wrapped in the DesktopShell component simulating a macOS-style window.

## How to talk to the team

Primary users are Product Designers (Devsigners). Prefer design vocabulary: tokens, variants, states, hierarchy, motion curves. Define technical concepts briefly on first use. Conversations in Spanish, code in English.
