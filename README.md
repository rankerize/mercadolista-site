# Mercado Lista · Comparador de precios

Comparador de precios en tiempo real para compras en tiendas de Colombia (supermercados, tecnología y hogar) y tiendas internacionales (Amazon, eBay, AliExpress).

Construido en **Astro 5 Fullstack (SSR)** con Node.js y TypeScript.

## Características

- **Tiendas Nacionales**: Éxito, Carulla, Jumbo, Olímpica, D1, Alkosto, Ktronix, Falabella y Easy.
- **Tiendas Internacionales**: Amazon, eBay y AliExpress con cálculo de flete estimado a Colombia y conversión a COP.
- **Agrupación inteligente**: Comparación por código de barras (EAN), algoritmo de similitud por tokens de texto y promociones por medio de pago (Tarjeta Éxito/Tuya, Cencosud, CMR Falabella, Tarjeta Olímpica, Alkosto).
- **Comparador por Unidad**: Precio normalizado por gramo ($/g), mililitro ($/ml) o unidad ($/u).
- **Optimizador de Canasta/Lista**: Cotización de listas de hasta 15 productos comparando el total por comercio o desglosado.
- **Cuentas y Listas Guardadas**: Persistencia de usuarios y listas con PostgreSQL (Docker Compose). Si la base de datos no está activa, las búsquedas funcionan al 100%.

## Puesta en Marcha (Astro)

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar para producción
npm run build
npm start

# 4. Correr pruebas unitarias
npm test
```

Abre [http://127.0.0.1:4321](http://127.0.0.1:4321) (o el puerto asignado por Astro).

## Base de Datos (Opcional para guardar listas)

```bash
cp .env.example .env
docker compose up -d
```
