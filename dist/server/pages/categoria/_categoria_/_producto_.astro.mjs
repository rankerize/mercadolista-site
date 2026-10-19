import { e as createAstro, f as createComponent, r as renderTemplate, n as renderScript, k as renderComponent, h as addAttribute, l as renderHead, u as unescapeHTML } from '../../../chunks/astro/server_zl8i4EZZ.mjs';
import 'piccolore';
/* empty css                                           */
import { g as getCategoryBySlug, a as getItemBySlug, t as toSlug } from '../../../chunks/slugs_BZvKXJ3f.mjs';
import { g as getItemsByCategory, $ as $$Nav } from '../../../chunks/Nav_C7Siogsq.mjs';
import { s as searchStores } from '../../../chunks/index_qWqYRXjv.mjs';
import { b as buildReport } from '../../../chunks/ranking_5o1QqFy4.mjs';
import { f as findCity } from '../../../chunks/cities_DyPidRWt.mjs';
import { c as cop } from '../../../chunks/normalize_BklFQcMY.mjs';
import { $ as $$AddToListModal } from '../../../chunks/AddToListModal_BrWp5P3E.mjs';
import { $ as $$GoogleAnalytics } from '../../../chunks/GoogleAnalytics_CyJJegFW.mjs';
/* empty css                                            */
export { renderers } from '../../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://mercadolista.com");
const $$producto = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$producto;
  const { categoria, producto } = Astro2.params;
  const cat = getCategoryBySlug(categoria);
  const item = getItemBySlug(categoria, producto);
  if (!cat || !item) {
    return Astro2.redirect(`/categoria/${categoria ?? ""}`, 302);
  }
  const BASE = "https://mercadolista.com";
  const canonicalUrl = `${BASE}/categoria/${cat.id}/${toSlug(item.nombre)}`;
  const city = findCity("bogota");
  let report = null;
  let errorMsg = null;
  try {
    const outcomes = await searchStores(item.nombre, city);
    report = buildReport(item.nombre, outcomes);
  } catch (e) {
    errorMsg = "No pudimos consultar los precios en este momento. Intenta de nuevo en unos segundos.";
  }
  const verdict = report?.verdict ?? null;
  const offers = report?.offers ?? [];
  const topOffers = offers.slice(0, 8);
  const siblings = getItemsByCategory(cat.id).filter((s) => s.nombre !== item.nombre).slice(0, 6);
  const schemaOffers = topOffers.map((o) => ({
    "@type": "Offer",
    price: o.price.toFixed(0),
    priceCurrency: "COP",
    availability: "https://schema.org/InStock",
    seller: { "@type": "Organization", name: o.store_name },
    url: o.url
  }));
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.nombre,
    description: `Precio de ${item.nombre} en supermercados de Colombia. Comparaci\xF3n en tiempo real entre \xC9xito, D1, Jumbo, Carulla, Ol\xEDmpica y m\xE1s.`,
    ...verdict?.image ? { image: verdict.image } : {},
    offers: schemaOffers.length > 0 ? schemaOffers : void 0
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: BASE },
      { "@type": "ListItem", position: 2, name: "Categor\xEDas", item: `${BASE}/categoria` },
      { "@type": "ListItem", position: 3, name: cat.nombre, item: `${BASE}/categoria/${cat.id}` },
      { "@type": "ListItem", position: 4, name: item.nombre, item: canonicalUrl }
    ]
  };
  return renderTemplate(_a || (_a = __template(['<html lang="es" data-astro-cid-ne3qarjd> <head>', '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Precio ', ' hoy en Colombia \xB7 Mercado Lista</title><meta name="description"', '><link rel="canonical"', '><meta property="og:title"', '><meta property="og:description"', '><meta property="og:url"', '><meta property="og:type" content="website">', '<meta name="theme-color" content="#0e6a45"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="manifest" href="/manifest.webmanifest"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,640&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet"><script type="application/ld+json">', '<\/script><script type="application/ld+json">', "<\/script>", "</head> <body data-astro-cid-ne3qarjd> ", ' <header class="top" data-astro-cid-ne3qarjd> <h1 data-astro-cid-ne3qarjd>', " ", '</h1> <h2 class="page-subtitle" data-astro-cid-ne3qarjd>Precio ', ' hoy en Colombia</h2> <p class="lead" data-astro-cid-ne3qarjd>Comparaci\xF3n en tiempo real \xB7 ', '</p> </header> <main class="prod-page" data-astro-cid-ne3qarjd> <nav class="breadcrumb" aria-label="Navegaci\xF3n" data-astro-cid-ne3qarjd> <a href="/" data-astro-cid-ne3qarjd>Inicio</a> <span aria-hidden="true" data-astro-cid-ne3qarjd>\u203A</span> <a href="/categoria" data-astro-cid-ne3qarjd>Categor\xEDas</a> <span aria-hidden="true" data-astro-cid-ne3qarjd>\u203A</span> <a', " data-astro-cid-ne3qarjd>", '</a> <span aria-hidden="true" data-astro-cid-ne3qarjd>\u203A</span> <span aria-current="page" data-astro-cid-ne3qarjd>', "</span> </nav> ", " ", " ", " ", " ", ' <div class="cta-home" data-astro-cid-ne3qarjd> <p data-astro-cid-ne3qarjd>\xBFQuieres comparar un producto diferente o armar tu lista del mercado?</p> <a href="/" class="btn-home" data-astro-cid-ne3qarjd>Ir al comparador \u2192</a> </div> </main> ', ' <footer class="site-footer" data-astro-cid-ne3qarjd> <p data-astro-cid-ne3qarjd>\xA9 ', " Mercado Lista \xB7 Precios consultados en tiempo real en Bogot\xE1</p> </footer> ", "  </body> </html>"])), renderComponent($$result, "GoogleAnalytics", $$GoogleAnalytics, { "data-astro-cid-ne3qarjd": true }), item.nombre, addAttribute(`\xBFD\xF3nde comprar ${item.nombre} m\xE1s barato? Compara el precio en \xC9xito, D1, Jumbo, Carulla y m\xE1s supermercados de Colombia. Actualizado hoy.`, "content"), addAttribute(canonicalUrl, "href"), addAttribute(`Precio ${item.nombre} hoy en Colombia`, "content"), addAttribute(verdict ? `${verdict.headline} \xB7 ${cop(verdict.price)} en ${verdict.store_name}` : `Compara el precio de ${item.nombre} en supermercados colombianos.`, "content"), addAttribute(canonicalUrl, "content"), verdict?.image && renderTemplate`<meta property="og:image"${addAttribute(verdict.image, "content")}>`, unescapeHTML(JSON.stringify(schema)), unescapeHTML(JSON.stringify(breadcrumbSchema)), renderHead(), renderComponent($$result, "Nav", $$Nav, { "data-astro-cid-ne3qarjd": true }), item.icono, item.nombre, item.nombre, city.name, addAttribute(`/categoria/${cat.id}`, "href"), cat.nombre, item.nombre, errorMsg && renderTemplate`<div class="error-banner" role="alert" data-astro-cid-ne3qarjd>${errorMsg}</div>`, verdict && renderTemplate`<section class="verdict-box" aria-label="Veredicto" data-astro-cid-ne3qarjd> <div class="verdict-winner" data-astro-cid-ne3qarjd> ${verdict.image && renderTemplate`<img${addAttribute(verdict.image, "src")}${addAttribute(verdict.name, "alt")} class="verdict-img" width="80" height="80" loading="eager" data-astro-cid-ne3qarjd>`} <div class="verdict-text" data-astro-cid-ne3qarjd> <p class="verdict-headline" data-astro-cid-ne3qarjd>${verdict.headline}</p> <p class="verdict-price" data-astro-cid-ne3qarjd> <strong data-astro-cid-ne3qarjd>${cop(verdict.price)}</strong> <span class="verdict-store" data-astro-cid-ne3qarjd>en ${verdict.store_name}</span> </p> ${verdict.detail && renderTemplate`<p class="verdict-detail" data-astro-cid-ne3qarjd>${verdict.detail}</p>`} ${verdict.payment_note && renderTemplate`<p class="verdict-payment" data-astro-cid-ne3qarjd>💳 ${verdict.payment_note}</p>`} </div> </div> <div class="verdict-actions" data-astro-cid-ne3qarjd> <a${addAttribute(verdict.url, "href")} target="_blank" rel="noopener noreferrer" class="btn-buy" data-astro-cid-ne3qarjd>
Ver en ${verdict.store_name} →
</a> <button type="button" class="btn-add-list"${addAttribute(verdict.name, "data-name")}${addAttribute(verdict.store_name, "data-store")}${addAttribute(verdict.price, "data-price")}${addAttribute(verdict.image ?? "", "data-image")} data-astro-cid-ne3qarjd>
➕ Agregar a lista
</button> </div> </section>`, topOffers.length > 0 && renderTemplate`<section class="offers-section" aria-label="Precios por tienda" data-astro-cid-ne3qarjd> <h2 data-astro-cid-ne3qarjd>Precios por tienda</h2> <ul class="offers-list" role="list" data-astro-cid-ne3qarjd> ${topOffers.map((o, i) => renderTemplate`<li${addAttribute(`offer-row ${i === 0 ? "offer-row--winner" : ""}`, "class")} data-astro-cid-ne3qarjd> <div class="offer-row-left" data-astro-cid-ne3qarjd> ${o.image && renderTemplate`<img${addAttribute(o.image, "src")}${addAttribute(o.name, "alt")} class="offer-thumb" width="48" height="48" loading="lazy" data-astro-cid-ne3qarjd>`} <div class="offer-row-info" data-astro-cid-ne3qarjd> <span class="offer-store" data-astro-cid-ne3qarjd>${o.store_name}</span> <span class="offer-name" data-astro-cid-ne3qarjd>${o.name}</span> ${o.unit_price && renderTemplate`<span class="offer-unit" data-astro-cid-ne3qarjd>${cop(o.unit_price)} / ${o.unit_label}</span>`} </div> </div> <div class="offer-row-right" data-astro-cid-ne3qarjd> <span class="offer-price" data-astro-cid-ne3qarjd>${cop(o.price)}</span> ${o.list_price && o.list_price > o.price && renderTemplate`<span class="offer-list-price" data-astro-cid-ne3qarjd>${cop(o.list_price)}</span>`} <a${addAttribute(o.url, "href")} target="_blank" rel="noopener noreferrer" class="offer-link" data-astro-cid-ne3qarjd>Ver →</a> <button type="button" class="btn-add-list-sm"${addAttribute(o.name, "data-name")}${addAttribute(o.store_name, "data-store")}${addAttribute(o.price, "data-price")}${addAttribute(o.image ?? "", "data-image")} data-astro-cid-ne3qarjd>➕</button> </div> </li>`)} </ul> </section>`, topOffers.length === 0 && !errorMsg && renderTemplate`<div class="no-results" data-astro-cid-ne3qarjd> <p data-astro-cid-ne3qarjd>No encontramos resultados para <strong data-astro-cid-ne3qarjd>${item.nombre}</strong> en este momento.</p> <a href="/" class="btn-home" data-astro-cid-ne3qarjd>Buscar en la app →</a> </div>`, siblings.length > 0 && renderTemplate`<section class="siblings-section"${addAttribute(`M\xE1s productos de ${cat.nombre}`, "aria-label")} data-astro-cid-ne3qarjd> <h2 data-astro-cid-ne3qarjd>Más productos de ${cat.nombre}</h2> <ul class="siblings-list" role="list" data-astro-cid-ne3qarjd> ${siblings.map((s) => renderTemplate`<li data-astro-cid-ne3qarjd> <a${addAttribute(`/categoria/${cat.id}/${toSlug(s.nombre)}`, "href")} class="sibling-card" data-astro-cid-ne3qarjd> <span data-astro-cid-ne3qarjd>${s.icono}</span> <span data-astro-cid-ne3qarjd>${s.nombre}</span> </a> </li>`)} </ul> </section>`, renderComponent($$result, "AddToListModal", $$AddToListModal, { "data-astro-cid-ne3qarjd": true }), (/* @__PURE__ */ new Date()).getFullYear(), renderScript($$result, "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/categoria/[categoria]/[producto].astro?astro&type=script&index=0&lang.ts"));
}, "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/categoria/[categoria]/[producto].astro", void 0);

const $$file = "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/categoria/[categoria]/[producto].astro";
const $$url = "/categoria/[categoria]/[producto]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$producto,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
