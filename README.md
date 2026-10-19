# Mercado Lista · Comparador de precios

Comparador de precios en tiempo real para compras en Colombia (supermercados, tecnología y hogar) y tiendas internacionales (Amazon, eBay, AliExpress).

Construido en **Astro 5 Fullstack (SSR)** con Node.js y TypeScript.

---

## 🚀 Características Principales

- **Tiendas Nacionales en Vivo**: Éxito, Carulla, Jumbo, Olímpica, D1, Alkosto, Ktronix, Falabella y Easy.
- **Tiendas Internacionales**: Amazon, eBay y AliExpress con cálculo de flete estimado a Colombia y conversión automática a COP.
- **Agrupación Inteligente**: Comparación por código de barras (EAN), algoritmo de similitud por tokens de texto y promociones por medio de pago (Tarjeta Éxito/Tuya, Cencosud, CMR Falabella, Tarjeta Olímpica, Alkosto).
- **Comparador por Unidad de Medida**: Precio normalizado por gramo ($/g), mililitro ($/ml) o unidad ($/u) para identificar presentaciones más económicas.
- **Optimizador de Canasta/Lista**: Cotización de listas de hasta 15 productos comparando el total por comercio o desglosado producto por producto.

---

## 👥 ¿Por qué hay Usuarios y Cuentas? (Listas Colaborativas)

El sistema de usuarios se integró con un objetivo central: **permitir que parejas, familias o equipos puedan armar y compartir listas de compras de mercado en tiempo real**.

### 1. Autenticación con Google (Firebase Auth)
* No requiere contraseñas complejas. Se inicia sesión con 1 clic mediante Google Sign-In (`signInWithPopup`).
* En el header superior se muestra el acceso al perfil del usuario (`/perfil`).

### 2. Listas Compartidas y Colaborativas (Cloud Firestore)
* **Colección**: `shared_lists` en Cloud Firestore.
* **Compartir por WhatsApp**: Genera un mensaje preformateado con el enlace directo `https://mercadolista.com/?listaId=ID`.
* **Compartir por Correo**: Permite invitar a colaboradores por su cuenta de Gmail.
* **Sincronización en tiempo real**: Cuando la pareja abre el enlace, la lista se carga en su comparador y se vincula automáticamente a su cuenta. Ambos pueden verla en su `/perfil`, editar cantidades, cotizarla en cualquier momento y guardarla.

### 3. Modo Anónimo
* Si el usuario no desea iniciar sesión, el comparador sigue funcionando al 100%. La lista actual se guarda en el almacenamiento local del navegador (`localStorage`).

> 💡 **Nota sobre la Base de Datos**: 
> La base de datos original en PostgreSQL y Docker fue reemplazada en su totalidad por **Firebase** (Auth + Firestore). Ya **no** se requiere Docker ni PostgreSQL para ejecutar la aplicación.

---

## 🛠️ Puesta en Marcha en Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo (puerto 3001)
npm run dev

# 3. Compilar para producción
npm run build
npm start

# 4. Correr pruebas unitarias (Vitest)
npm test
```

Abre [http://localhost:3001](http://localhost:3001) en tu navegador.

---

## 🌐 Despliegue en Producción (Hostinger)

> ⚠️ **Leer antes de tocar el despliegue** — ver también [`BITACORA.md`](BITACORA.md).

El servidor en producción usa **LiteSpeed + Passenger**, que carga el startup file con
`require()` (CommonJS). Por eso el archivo de entrada es **`server.cjs`** (no `server.js`).

### Configuración correcta en hPanel › Node.js

| Campo | Valor |
|---|---|
| Node.js version | `22` |
| Application type | `Other` |
| Build command | `npm run build` |
| Output directory | `dist` |
| **Application startup file** | **`server.cjs`** |

### Flujo de despliegue

```bash
# El build script copia server.cjs al dist/ automáticamente:
npm run build
# → astro build  +  cp server.cjs dist/server.cjs

git push origin main
# Hostinger redespliega automáticamente desde GitHub (rama: main)
```

> **¿Por qué `.cjs` y no `.js`?** `package.json` tiene `"type": "module"`, lo que
> convierte todos los `.js` en ESM. Passenger no puede cargar ESM con top-level await
> vía `require()` → HTTP 403. Ver [`BITACORA.md`](BITACORA.md) para el diagnóstico
> completo del incidente.
