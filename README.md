# Monato Design Sytem

Componentes React para los productos Monato. Construido sobre Tailwind v4 y temado vía tokens sincronizados con el Figma `DS Web 2026`.

## Cómo está hecho

Tres archivos hacen el trabajo:

```
src/
├── tokens/
│   ├── monato.css         ← fuente de verdad. Sincronizado desde Figma vía MCP.
│   └── theme-bridge.css   ← capa de mapeo entre nombres Monato y nombres que esperan los componentes.
└── components/core/       ← 30 componentes basados en Tailgrids, sin tocar.
```

`monato.css` define los tokens en 3 capas: primitives (raw colors, spacing, radii), semánticos (`--color-text-title`, `--color-button-primary-background`, etc.) y tipografía. Light y dark se manejan con `[data-theme="dark"]` sobre los mismos nombres semánticos.

`theme-bridge.css` re-expone los semánticos Monato dentro de un `@theme inline {}` con los nombres que los componentes de `components/core/` esperan (heredados del paquete Tailgrids Pro). Usa `@theme inline` para que `var(...)` se resuelva en runtime y el toggle de `[data-theme]` siga funcionando sin tocar nada más.

Los componentes en `components/core/` no saben nada de Monato. Usan clases tipo `bg-button-primary-background` que Tailwind v4 genera desde el bridge.

## Por qué este approach

Reescribir 30 componentes desde cero toma semanas. Adoptarlos como está y reskinearlos vía tokens toma horas. El brand de Monato vive en un solo archivo (`monato.css`), no embedido en cada componente.

Cuando el Figma cambia, se re-sincroniza `monato.css` y todo se reflejea sin tocar componentes.

## Decisiones arquitectónicas

**Por qué un repo nuevo, no migración del anterior:** los 3 componentes que teníamos (Button, Input, Badge) están reemplazados por las versiones de Tailgrids — el trabajo previo no era extensible al stack que adoptamos.

**Por qué Tailgrids:** cubre todo el roadmap (Card, Form, Modal, Toast, Nav) más 25+ componentes adicionales. Stack idéntico al nuestro: React 19 + TS + Tailwind v4 + CVA. Convención de tokens compatible con Figma DS.

**Por qué `@theme inline`:** sin `inline`, Tailwind congela los valores en build time y `[data-theme="dark"]` deja de funcionar. Con `inline`, los `var(...)` quedan en las utilities generadas y se resuelven en runtime.

**Por qué no renombramos los tokens Tailgrids para que coincidan con Monato:** el bridge es una capa fina (un archivo, ~470 líneas). Renombrar 300+ referencias dentro de 30 componentes es ruidoso y se rompería en la próxima actualización de Tailgrids.

## Coverage del bridge

302 / 302 tokens `--color-*` mapeados:

- **159** mapeos explícitos a semánticos Monato
- **138** auto-matches por convenciones de naming (singular ↔ plural, `-background` ↔ `-bg`)
- **0** quedan con valores Tailgrids originales

## Pendientes Figma

El bridge declara algunos tokens que **no existen aún** en el Figma DS Web 2026 — los reusamos de equivalentes Monato. Hay que surfacearlos al Figma:

- `--color-button-*-focus-ring` → usa `--color-focus-ring`
- `--color-button-ghost-*` → derivado de close-icon variant
- `--color-chart-tick/legend/grid` → derivado de text/border
- `--color-tooltip-background` → usa `status-dark-solid-bg`

## Setup

```bash
npm install
npm run dev
```

Abre el smoke test en `src/App.tsx`. El botón "Toggle dark/light" en el header valida que el theme switch funciona.

## Roadmap inmediato

1. **Smoke test visual** — confirmar que Button, Badge, Input y Alert se ven Monato (skyblue, no indigo Tailgrids)
2. **Reskin específico** — ajustar el ghost button, decidir si tomamos los íconos `@tailgrids/icons` o migramos a algo propio
3. **Logo** — añadir `monato-01-primario_horizontal.svg` y crear un componente `Logo` con variantes light/dark
4. **Storybook o catálogo** — alternativa a `src/App.tsx` para navegar los 30 componentes

## Estado de componentes

`components/core/` incluye:

Accordion, Alert, Avatar, Badge, Breadcrumbs, Button, Button Group, Checkbox, Date Picker, Dialog, Drawer, Dropdown, Input, Label, Link, List, Modal, Native Select, OTP Input, Pagination, Popover, Progress, Radio Input, Skeleton, Slider, Social Button, Spinner, Table, Tabs, Text Area, Time Picker, Toast, Toggle, Tooltip.

Todos vienen con look Monato vía el bridge. Si algo no se ve bien, es bug del bridge — abrir issue y referenciar el token que falla.

## Última sincronización Figma

Tokens sincronizados desde Figma DS Web 2026 (file key `nau30mpaZ43tyBjogqSvMV`) el **13 mayo 2026**.

Para resincronizar: pedirle a Claude que lea las variables del Figma vía MCP y regenere `tokens/monato.css`. El bridge no necesita regenerarse a menos que se renombren tokens semánticos.
