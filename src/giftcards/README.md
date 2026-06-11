# Gift Cards v3.0 — Marketplace B2C (BillPay)

Shell CrossBorder + diseño 100% Figma DS Web 2026 (nau30mpaZ43tyBjogqSvMV):
- Nav de filtros + mega menu (9515-26950) en lugar del stepper
- "Los más vendidos" = Featured Products V3 (9644-5520)
- "Más marcas" = Product Grids V6 (9900-8993)
- Confirmación = Shopping Cart V4 (9964-17551), pago con SALDO ligado
  a la cuenta (sin tarjeta — decisión de Damaris, "una sola bolsa")
- Resultado = Order Summaries V3 (9709-2376)

## Instalación
```bash
rm -rf src/giftcards && cp -r ~/Downloads/update/giftcards src/giftcards
```
App.tsx no cambia (mismo default export).

## Notas
- Flujo: Marketplace → modal de monto → Confirmación → Resultado → portal BHN.
- Saldo demo: $3,500 MXN (constante BALANCE_MXN). Si el total lo excede,
  "Confirmar pago" se deshabilita con aviso de saldo insuficiente.
  Pruébalo con Liverpool > $3,490.
- Comisión de servicio demo: $10 (SERVICE_FEE_MXN en data.ts) — los T&C
  BHN exigen mostrarla en el resumen.
- Simulador API en la barra Mac: 200/400/409/503/timeout.
- Logos vía Clearbit con fallback a color+iniciales.
