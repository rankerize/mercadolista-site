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

Los usuarios y las listas viven en Firebase. El proyecto es `mercadologo`.

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
     - En los resultados de **Que Quieres comprar** y **Compra x Unidad**, el veredicto y las ofertas tienen el botón `➕ Añadir a lista`.
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
   10. **Seguridad, XSS y Rate Limiting**:
     - **Escape HTML contra XSS (`escapeHtml` en `src/lib/normalize.ts`)**: Todo texto ingresado por el usuario o sincronizado desde Firestore (nombres de listas, productos, colaboradores) se escapa antes de renderizarse.
     - **Rate Limiting en Endpoints SSR (`src/lib/rateLimit.ts`)**: Los endpoints `/api/lista`, `/api/buscar`, `/api/unidad`, `/api/internacional`, y `/api/asistente` tienen control de tasa por IP en memoria con limpieza automática cada 5 minutos. Protege el servidor Node.js y previene baneos de IP de los supermercados (VTEX, Akamai, Cloudflare). Retorna HTTP 429 con cabecera `Retry-After`.
     - **Reglas de Seguridad de Firestore (`firestore.rules`)**: Archivo en la raíz con reglas estrictas: solo el creador puede borrar su lista; solo creador y colaboradores pueden leer y modificar productos.
  11. **Clasificación de Listas (`mercado` vs `receta`)**:
     - Las listas guardadas admiten `tipo: 'mercado' | 'receta'`, `porciones?: number` y `descripcion?: string`.
     - En `/perfil`: Filtro por chips `[Todas]` · `[🛒 Mercados]` · `[🍳 Recetas]` con insignias visuales (`badge-tipo-receta` y `badge-tipo-mercado`).
  12. **Asistente de Compras & Recetas con IA (`/asistente` y Widget Flotante `AssistantChatWidget.astro`)**:
     - **URL `/asistente`**: Asesor conversacional de compras que traduce solicitudes culinarias (e.g. «Quiero hacer pasta boloñesa para 2 personas») en ingredientes con porciones exactas, cotiza en vivo contra `/api/lista` (D1, Éxito, Jumbo, etc.) y permite guardar como receta o exportar a WhatsApp.
     - **Widget Flotante Inferior Derecho (`src/components/AssistantChatWidget.astro`)**: Botón flotante animado en la esquina inferior derecha presente en toda la app (excepto en `/asistente`). Abre un mini-chat de asistencia con preguntas frecuentes y buscador que redirige automáticamente a `/asistente?prompt=...`.
     - **Endpoint `/api/asistente`**: Motor híbrido con integración de Google Gemini Flash y catálogo culinario inteligente colombiano local como respaldo de alta resiliencia.
   13. **Buscador por Imagen y Escáner de Código de Barras (`CameraSearchModal.astro`, `/api/identificar-imagen`, `/api/buscar-barcode`)**:
     - **Foto de Empaque con IA (Gemini Vision)**: El usuario toma una foto o sube una imagen de un producto o empaque (con compresión client-side en canvas). Gemini 1.5 Flash Vision analiza la imagen e identifica marca, producto, presentación (gramos/ml/unidades) y genera la `query_optima` para las tiendas colombianas.
     - **Escáner de Código de Barras (EAN-13, EAN-8)**: Escaneo en vivo con la cámara mediante `BarcodeDetector` web nativo con mira láser animada y vibración táctil, respaldado por `/api/buscar-barcode` que consulta Open Food Facts y catálogo colombiano.
     - **Acciones directas**: Desde el modal el usuario puede comparar precios inmediatamente en todas las tiendas o agregarlo directamente a su lista de compras activa.
     - **Botón `📷` accesible**: Ubicado en el buscador principal (`#single-search`), en el buscador global del encabezado (`Nav.astro`) y en el editor de la lista de compras.
- **Archivos de integración**:
  - `src/lib/firebase.ts`: SDK cliente de Firebase de la Web App `mercadologo`.
  - `src/lib/firebaseAuth.ts`: `loginWithGoogle()`, `logoutUser()`, `subscribeAuth()`, `getUserLists()`, `saveUserList()`, `deleteUserList()`, `getListById()`, `joinSharedList()`, `shareListWithEmail()`, `subscribeList()`, `toggleItemBought()`, `getUserProfile()`, `saveUserProfile()`.

### UX de Autenticación y Perfil
- Existe un botón de **«Iniciar sesión»** con Google en el header superior derecho (`.top-bar`) accesible desde todas las pestañas. Al iniciar sesión, muestra `👤 [Nombre]` como enlace directo a `/perfil`.
- Página `/perfil`: Vista de gestión con tres pestañas principales:
  1. **«📋 Mis Listas»**: Administración, compartir por WhatsApp/correo, comparar en tiendas o borrar listas.
  2. **«🛒 Modo Compra»**: Checklist táctil interactiva para el pasillo del supermercado con selector de lista, sincronización en vivo y seguro contra desmarcado accidental.
  3. **«📍 Mis Direcciones y Contacto»**: Gestión de datos de contacto (teléfono/WhatsApp, ciudad preferida, dirección principal con barrio, dirección secundaria de oficina/familiar y notas de referencia) persistidos en la colección `user_profiles` de Firestore con el propósito de calcular a futuro las tiendas más cercanas y optimizar rutas de compra.
- En la pestaña **«Lista de Compras»**, hay un botón contextual para invitar a guardar o cargar listas con la cuenta de Google, y un botón **«📲 Compartir»**.
- Si el usuario no inicia sesión, el comparador sigue funcionando al 100% de manera anónima y almacena la lista actual en `localStorage`.

---

## 📂 Estructura del Código

```text
src/
├── components/
│   ├── Nav.astro                 # Barra, drawer, buscador y sesión
│   ├── AddToListModal.astro
│   ├── AssistantChatWidget.astro
│   ├── CookieBanner.astro
│   ├── GoogleAnalytics.astro
│   └── ShareModal.astro
├── lib/
│   ├── firebase.ts               # SDK cliente de Firebase
│   ├── firebaseAuth.ts           # Auth y Firestore (listas y perfil)
│   ├── catalog.ts                # Catálogo local de la canasta
│   ├── taxonomy.ts               # Taxonomía de categorías
│   ├── slugs.ts
│   ├── rateLimit.ts              # Límite de peticiones por IP
│   ├── types.ts
│   ├── cities.ts
│   ├── normalize.ts
│   ├── payments.ts
│   ├── ranking.ts
│   ├── units.ts
│   ├── shopping.ts
│   ├── international/            # Amazon, AliExpress y eBay
│   └── providers/                # VTEX, Algolia y Falabella
├── pages/
│   ├── index.astro               # Comparador
│   ├── perfil.astro
│   ├── asistente.astro
│   ├── privacidad.astro
│   ├── terminos.astro
│   ├── categoria/                # Índice, categoría y producto
│   └── api/
│       ├── buscar.ts             # GET /api/buscar
│       ├── unidad.ts             # GET /api/unidad
│       ├── lista.ts              # POST /api/lista
│       ├── internacional.ts      # GET /api/internacional
│       ├── asistente.ts          # GET /api/asistente
│       ├── ciudades.ts
│       └── tiendas.ts
├── scripts/
│   ├── app.ts
│   ├── shareModal.ts
│   └── catAddToList.ts
└── styles/
    └── styles.css
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

Hostinger corre la app con **LiteSpeed + Passenger**. Passenger carga el startup file con `require()`, así que el arranque es `server.cjs` (CommonJS). Ese archivo localiza `server/entry.mjs` o `dist/server/entry.mjs` y lo carga con `import()`.

`package.json` declara `"type": "module"`. El proceso de producción entra por `server.cjs`, que queda dentro de `dist/` porque Hostinger publica ese directorio.

```
server.cjs (CommonJS, require)
        └── import() → dist/server/entry.mjs (Astro standalone)
```

| Campo | Valor |
|---|---|
| `app_type` | `other` |
| `node_version` | `22` |
| `output_directory` | `dist` |
| `build_script` | `build` |
| `entry_file` | `server.cjs` |
| `package_manager` | `npm` |

```json
"build": "ASTRO_TELEMETRY_DISABLED=1 astro build && cp server.cjs dist/server.cjs"
```

Después del deploy, la raíz publicada es el contenido de `dist/`:

```
nodejs/
├── server.cjs
├── server/entry.mjs
└── client/_astro/
```

Passenger usa sockets internos y puede dejar `PORT` sin definir en el log. El proxy HTTP lo resuelve LiteSpeed.

Un push a `main` dispara el build. El startup file permanece en `server.cjs` y el tipo de aplicación en `other`.
