# Mercado Lista · Comparador de precios

Comparador de precios en tiempo real para compras en Colombia (supermercados, tecnología y hogar) y tiendas internacionales (Amazon, eBay, AliExpress).

Construido en **Astro 5 (SSR)** con Node.js y TypeScript. Los usuarios y las listas compartidas viven en **Firebase** (Auth + Firestore), proyecto `mercadologo`.

El detalle de la arquitectura está en [`AGENTS.md`](AGENTS.md) y en `Documentacion/mercadolista-handoff.md`.

---

## Características

- **Que Quieres comprar**: Éxito, Carulla, Jumbo, Olímpica, D1, Alkosto, Ktronix, Falabella y Easy, en la ciudad elegida.
- **Compra x Unidad**: precio por gramo, mililitro o unidad.
- **Lista de Compras**: cotiza hasta 15 productos, por comercio o producto a producto. Se puede guardar, compartir y comprar en modo checklist.
- **Compras Internacionales**: Amazon, eBay y AliExpress, con flete publicado y conversión a COP.
- **Categorías**: explorador de la canasta con precios en vivo.
- **Asistente**: chat de compras y recetas en `/asistente`.
- **Cuentas**: inicio de sesión con Google. Sin sesión, la lista queda en `localStorage`.

La comparación agrupa por código de barras (EAN) o por similitud de texto, y muestra promociones de medio de pago (Tarjeta Éxito/Tuya, Cencosud, CMR Falabella, Tarjeta Olímpica, Alkosto).

---

## Puesta en marcha

```bash
npm install
npm run dev      # http://localhost:3001
npm run build
npm start
npm test
```

---

## Producción (Hostinger)

LiteSpeed + Passenger carga el arranque con `require()`. El startup file es **`server.cjs`**. El build lo copia a `dist/`:

```bash
npm run build
# astro build && cp server.cjs dist/server.cjs
```

Un push a `main` redespliega el sitio.

| Campo | Valor |
|---|---|
| Node.js | `22` |
| Application type | `Other` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Startup file | `server.cjs` |
