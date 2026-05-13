# Monato Design System Skill

## Description

Use this skill whenever the conversation involves the Monato design system: creating or modifying components, reviewing visual consistency, working with tokens, building prototypes, or explaining how any part of the system works. Trigger words: "componente", "token", "color", "Button", "Card", "prototipo", "BillPay", "IFPE", "Cash", "animación", or any reference to the visual style of Monato products.

## Vocabulary map — ES ↔ EN

When the designer speaks Spanish, map to English code equivalents:

| Español | English (código) |
|---|---|
| Botón | Button |
| Tarjeta | Card |
| Campo / Input | Input |
| Alerta | Alert |
| Insignia / Etiqueta | Badge |
| Interruptor | Toggle |
| Casilla | Checkbox |
| Menú desplegable | Dropdown |
| Pestaña | Tab |
| Modal / Ventana | Modal |
| Notificación | Toast |
| Esqueleto | Skeleton |
| Primario | primary |
| Secundario | secondary |
| Fantasma | ghost |
| Deshabilitado | disabled |
| Error | error |
| Éxito | success |
| Advertencia | warning |

## Token taxonomy — three layers

**Layer 1 — Primitives** (`src/design-system/tokens.css`): raw values named after what they are. `--primitive-skyblue-500`, `--space-4`, `--radius-lg`. These describe the value, not the use. Never reference primitives directly in components.

**Layer 2 — Semantic tokens**: meaning-aware, named after their purpose. `--color-btn-primary-bg`, `--color-text-title`, `--color-status-error-text`. These are what components consume. Changing a semantic token updates every component that uses it automatically.

**Layer 3 — Component tokens**: scoped to one component only. Use sparingly. If you find yourself creating many, it means a semantic token is missing.

## Monato brand colors (for reference)

- Brand primary: `--color-interactive` → Skyblue 500 `#0894c8`
- Brand dark: Bluedark 500 `#182449`
- Text title (light): `#18181b`
- Background primary (light): `#ffffff`
- Focus ring: `#5ab7da`

The system supports light and dark modes via `[data-theme="light"]` and `[data-theme="dark"]` on the `<html>` element.

## Component pattern

Every component follows this exact structure:
src/components/ComponentName/
├── index.tsx       ← the React component
└── styles.css      ← co-located styles (if needed beyond Tailwind)

Props type defined immediately above the component function. Variants passed as props, translated to Tailwind classes or CSS variable overrides. Default export always.

## Animation rules

**Simple transitions** (hover, focus, color change): Tailwind utilities.
```tsx
className="transition-colors duration-150 ease-out"
```

**Entrance/exit animations** (modals, toasts, dropdowns): Motion.
```tsx
import { motion, AnimatePresence } from 'motion/react'

<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.15, ease: 'easeOut' }}
/>
```

**Standard durations:**
- Micro (hover, focus): 100–150ms
- Short (dropdowns, tooltips): 150–200ms
- Medium (modals, panels): 200–300ms
- Long (page transitions): 300–400ms

## DesktopShell — prototype wrapper

Every product prototype is wrapped in DesktopShell. It simulates a macOS-style desktop environment:

- Dark gradient background (Bluedark 900 → 700)
- Floating window with title bar, traffic light buttons (close/minimize/maximize)
- Left sidebar with product navigation
- Main content area

```tsx
<DesktopShell productName="BillPay" >
  {/* prototype screens go here */}
</DesktopShell>
```

## Accessibility checklist (WCAG 2.1 AA)

Every interactive component must have:
- [ ] `focus-visible` ring using `--color-focus-ring`
- [ ] Color contrast ≥ 4.5:1 for text, ≥ 3:1 for UI elements
- [ ] Keyboard navigation (Tab, Enter, Space, Escape where applicable)
- [ ] `aria-label` or visible label for icon-only buttons
- [ ] `disabled` state that prevents interaction and reduces opacity

## Pre-write step (mandatory)

Before writing any component, output this in chat:

> **Tokens:** [list semantic tokens to be used]
> **Variants:** [list variants]
> **States:** [list states: default, hover, focus, disabled, etc.]
> **Behavior:** [one sentence]

Wait for the designer's confirmation (Karola & Alex). Only then write code.
