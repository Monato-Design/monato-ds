# Demo 1xBet — Prototipo Crossborder

Prototipo navegable que simula el sitio de recarga de 1xBet con **Monato Pay** integrado como mejor opción de fondeo. Sigue el mismo patrón que `CrossBorder.tsx`: exporta una **entry card** que abre el prototipo en un overlay fullscreen con ventana Mac.

## Narrativa
- **1xBet** se ve crudo, estética azul-sucio original (NO usa tokens del DS).
- **Monato Pay** es el único elemento pulido, usa exclusivamente tokens del DS.
- El contraste visual es el argumento de venta.

## Instalación
La carpeta va en `src/1xbet/` (junto a `CLP.tsx` y `CrossBorder.tsx`):

    cd ~/Projects/monato-ds
    unzip ~/Downloads/1xbet-prototype.zip -d src/

## Conectarlo al catálogo (DOS cards en la vista CrossBorder)
Busca el archivo donde se renderiza `<CrossBorderPrototype />` (probablemente App.tsx o
el archivo de la sección CrossBorder) y agrega la card de 1xBet justo debajo:

    import { CrossBorderPrototype } from './CrossBorder';
    import { Demo1xbetPrototype } from './1xbet';   // nuevo

    <CrossBorderPrototype />
    <Demo1xbetPrototype />     // nueva card, debajo

## Imports a verificar
index.tsx importa Button y Badge del DS (relativo a src/1xbet/):

    import { Button } from '../components/core/button';
    import { Badge } from '../components/core/badge';

Coincide con cómo CrossBorder.tsx los importa desde src/. Ajusta si tu estructura difiere.
También usa framer-motion (ya lo usa CrossBorder).

## Flujo
1. Entry card -> "Abrir prototipo" -> overlay fullscreen.
2. Home (header + hero del bono + partidos).
3. CTA de depósito -> vista Recharge.
4. Recharge: grid de métodos con Monato Pay destacado (2x, badge "Tu mejor opción").
5. Click Monato Pay -> modal con tabs SPEI (Recomendable) / Crypto.
6. Form -> CTA -> CLABE (SPEI) o dirección + QR (Crypto).
7. Logo "1XBET" -> vuelve al Home.
8. Punto rojo de la ventana Mac -> cierra el prototipo.

## Notas
- Badge "Tu mejor opción": inline en monato-pay.css, migrar a <Badge> cuando esté listo.
- Modal usa inputs/botones nativos estilizados con tokens; el entry card SÍ usa Button/Badge del DS.
- QR: SVG pseudo-aleatorio, no escaneable.
- Tipo de cambio: constante USDC_RATE en MonatoPayModal.tsx (16.94).
