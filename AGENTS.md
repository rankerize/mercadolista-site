# Contexto para Agentes de IA (AGENTS.md)

Este documento contiene la arquitectura, convenciones y decisiones de diseño clave para que cualquier agente de IA o desarrollador comprenda el estado del proyecto sin hacer suposiciones incorrectas.

---

## 📌 Resumen del Proyecto

**Mercado Lista** es un comparador de precios en tiempo real para Colombia (tiendas locales como Éxito, Carulla, Jumbo, Olímpica, D1, Alkosto, Ktronix, Falabella, Easy) y tiendas internacionales (Amazon, eBay, AliExpress).

- **Stack**: Astro 5 (modo `output: "server"` con `@astrojs/node` standalone), TypeScript y Node.js.
- **Puerto de desarrollo**: `3001` (configurado explícitamente en `astro.config.mjs` y `package.json` para evitar colisiones con el puerto estándar `4321` de otros proyectos locales).
- **URL local**: `http://localhost:3001`

---

## 🔐 Autenticación y Base de Datos (Firebase)

> ⚠️ **IMPORTANTE PARA AGENTES**:
> El proyecto originalmente tenía una base de datos PostgreSQL en Docker (`app/db.py`). **ESTA BASE DE DATOS FUE REEMPLAZADA POR FIREBASE**. 
> **NO intentes levantar Docker ni volver a implementar PostgreSQL.**

### Configuración de Firebase
- **Proyecto**: `mercadologo` (conectado al Firebase CLI y consola oficial).
- **Servicios utilizados**:
  1. **Firebase Authentication**: Inicio de sesión federado con Google Sign-In (`signInWithPopup`). El proveedor de Google ya está habilitado en la consola de Firebase.
  2. **Cloud Firestore**: Persistencia y sincronización de las listas de compras de los usuarios en la colección `users/{uid}/lists`.
- **Archivos de integración**:
  - [`src/lib/firebase.ts`](file:///Users/cesarandresjimenezarci/Documents/Clientes/Comparador%20de%20precios/src/lib/firebase.ts): Inicialización del SDK cliente de Firebase con las credenciales públicas de la Web App `mercadologo`.
  - [`src/lib/firebaseAuth.ts`](file:///Users/cesarandresjimenezarci/Documents/Clientes/Comparador%20de%20precios/src/lib/firebaseAuth.ts): Métodos utilitarios: `loginWithGoogle()`, `logoutUser()`, `subscribeAuth()`, `getUserLists()`, `saveUserList()`, `deleteUserList()`.

### UX de Autenticación
- Existe un botón de **«Iniciar sesión»** con Google en el header superior derecho (`.top-bar`) accesible desde todas las pestañas.
- En la pestaña **«Lista»**, hay un botón contextual para invitar a guardar o cargar listas con la cuenta de Google.
- Si el usuario no inicia sesión, el comparador sigue funcionando al 100% de manera anónima y almacena la lista actual en `localStorage`.

---

## 📂 Estructura del Código

```text
src/
├── lib/
│   ├── firebase.ts          # Configuración del SDK cliente de Firebase
│   ├── firebaseAuth.ts      # Funciones de Auth y Firestore (listas)
│   ├── types.ts             # Tipos TypeScript compartidos (Offer, StoreOutcome, etc.)
│   ├── cities.ts            # Catálogo de ciudades colombianas
│   ├── normalize.ts         # Normalización de texto, parsing de precios COP, regex de pesos/unidades
│   ├── payments.ts          # Reglas de tarjetas de crédito/tiendas (Éxito Tuya, Cencosud, CMR, etc.)
│   ├── ranking.ts           # Algoritmo de ranking, detección de mismo producto (EAN) y diferencias
│   ├── units.ts             # Comparador por unidad de medida (precio por g, ml, unidad)
│   ├── shopping.ts          # Optimizador de listas de compras multi-producto
│   ├── international/       # Scrapers y cálculo de flete para Amazon, AliExpress y eBay
│   └── providers/           # Clientes HTTP para tiendas nacionales (VTEX, Algolia, Falabella)
├── pages/
│   ├── api/                 # Endpoints SSR en Astro
│   │   ├── tiendas.ts       # GET /api/tiendas
│   │   ├── ciudades.ts      # GET /api/ciudades
│   │   ├── buscar.ts        # GET /api/buscar
│   │   ├── unidad.ts        # GET /api/unidad
│   │   ├── lista.ts         # POST /api/lista
│   │   └── internacional.ts # GET /api/internacional
│   └── index.astro          # Página principal y cascarón HTML
├── scripts/
│   └── app.ts               # Lógica del cliente, renderizadores de DOM y listeners de Firebase
└── styles/
    └── styles.css           # Estilos visuales de la aplicación
```

---

## 🧪 Comandos Habituales

```bash
# Desarrollo (puerto 3001)
npm run dev

# Construcción para producción
npm run build

# Ejecutar suite de pruebas unitarias (Vitest)
npm test
```

> **Nota**: Se utiliza la variable de entorno `ASTRO_TELEMETRY_DISABLED=1` en los scripts de `package.json` para evitar advertencias de permisos en macOS.
