# Giftcards B2C — Prototipo (BillPay)

Flujo de compra de giftcards digitales (EGift) basado en `docs-giftcards.html`:
Catálogo → Detalle (monto FIXED/RANGE + T&C) → Confirmación → Resultado.

## Instalación

```bash
rm -rf src/giftcards && cp -r ~/Downloads/update/giftcards src/giftcards
```

Registra la ruta/entrada en tu App (igual que CLP y CrossBorder):

```tsx
import Giftcards from './giftcards/Giftcards';
// ...agrega la entrada "Giftcards" donde tengas CLP / CrossBorder / 1xBet
```

Prueba con `npm run dev`, luego:

```bash
git add src/giftcards && git commit -m "Add Giftcards B2C prototype" && git push origin main
```

## Logos reales

Cada marca en `data.ts` tiene `logoSrc?` opcional. Mientras esté vacío se
renderiza un wordmark con los colores de marca. Para usar logos reales:

1. Coloca los PNG en `src/giftcards/assets/` (ej. `amazon.png`)
2. En `data.ts`:
   ```ts
   import AmazonLogo from './assets/amazon.png';
   // ...y en la marca: logoSrc: AmazonLogo
   ```
3. `git add src/giftcards/assets/*.png` explícitamente (los binarios no se
   stagean solos).

Nota de ruta: desde `src/giftcards/` usa `./assets/` (assets locales) o
`../assets/` para llegar a `src/assets/`.

## Notas de la implementación

- **API simulada**: los endpoints están "a confirmar" en la doc, así que
  `data.ts` mockea el GET (4 marcas: Amazon y Netflix FIXED; Liverpool y
  Spotify RANGE) y el POST con `transaction_id` UUID v4 (idempotencia).
- **Simulador de errores**: en la barra del Mac window hay un selector
  `API: 200 / 400 / 409 / 503 / timeout` para demostrar el manejo de cada
  fila de la tabla de errores. En 409 y timeout no se ofrece reintento con
  el mismo folio, tal como exige la doc.
- **Montos**: la UI trabaja en pesos; el POST simulado convierte a centavos.
- **Tokens**: todo vía `tokens.css`; bordes con `#d9e2ec` directo;
  radius de botones `--radius-default`; inputs sin focus ring del browser.
- **Iconos**: SVG inline para no depender de nombres no validados de
  `@tailgrids/icons`. Si prefieres migrarlos al paquete, son 6 iconos.
