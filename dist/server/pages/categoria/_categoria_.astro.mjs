import { e as createAstro, f as createComponent, r as renderTemplate, h as addAttribute, k as renderComponent, l as renderHead, u as unescapeHTML } from '../../chunks/astro/server_DcdaLVgT.mjs';
import 'piccolore';
/* empty css                                     */
import { g as getItemsByCategory, C as CATEGORIES, $ as $$Nav } from '../../chunks/Nav_65ytka59.mjs';
import { g as getCategoryBySlug, t as toSlug } from '../../chunks/slugs_DIHBExeC.mjs';
import { $ as $$GoogleAnalytics } from '../../chunks/GoogleAnalytics_B7o8Um_0.mjs';
/* empty css                                          */
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://mercadolista.com");
const $$categoria = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$categoria;
  const { categoria } = Astro2.params;
  const cat = getCategoryBySlug(categoria);
  if (!cat) {
    return Astro2.redirect("/categoria", 302);
  }
  const items = getItemsByCategory(cat.id);
  const BASE = "https://mercadolista.com";
  const canonicalUrl = `${BASE}/categoria/${cat.id}`;
  return renderTemplate(_a || (_a = __template(['<html lang="es" data-astro-cid-mxs6vqg6> <head>', '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Precios ', ' en Colombia hoy \xB7 Mercado Lista</title><meta name="description"', '><link rel="canonical"', '><meta property="og:title"', '><meta property="og:description"', '><meta property="og:url"', '><meta property="og:type" content="website"><meta name="theme-color" content="#0e6a45"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="manifest" href="/manifest.webmanifest"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,640&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet"><script type="application/ld+json">', "<\/script>", "</head> <body data-astro-cid-mxs6vqg6> ", ' <header class="top" data-astro-cid-mxs6vqg6> <h1 data-astro-cid-mxs6vqg6>', " Precios ", ' en Colombia hoy</h1> <p class="lead" data-astro-cid-mxs6vqg6> ', ' productos \xB7 Precios consultados en tiempo real en \xC9xito, D1, Jumbo, Carulla y m\xE1s.\n</p> </header> <main class="cat-page" data-astro-cid-mxs6vqg6> <nav class="breadcrumb" aria-label="Navegaci\xF3n" data-astro-cid-mxs6vqg6> <a href="/" data-astro-cid-mxs6vqg6>Inicio</a> <span aria-hidden="true" data-astro-cid-mxs6vqg6>\u203A</span> <a href="/categoria" data-astro-cid-mxs6vqg6>Categor\xEDas</a> <span aria-hidden="true" data-astro-cid-mxs6vqg6>\u203A</span> <span aria-current="page" data-astro-cid-mxs6vqg6>', '</span> </nav> <ul class="product-grid" role="list" data-astro-cid-mxs6vqg6> ', ' </ul> <div class="other-cats" data-astro-cid-mxs6vqg6> <h2 data-astro-cid-mxs6vqg6>Otras categor\xEDas</h2> <ul class="other-cats-list" role="list" data-astro-cid-mxs6vqg6> ', ' </ul> </div> </main> <footer class="site-footer" data-astro-cid-mxs6vqg6> <p data-astro-cid-mxs6vqg6>\xA9 ', " Mercado Lista \xB7 Precios consultados en tiempo real</p> </footer>  </body> </html>"])), renderComponent($$result, "GoogleAnalytics", $$GoogleAnalytics, { "data-astro-cid-mxs6vqg6": true }), cat.nombre, addAttribute(`Compara precios de ${cat.nombre.toLowerCase()} en \xC9xito, D1, Jumbo, Carulla, Ol\xEDmpica y m\xE1s tiendas de Colombia. Precios actualizados en tiempo real.`, "content"), addAttribute(canonicalUrl, "href"), addAttribute(`Precios ${cat.nombre} en Colombia hoy`, "content"), addAttribute(`Precios actualizados de ${items.length} productos de ${cat.nombre.toLowerCase()} en supermercados colombianos.`, "content"), addAttribute(canonicalUrl, "content"), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: BASE },
      { "@type": "ListItem", position: 2, name: "Categor\xEDas", item: `${BASE}/categoria` },
      { "@type": "ListItem", position: 3, name: cat.nombre, item: canonicalUrl }
    ]
  })), renderHead(), renderComponent($$result, "Nav", $$Nav, { "data-astro-cid-mxs6vqg6": true }), cat.icono, cat.nombre, items.length, cat.nombre, items.map((item) => {
    const slug = toSlug(item.nombre);
    const href = `/categoria/${cat.id}/${slug}`;
    return renderTemplate`<li data-astro-cid-mxs6vqg6> <a${addAttribute(href, "href")} class="product-card" data-astro-cid-mxs6vqg6> <span class="product-icon" data-astro-cid-mxs6vqg6>${item.icono}</span> <div class="product-info" data-astro-cid-mxs6vqg6> <strong class="product-name" data-astro-cid-mxs6vqg6>${item.nombre}</strong> <span class="product-meta" data-astro-cid-mxs6vqg6> ${item.cantidad} ${item.formato} </span> </div> <span class="product-cta" data-astro-cid-mxs6vqg6>Ver precios →</span> </a> </li>`;
  }), CATEGORIES.filter((c) => c.id !== cat.id).map((c) => renderTemplate`<li data-astro-cid-mxs6vqg6> <a${addAttribute(`/categoria/${c.id}`, "href")} data-astro-cid-mxs6vqg6>${c.icono} ${c.nombre}</a> </li>`), (/* @__PURE__ */ new Date()).getFullYear());
}, "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/categoria/[categoria].astro", void 0);

const $$file = "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/categoria/[categoria].astro";
const $$url = "/categoria/[categoria]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$categoria,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
