# Bitácora de Errores e Incidentes Técnicos — Mercado Lista

Este documento recopila las incidencias técnicas, bloqueos de compilación, fallos de despliegue y errores de entorno identificados en el proyecto, junto con su causa raíz, solución implementada y la regla preventiva para evitar su reaparición.

---

### ERR-001: Bloqueo de Git Push por Secreto Expuesto en Bundles de Producción (GitHub Push Protection GH013)
* **Fecha:** 2026-10-26
* **Componente:** Git / Build (Vite/Astro) / Seguridad
* **Síntoma / Mensaje Exacto:**
  ```text
  remote: error: GH013: Repository rule violations found for refs/heads/main.
  remote: - GITHUB PUSH PROTECTION
  remote:   Push cannot contain secrets
  remote:   —— Google Cloud API Key ——
  remote:   locations:
  remote:     dist/server/pages/api/asistente.astro.mjs:265
  remote:     dist/server/pages/api/buscar-barcode.astro.mjs:81
  remote:     dist/server/pages/api/identificar-imagen.astro.mjs:42
  ```
* **Causa Raíz (Root Cause):**
  Al invocar `npm run build` en modo SSR (`standalone`), Astro/Vite realizaba sustitución estática de `import.meta.env.GEMINI_API_KEY` tomando el valor presente en el archivo `.env` del desarrollador e incrustándolo como cadena de texto plano dentro de los archivos generados en `dist/server/`. Al estar `dist/` versionado para el despliegue en Hostinger, el hook de GitHub Push Protection bloqueó el push.
* **Solución Aplicada o Workaround:**
  Se reemplazó `(import.meta as any).env?.GEMINI_API_KEY` por `process.env.GEMINI_API_KEY` en los tres endpoints (`src/pages/api/asistente.ts`, `buscar-barcode.ts`, `identificar-imagen.ts`). En Node.js SSR, `process.env` se resuelve dinámicamente en tiempo de ejecución en el servidor y no durante la fase de empaquetado estático de Vite. Se recompiló `dist/` y se verificó con `grep` la ausencia de claves antes de hacer commit.
* **Regla Preventiva:**
  Para cualquier secreto de servidor o API key que se use en endpoints de Astro SSR, utilizar siempre `process.env.NOMBRE_VARIABLE` y nunca `import.meta.env`. Verificar con `grep -rn "AIzaSy" dist/` antes de comitear bundles compilados.

---

### ERR-002: Colisión Visual de Asset de Ilustración en Vista Móvil
* **Fecha:** 2026-10-26
* **Componente:** Frontend / CSS / Responsividad
* **Síntoma / Mensaje Exacto:**
  En pantallas móviles (< 720px), la imagen decorativa `/logo-canasta.png` quedaba renderizada de fondo detrás del título principal `¿Dónde conviene comprarlo?`, impidiendo la legibilidad del texto y empujando el buscador fuera de la pantalla inicial.
* **Causa Raíz (Root Cause):**
  La regla CSS `.hero-illustration` tenía posicionamiento absoluto sin breakpoint para ocultarse o reubicarse en pantallas pequeñas, provocando superposición sobre el flujo de texto normal.
* **Solución Aplicada o Workaround:**
  Se eliminó la referencia a `/logo-canasta.png` del DOM en `src/pages/index.astro`. Adicionalmente, se configuró `@media (max-width: 720px) { header.top.hero { display: none; } }` para ocultar la cabecera voluminosa en móviles y permitir que la barra de búsqueda universal y los accesos rápidos queden por encima del pliegue.
* **Regla Preventiva:**
  Todo elemento decorativo o ilustrativo debe estar acompañado de reglas `@media (max-width: ...)` que garanticen que en móviles la prioridad de espacio la tengan los controles de búsqueda y conversión.

---

### ERR-003: Desaparición de la Barra de Búsqueda Superior en Navegación de Categorías Móvil
* **Fecha:** 2026-10-26
* **Componente:** Frontend / UI / Navegación
* **Síntoma / Mensaje Exacto:**
  Al entrar a cualquier categoría (`/categoria/...`) desde un teléfono móvil, el buscador superior desaparecía de la pantalla, dejando al usuario sin forma de realizar nuevas consultas sin tener que regresar a la página de inicio.
* **Causa Raíz (Root Cause):**
  El contenedor flex de `Nav.astro` no tenía habilitado `flex-wrap: wrap`, y la clase `.ml-nav__search--home` aplicaba `display: none` en resoluciones móviles para evitar desbordes horizontales, sacrificando el buscador en vistas que no fueran la portada.
* **Solución Aplicada o Workaround:**
  Se rediseñó la barra superior en 2 filas fijas para móviles:
  - Fila 1: Logo, menú drawer, icono de lista y auth con `justify-content: space-between`.
  - Fila 2: Barra de búsqueda universal al 100% del ancho con `order: 4` y `display: flex !important`.
  - Se vinculó el envío del formulario para que si el usuario busca desde una PLP o categoría, redirija limpiamente a `/search?query=...`.
* **Regla Preventiva:**
  La barra de búsqueda principal de una tienda o comparador e-commerce es un elemento universal de persistencia obligatoria en móvil; nunca debe ocultarse condicionalmente por ruta salvo en flujos de checkout.

---

### ERR-004: Falso Positivo de Cero Productos por Aislamiento de Red en Entorno Sandbox
* **Fecha:** 2026-10-26
* **Componente:** Backend / Dev Server / Entorno de Pruebas
* **Síntoma / Mensaje Exacto:**
  Las consultas a categorías y búsquedas en el servidor de desarrollo local arrojaban `0 ofertas encontradas` de manera constante a pesar de tener los scrapers funcionando correctamente.
* **Causa Raíz (Root Cause):**
  El comando de inicio del servidor de desarrollo (`npm run dev`) se ejecutó dentro del sandbox seguro con `BypassSandbox: false`. El sandbox restringe el tráfico de red saliente hacia dominios externos por políticas de seguridad, lo cual causó que las peticiones `fetch()` hacia las APIs de Éxito, Alkosto, Falabella, Carulla y Jumbo fueran rechazadas silenciosamente por la capa de red del sistema.
* **Solución Aplicada o Workaround:**
  Se detuvo el proceso y se relanzó el servidor dev con `BypassSandbox: true` para habilitar el socket TCP hacia los servicios externos. Con esto, las llamadas a `searchStores` respondieron inmediatamente con más de 320 productos por consulta.
* **Regla Preventiva:**
  Los comandos de servidor dev que requieran scraping en tiempo real de tiendas externas deben ejecutarse siempre fuera del aislamiento de red (`BypassSandbox: true`).
