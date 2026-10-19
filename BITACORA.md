# Bitácora Técnica — Mercado Lista

Registro cronológico de problemas encontrados, diagnóstico y soluciones aplicadas.
Útil para cualquier persona (desarrollador o agente IA) que trabaje en el proyecto.

---

## 2026-10-18 · Fix: HTTP 403 en mercadolista.com

### Síntoma

El sitio `mercadolista.com` devolvía **HTTP 403 Forbidden** en producción (Hostinger).
El build de Astro completaba sin errores localmente y en CI, pero el sitio no respondía.

### Diagnóstico — Capa 1: modo "publish" (estático)

**Herramienta usada:** API MCP de Hostinger → `hosting_nodejs_build-settings`

La configuración en Hostinger era:

```json
{
  "app_type": "astro",
  "node_version": 22,
  "output_directory": "dist",
  "entry_file": null,        ← PROBLEMA
  "build_script": "build",
  "package_manager": "npm"
}
```

Con `entry_file: null` y `app_type: "astro"`, Hostinger detectó la app como sitio
estático y sirvió el directorio `dist/` directamente con Apache/LiteSpeed sin levantar
ningún proceso Node.js. Como `dist/` no tiene un `index.html` en la raíz (es una app
SSR), el servidor devolvía 403.

**Primera acción:** Se actualizó `entry_file` a `server.js` y `app_type` a `other`.
Se disparó un nuevo build. El build completó y el `.htaccess` quedó con:

```apache
PassengerStartupFile server.js
```

### Diagnóstico — Capa 2: `ERR_REQUIRE_ASYNC_MODULE`

El sitio seguía devolviendo 403. Se consultaron los runtime logs:

**Herramienta usada:** `hosting_nodejs_runtime-logs`

```
ERROR: require() cannot be used on an ESM graph with top-level await.
From /usr/local/lsws/fcgi-bin/lsnode.js
Requiring .../nodejs/server.js
```

**Causa raíz real:**

Hostinger usa **LiteSpeed Web Server + Passenger**. Passenger carga el startup file con
`require()` (CommonJS). El `server.js` del proyecto usa:

```javascript
// server.js — era ESM puro
import path from 'node:path';            // ← static ESM import
import { pathToFileURL } from 'node:url';

await import(pathToFileURL(entryFile).href); // ← top-level await
```

`package.json` tiene `"type": "module"`, lo que convierte todos los `.js` en módulos
ESM. `require()` no puede cargar ESM con top-level await y lanza
`ERR_REQUIRE_ASYNC_MODULE`. El proceso de Node.js nunca arranca → Passenger devuelve 403.

### Solución aplicada

**Commit:** `ee0b991` — `fix(hostinger): reemplazar server.js ESM por server.cjs CJS`

1. **Creado `server.cjs`** — wrapper en CommonJS puro. Usa `require()` (nativo de CJS)
   para path/fs/url, y `import()` dinámico para cargar el entry point de Astro.
   `import()` dinámico **sí funciona desde CJS** en Node.js ≥ 12.

   ```javascript
   // server.cjs — CommonJS, compatible con require() de Passenger
   'use strict';
   const path = require('path');
   const fs   = require('fs');
   const { pathToFileURL } = require('url');

   // ... localiza entry.mjs ...

   import(pathToFileURL(entryFile).href).catch(...);
   ```

2. **Build script actualizado** en `package.json`:

   ```json
   "build": "ASTRO_TELEMETRY_DISABLED=1 astro build && cp server.cjs dist/server.cjs"
   ```

   El `cp` es obligatorio: Hostinger publica el contenido de `dist/` al directorio de
   versiones (`hbuilds/versions/<uuid>/nodejs/`) y el `entry_file` debe existir ahí.

3. **Settings en Hostinger actualizados** vía API:

   ```json
   {
     "app_type": "other",
     "node_version": 22,
     "output_directory": "dist",
     "entry_file": "server.cjs",
     "build_script": "build",
     "package_manager": "npm"
   }
   ```

4. **Build redisparado** → `state: completed` ✓

### Verificación final

Runtime logs tras el deploy con `server.cjs`:

```
LOG  [MercadoLista] Servidor arrancando desde: .../nodejs/dist/server/entry.mjs
LOG  [MercadoLista] Escuchando en 0.0.0.0:3000
INFO [@astrojs/node] Server listening on http://193.203.175.57:undefined
```

- Sin errores `ERR_REQUIRE_ASYNC_MODULE` ✓
- Astro SSR activo ✓
- `dist/server/entry.mjs` localizado correctamente vía primer candidato de `server.cjs` ✓

> **Nota sobre el puerto `undefined`:** Normal en este entorno. Passenger usa sockets
> internos, no expone `PORT` al proceso hijo. LiteSpeed maneja el proxy HTTP; el proceso
> Node.js no necesita conocer el puerto externo.

### Regla permanente para futuros deploys

> El startup file en Hostinger **siempre debe ser un archivo `.cjs`** (CommonJS).
> Nunca usar un `.js` ESM como `entry_file` porque Passenger lo carga con `require()`.

---

## Referencia rápida: cómo redesplegar

```bash
# 1. Hacer cambios y push
git add .
git commit -m "..."
git push origin main

# 2. Hostinger redespliega automáticamente desde GitHub (rama: main)
#    O disparar manualmente vía API de Hostinger MCP:
#    hosting_nodejs_start-build  (source_type: git, branch: main)

# 3. Verificar
#    hosting_nodejs_build        → esperar state: "completed"
#    hosting_nodejs_runtime-logs → confirmar que no hay ERRORs
```

### Settings actuales de Hostinger (no cambiar sin razón)

| Campo | Valor |
|---|---|
| `domain` | `mercadolista.com` |
| `username` | `u336252580` |
| `app_type` | `other` |
| `node_version` | `22` |
| `output_directory` | `dist` |
| `entry_file` | `server.cjs` |
| `build_script` | `build` |
| `package_manager` | `npm` |
| Git repo | `rankerize/mercadolista-site`, branch `main` |
| Git installation UUID | `01a1471e-819c-73aa-8c46-c808fec8e7de` |

---
