import { f as createComponent, r as renderTemplate, h as addAttribute, k as renderHead, u as unescapeHTML, l as renderComponent } from '../chunks/astro/server_DncXONAL.mjs';
import 'piccolore';
/* empty css                                       */
import { C as CATEGORIES, g as getItemsByCategory } from '../chunks/catalog_BCGwfOxn.mjs';
import { $ as $$GoogleAnalytics } from '../chunks/GoogleAnalytics_CJVq0Tv4.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const BASE = "https://mercadolista.com";
  return renderTemplate(_a || (_a = __template(['<html lang="es" data-astro-cid-bpt7uy5d> <head>', '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Categor\xEDas de productos \xB7 Mercado Lista</title><meta name="description" content="Compara precios por categor\xEDa: l\xE1cteos, despensa, carnes, frutas, aseo y m\xE1s. Precios en tiempo real en \xC9xito, D1, Jumbo, Carulla y otras tiendas de Colombia."><link rel="canonical"', '><meta name="theme-color" content="#0e6a45"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="manifest" href="/manifest.webmanifest"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,640&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet"><script type="application/ld+json">', "<\/script>", '</head> <body data-astro-cid-bpt7uy5d> <header class="top" data-astro-cid-bpt7uy5d> <div class="top-bar" data-astro-cid-bpt7uy5d> <a href="/" class="eyebrow" data-astro-cid-bpt7uy5d>Mercado Lista</a> </div> <h1 data-astro-cid-bpt7uy5d>Categor\xEDas de productos</h1> <p class="lead" data-astro-cid-bpt7uy5d>Precios en tiempo real por tienda para cada producto de la canasta familiar colombiana.</p> </header> <main class="cat-index" data-astro-cid-bpt7uy5d> <nav class="breadcrumb" aria-label="Navegaci\xF3n" data-astro-cid-bpt7uy5d> <a href="/" data-astro-cid-bpt7uy5d>Inicio</a> <span aria-hidden="true" data-astro-cid-bpt7uy5d>\u203A</span> <span aria-current="page" data-astro-cid-bpt7uy5d>Categor\xEDas</span> </nav> <ul class="cat-grid" role="list" data-astro-cid-bpt7uy5d> ', ' </ul> </main> <footer class="site-footer" data-astro-cid-bpt7uy5d> <p data-astro-cid-bpt7uy5d>\xA9 ', " Mercado Lista \xB7 Precios consultados en tiempo real</p> </footer>  </body> </html>"])), renderComponent($$result, "GoogleAnalytics", $$GoogleAnalytics, { "data-astro-cid-bpt7uy5d": true }), addAttribute(`${BASE}/categoria`, "href"), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: BASE },
      { "@type": "ListItem", position: 2, name: "Categor\xEDas", item: `${BASE}/categoria` }
    ]
  })), renderHead(), CATEGORIES.map((cat) => {
    const items = getItemsByCategory(cat.id);
    return renderTemplate`<li data-astro-cid-bpt7uy5d> <a${addAttribute(`/categoria/${cat.id}`, "href")} class="cat-card" data-astro-cid-bpt7uy5d> <span class="cat-icon" data-astro-cid-bpt7uy5d>${cat.icono}</span> <div class="cat-info" data-astro-cid-bpt7uy5d> <strong data-astro-cid-bpt7uy5d>${cat.nombre}</strong> <span class="cat-count" data-astro-cid-bpt7uy5d>${items.length} productos</span> </div> </a> </li>`;
  }), (/* @__PURE__ */ new Date()).getFullYear());
}, "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/categoria/index.astro", void 0);

const $$file = "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/categoria/index.astro";
const $$url = "/categoria";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
