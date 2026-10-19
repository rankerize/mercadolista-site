# Contexto para Agentes de IA (AGENTS.md)

Este documento contiene la arquitectura, convenciones y decisiones de diseño clave para que cualquier agente de IA o desarrollador comprenda el estado del proyecto sin hacer suposiciones incorrectas.

---

## 📌 Resumen del Proyecto

> ⚠️ **REGLA OBLIGATORIA MULTI-AGENTE (GIT PUSH)**:
> Hay múltiples agentes de IA trabajando en paralelo en este repositorio.
> **NUNCA ejecutes `git push` automáticamente**.
> Antes de subir cambios a `main` o a cualquier rama remota, **SIEMPRE solicita confirmación explícita al usuario**, detallando qué cambios están listos para enviarse.

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
  2. **Cloud Firestore**: Persistencia y sincronización de las listas de compras en la colección `shared_lists`.
  3. **Listas Colaborativas y Sincronización Bidireccional en Tiempo Real (WhatsApp y Correo)**:
     - Cualquier lista se puede compartir por **WhatsApp** (con selector de código de país por defecto `🇨🇴 +57` o chat general) o por **correo de Google**.
     - Genera un enlace: `/?listaId=ID`.
     - Cuando la pareja abre ese enlace o selecciona la lista:
       - **Autosync en caliente**: Cualquier modificación en el editor (agregar fila, quitar fila, editar nombre, unidad, cantidad o cambiar ciudad) se guarda automáticamente a Firestore con debounce (`autoSyncActiveListToCloud`).
       - **Sincronización en tiempo real (`subscribeList`)**: Ambas pantallas se actualizan automáticamente mediante `onSnapshot` de Firestore sin necesidad de recargar la página.
       - **Sincronización en `/perfil` (`subscribeUserLists`)**: Las tarjetas de listas y el selector de «Modo Compra» se refrescan en vivo cuando cualquier colaborador realiza cambios.
  4. **Modo «En el Súper / Modo Compra» (Checklist y Presupuesto en Tiempo Real)**:
     - En `/perfil`: pestaña dedicada **«🛒 Modo Compra»** con selector desplegable de listas para alternar entre mercados al instante.
     - En cada tarjeta de lista en `/perfil`: botón verde directo **«🛒 Modo Compra»** para abrir la lista a comprar con un solo toque.
     - Filas táctiles grandes donde al tocar cualquier parte se tacha el producto (`is-bought`) y actualiza la barra de progreso en vivo.
     - Sincronización en tiempo real entre la pareja con `subscribeList` (`onSnapshot` de Firestore) y `toggleItemBought`.
     - **Seguro contra borrado/reseteo accidental**: Los productos no se pueden eliminar por error en este modo, y el botón **«🔒 Desmarcar todo»** exige confirmación explícita con diálogo de seguridad antes de reiniciar la lista.
  5. **Exportador a WhatsApp de Compra Óptima**:
     - Botón en el veredicto que agrupa los productos por tienda ganadora (D1, Éxito, Jumbo, etc.) con casillas de verificación en texto plano `◻ [ ]`, precios y link directo para el chat de WhatsApp.
  6. **PWA (Progressive Web App)**:
     - Archivo `public/manifest.webmanifest` con meta tags para iOS y Android para instalarse en la pantalla de inicio del teléfono sin tiendas de aplicaciones.
  7. **Añadir a lista desde Búsquedas en Colombia (`AddToListModal`)**:
     - En los resultados de búsqueda de Colombia y Unidad, el veredicto y las ofertas tienen el botón `➕ Añadir a lista`.
     - Abre el modal `AddToListModal.astro`: permite seleccionar una lista existente en Firebase, crear una nueva lista en el momento, o añadirlo a la canasta local del comparador si no ha iniciado sesión.
  8. **Explorador por Categorías y Autocompletado Inteligente (`src/lib/catalog.ts`)**:
     - Catálogo estructurado de 8 categorías clave (Lácteos, Despensa, Carnes, Frutas/Verduras, Aseo, Cuidado Personal, Café/Panadería, Tecnología) con ~60 productos de la canasta familiar colombiana.
     - 100% en el cliente (cero latencia, cero costos de APIs externas).
     - Carrusel táctil de categorías (`#categories-container`) con botones de adición rápida (`+`) para disparar búsquedas o añadir productos a la lista con un solo toque.
     - Dropdown de autocompletado flotante (`#query-autocomplete`) con navegación por teclado (flechas, Enter, Escape) y resaltado de coincidencias.
     - Autocompletado inteligente en las filas de la lista de compras (`#list-rows`) que autocompleta nombre, unidad de medida (`gramos`, `mililitros`, `unidades`) y cantidad sugerida (e.g. Leche -> 1000 ml, Huevos -> 30 unidades).
  9. **Identificación de Colaboradores y Quién Agregó Cada Producto**:
     - Atribución de autor por producto (`addedBy` y `addedById` en `ListItemData`): Cada vez que un usuario añade o edita un producto (en el editor de listas, categorías, o buscador), se registra su autoría.
     - En el editor de la lista: Cada fila muestra la píldora `👤 Tú` o `👤 [Nombre]` junto al campo de nombre.
     - En el banner de lista compartida: Banner inteligente `#list-collab-banner` que indica con quién está compartida la lista (`👥 Compartida con: Andrea`, `👥 Lista compartida de César`, o `🔒 Lista privada`).
     - En `/perfil`: Las tarjetas de listas muestran el badge `👥 Compartida con: [Nombres]` y en la vista previa qué productos agregó cada quién (`(por ti)` o `(por Andrea)`).
     - En «🛒 Modo Compra»: Cada producto muestra la insignia destacada `👤 Tú` o `👤 [Nombre]` para saber quién lo pidió en el momento de tomarlo en el pasillo.
- **Archivos de integración**:
  - [`src/lib/firebase.ts`](file:///Users/cesarandresjimenezarci/Documents/Clientes/Comparador%20de%20precios/src/lib/firebase.ts): Inicialización del SDK cliente de Firebase con las credenciales públicas de la Web App `mercadologo`.
  - [`src/lib/firebaseAuth.ts`](file:///Users/cesarandresjimenezarci/Documents/Clientes/Comparador%20de%20precios/src/lib/firebaseAuth.ts): Métodos utilitarios: `loginWithGoogle()`, `logoutUser()`, `subscribeAuth()`, `getUserLists()`, `saveUserList()`, `deleteUserList()`, `getListById()`, `joinSharedList()`, `shareListWithEmail()`, `subscribeList()`, `toggleItemBought()`.

### UX de Autenticación y Perfil
- Existe un botón de **«Iniciar sesión»** con Google en el header superior derecho (`.top-bar`) accesible desde todas las pestañas. Al iniciar sesión, muestra `👤 [Nombre]` como enlace directo a `/perfil`.
- Página `/perfil`: Vista de gestión con dos pestañas principales: **«📋 Mis Listas»** (administración, compartir, comparar o borrar) y **«🛒 Modo Compra»** (checklist táctil interactiva para el pasillo del supermercado con selector de lista y seguro de desmarcado).
- En la pestaña **«Lista»**, hay un botón contextual para invitar a guardar o cargar listas con la cuenta de Google, y un botón **«📲 Compartir»**.
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

---

## 🌐 Despliegue en Hostinger

### Stack del servidor en producción

Hostinger usa **LiteSpeed Web Server + Passenger** para correr Node.js. Passenger carga el startup file con `require()` (CommonJS), **no** con `node` directamente ni con `import`.

### ⚠️ REGLA CRÍTICA: El startup file DEBE ser `.cjs`

> **NUNCA uses `server.js` (ESM) como `entry_file` en Hostinger.**

`package.json` tiene `"type": "module"`, lo que hace que todos los `.js` sean ESM. El `server.js` original usaba `import ...` + `await import(...)` a nivel superior (top-level await). Cuando Passenger intentaba cargarlo con `require()`, fallaba con:
> `ERR_REQUIRE_ASYNC_MODULE: require() cannot be used on an ESM graph with top-level await`

Esto causaba que el proceso Node.js nunca arrancara, y LiteSpeed devolvía **HTTP 403**.

### La solución: `server.cjs`

El archivo `server.cjs` es un wrapper en **CommonJS puro** que usa `import()` dinámico (permitido desde CJS) para cargar el entry point de Astro:

```
server.cjs (CJS)  ──require()──>  [LiteSpeed/Passenger]
                  ──import()──>   dist/server/entry.mjs  (ESM, Astro standalone)
```

`__dirname` en `server.cjs` apunta a `hbuilds/versions/<uuid>/nodejs/dist/` (donde Hostinger publica el output de `dist/`). El primer candidato `path.join(__dirname, 'server', 'entry.mjs')` resuelve correctamente a `dist/server/entry.mjs`.

### Configuración correcta en Hostinger (API / hPanel)

| Campo | Valor |
|---|---|
| `app_type` | `other` (no `astro` — ese modo trata la app como estático) |
| `node_version` | `22` |
| `output_directory` | `dist` |
| `build_script` | `build` |
| `entry_file` | **`server.cjs`** |
| `package_manager` | `npm` |

### Build script en `package.json`

```json
"build": "ASTRO_TELEMETRY_DISABLED=1 astro build && cp server.cjs dist/server.cjs"
```

El `cp server.cjs dist/server.cjs` es necesario porque Hostinger publica el contenido de `dist/` y el entry_file debe estar dentro de ese directorio publicado.

### Estructura de directorios en Hostinger después del deploy

```
hbuilds/versions/<uuid>/nodejs/   ← raíz publicada (contenido de dist/)
├── server.cjs                    ← startup file (entry_file)
├── server/
│   ├── entry.mjs                 ← Astro SSR entrypoint
│   ├── manifest_*.mjs
│   └── chunks/
└── client/
    └── _astro/                   ← assets estáticos
```

### `.htaccess` generado automáticamente

Hostinger escribe este `.htaccess` en `public_html` para el proxy:

```apache
PassengerAppRoot /home/u336252580/domains/mercadolista.com/hbuilds/current/nodejs
PassengerAppType node
PassengerNodejs /opt/alt/alt-nodejs22/root/bin/node
PassengerStartupFile server.cjs
PassengerBaseURI /
PassengerRestartDir .../hbuilds/current/nodejs/tmp
SetEnv NODE_OPTIONS "--require .../preload-timestamp.js"
SetEnv LSNODE_CONSOLE_LOG console.log
SetEnv TOKIO_WORKER_THREADS 2
```

Passenger **no expone** `PORT` al proceso hijo — usa sockets internos. El log de Astro mostrará `http://localhost:undefined`, lo cual es normal y no indica error.

### Diagnóstico rápido de problemas

| Síntoma | Causa probable | Acción |
|---|---|---|
| HTTP 403 | `entry_file: null` o `app_type: astro` → modo estático | Verificar settings en Hostinger API |
| `ERR_REQUIRE_ASYNC_MODULE` en runtime logs | `entry_file` apunta a un `.js` ESM con top-level await | Cambiar a `server.cjs` |
| `ERR_MODULE_NOT_FOUND` en runtime logs | `server.cjs` no fue copiado al `dist/` por el build | Revisar build script en `package.json` |
| HTTP 500 | Firebase falla en Node.js 22 (requiere ≥24) | Subir `node_version` a `24` en Hostinger settings |

### Cómo redesplegar manualmente (vía API de Hostinger MCP)

```
1. hosting_nodejs_update-build-settings  → confirmar entry_file: "server.cjs"
2. hosting_nodejs_start-build            → source_type: "git", branch: "main"
3. hosting_nodejs_build                  → polling hasta state: "completed"
4. hosting_nodejs_runtime-logs           → verificar que no hay ERRORs
```
