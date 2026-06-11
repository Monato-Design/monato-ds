# Gift Cards v2.0 — Prototipo B2C (BillPay)

Shell idéntico a CrossBorder (Mac window + sidebar Monato + breadcrumb + stepper),
contenido del mockup Finch adaptado al DS: 21 marcas en 4 categorías,
montos fixed/variable/open, aviso antifraude, T&C BHN y resultado con código de canje.

## Instalación
```bash
rm -rf src/giftcards && cp -r ~/Downloads/update/giftcards src/giftcards
```
El App.tsx ya registrado no cambia (mismo default export `GiftcardsPrototype`).

## Notas
- Imports relativos desde src/giftcards/: '../assets/logo-default.png',
  '../components/core/*' — ojo con la profundidad.
- Logos reales vía https://logo.clearbit.com/{dominio} con fallback a bloque
  de color + iniciales (sin binarios en el repo). Requiere internet en el navegador.
- Simulador de API en la barra del Mac window: 200/400/409/503/timeout.
  400 y 503 permiten Reintentar (regresa a Confirmación); 409 y timeout no
  (idempotencia según la doc).
- Badge color="success" en el estado "Procesado" — si esa variante no existe
  en tu Badge core, cámbiala por "green" o la equivalente.
