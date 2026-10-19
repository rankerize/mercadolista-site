import { f as createComponent, k as renderComponent, l as renderHead, h as addAttribute, r as renderTemplate, n as renderScript } from '../chunks/astro/server_zl8i4EZZ.mjs';
import 'piccolore';
/* empty css                                     */
import { $ as $$Nav } from '../chunks/Nav_qc2d3Wkg.mjs';
import { $ as $$GoogleAnalytics } from '../chunks/GoogleAnalytics_CyJJegFW.mjs';
import { C as CITIES } from '../chunks/cities_DyPidRWt.mjs';
export { renderers } from '../renderers.mjs';

const $$Asistente = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="es"> <head>${renderComponent($$result, "GoogleAnalytics", $$GoogleAnalytics, {})}<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Asistente de Compras & Recetas con IA · Mercado Lista</title><meta name="description" content="Pídele al asesor de compras de Mercado Lista cualquier comida o receta (ej. pasta boloñesa para 2 personas) y obtén la lista exacta de ingredientes con las mejores ofertas en supermercados colombianos."><link rel="canonical" href="https://mercadolista.com/asistente"><meta property="og:title" content="Asistente de Compras & Recetas con IA · Mercado Lista"><meta property="og:description" content="Arma tu menú o receta y cotiza automáticamente en D1, Éxito, Jumbo, Carulla y Olímpica con las porciones ideales."><meta property="og:url" content="https://mercadolista.com/asistente"><meta property="og:type" content="website"><meta name="theme-color" content="#0e6a45"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="apple-mobile-web-app-title" content="Mercado Lista"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="shortcut icon" href="/favicon.ico"><link rel="manifest" href="/manifest.webmanifest"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,640&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet">${renderHead()}</head> <body> ${renderComponent($$result, "Nav", $$Nav, {})} <header class="top"> <div class="top-bar"> <a href="/" class="brand-header" title="Mercado Lista · Inicio"> <img src="/logo.png" alt="Mercado Lista" class="brand-logo-img" width="34" height="34"> <span class="brand-name">Mercado Lista</span> </a> <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;"> <a href="/perfil" class="btn-primary" style="background: transparent; color: var(--pine); border: 1px solid var(--line); font-size: 0.85rem; padding: 0.35rem 0.75rem;">
👤 Mis Listas / Perfil
</a> <a href="/" style="text-decoration: none; font-size: 0.85rem; color: var(--pine); font-weight: 500;">
← Volver al comparador
</a> </div> </div> </header> <main class="assistant-container"> <section class="assistant-hero"> <div class="assistant-hero-badge">✨ Asesor Inteligente de Compras & Recetas</div> <h1>¿Qué quieres cocinar hoy?</h1> <p>
Dile al asistente qué plato deseas preparar o qué necesitas comprar y para cuántas personas. Te armará los ingredientes con porciones exactas y cotizará al instante en qué supermercado de Colombia te sale más barato.
</p> </section> <section class="assistant-box"> <form id="assistant-form" class="assistant-prompt-row"> <label for="assistant-input" style="font-weight: 600; font-size: 0.95rem; color: var(--ink);">
Describe tu comida, receta o necesidad:
</label> <textarea id="assistant-input" class="assistant-textarea" placeholder="Ej. Quiero hacer una pasta boloñesa para 2 personas con una ensalada fresca…" required rows="3"></textarea> <div class="assistant-controls-row"> <div class="assistant-controls-left"> <label class="assistant-select-label" for="assistant-city"> <span>🏙️ Ciudad:</span> <select id="assistant-city" class="assistant-select"> ${CITIES.map((c) => renderTemplate`<option${addAttribute(c.id, "value")}${addAttribute(c.id === "bogota", "selected")}> ${c.name} </option>`)} </select> </label> <label class="assistant-select-label" for="assistant-people"> <span>👥 Comensales:</span> <select id="assistant-people" class="assistant-select"> <option value="1">1 persona</option> <option value="2" selected>2 personas</option> <option value="3">3 personas</option> <option value="4">4 personas</option> <option value="5">5 personas</option> <option value="6">6 personas</option> <option value="8">8 personas</option> <option value="10">10 personas</option> </select> </label> </div> <button type="submit" id="btn-submit-assistant" class="btn-assistant-ask"> <span>✨ Armar lista y cotizar</span> </button> </div> <div class="assistant-chips-wrap"> <span class="assistant-chips-label">O prueba una de estas ideas rápidas:</span> <div class="assistant-chips-list"> <button type="button" class="assistant-chip-btn" data-prompt="Quiero hacer una pasta boloñesa para 2 personas" data-people="2">
🍝 Pasta boloñesa (2 pers.)
</button> <button type="button" class="assistant-chip-btn" data-prompt="Noche de tacos caseros para 4 personas" data-people="4">
🌮 Noche de tacos (4 pers.)
</button> <button type="button" class="assistant-chip-btn" data-prompt="Asado de domingo con carne, costilla, chorizo y papas para 6 personas" data-people="6">
🥩 Asado colombiano (6 pers.)
</button> <button type="button" class="assistant-chip-btn" data-prompt="Ajiaco santafereño típico para 4 personas" data-people="4">
🍲 Ajiaco santafereño (4 pers.)
</button> <button type="button" class="assistant-chip-btn" data-prompt="Arroz con pollo criollo para 4 personas" data-people="4">
🍗 Arroz con pollo (4 pers.)
</button> <button type="button" class="assistant-chip-btn" data-prompt="Hamburguesas caseras con tocineta y queso para 2 personas" data-people="2">
🍔 Hamburguesas caseras (2 pers.)
</button> <button type="button" class="assistant-chip-btn" data-prompt="Desayuno fit y saludable con huevos, aguacate y avena para 2 personas" data-people="2">
🥑 Desayuno fit (2 pers.)
</button> <button type="button" class="assistant-chip-btn" data-prompt="Lentejas caseras con arroz y plátano para 2 personas" data-people="2">
🥣 Lentejas con arroz (2 pers.)
</button> </div> </div> </form> </section> <!-- Estado de carga / feedback --> <div id="assistant-status" class="status" role="status" style="text-align: center; margin: 1.5rem 0;"></div> <!-- Resultados del Asistente --> <section id="assistant-results" hidden></section> </main> ${renderScript($$result, "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/asistente.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/asistente.astro", void 0);

const $$file = "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/asistente.astro";
const $$url = "/asistente";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Asistente,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
