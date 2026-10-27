import { e as createAstro, f as createComponent, r as renderTemplate, n as renderScript, k as renderComponent, h as addAttribute, l as renderHead, u as unescapeHTML } from '../../chunks/astro/server_zl8i4EZZ.mjs';
import 'piccolore';
/* empty css                                        */
import { g as getItemsByCategory } from '../../chunks/catalog_CZ10BYui.mjs';
import { d as getCategoryBySlug, b as getTaxChildren, t as toSlug } from '../../chunks/slugs_DaoUfEf6.mjs';
import { g as getCollectionNode, c as getHuinchaNavigation, d as getRootDepartments } from '../../chunks/collectionTaxonomy_PwVXjHAC.mjs';
import { s as searchStores } from '../../chunks/index_BmvhlEI_.mjs';
import { b as buildReport } from '../../chunks/ranking_Db_3a0qS.mjs';
import { f as findCity } from '../../chunks/cities_DyPidRWt.mjs';
import { b as cop } from '../../chunks/normalize_DA1X8QDr.mjs';
import { $ as $$Nav } from '../../chunks/Nav_DtWye2VG.mjs';
import { $ as $$GoogleAnalytics } from '../../chunks/GoogleAnalytics_CyJJegFW.mjs';
import { $ as $$CategorySeoFaq, a as $$CategoryHuincha } from '../../chunks/CategorySeoFaq_BYlseupR.mjs';
/* empty css                                          */
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://mercadolista.com");
const $$categoria = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$categoria;
  const { categoria } = Astro2.params;
  const ALIASES = {
    "celulares": "/categoria/tecnologia/telefonia/celulares-y-telefonos",
    "celulares-y-telefonos": "/categoria/tecnologia/telefonia/celulares-y-telefonos",
    "smartphones": "/categoria/tecnologia/telefonia/celulares-y-telefonos/smartphones",
    "televisores": "/categoria/tecnologia/televisores-y-video",
    "laptops": "/categoria/tecnologia/computadores",
    "portatiles": "/categoria/tecnologia/computadores",
    "audifonos": "/categoria/tecnologia/audio",
    "freidoras-de-aire": "/categoria/electrohogar/electrodomesticos-cocina",
    "leche": "/categoria/alimentos-y-bebidas/lacteos-y-frescos/leches-liquidas",
    "huevos": "/categoria/alimentos-y-bebidas/lacteos-y-frescos/huevos",
    "huevo": "/categoria/alimentos-y-bebidas/lacteos-y-frescos/huevos",
    "arroz": "/categoria/alimentos-y-bebidas/despensa/arroz-legumbres-y-semillas/arroz",
    "aceites": "/categoria/alimentos-y-bebidas/despensa/aceites",
    "aceite": "/categoria/alimentos-y-bebidas/despensa/aceites",
    "pollo": "/categoria/alimentos-y-bebidas/carnes/pollo",
    "queso": "/categoria/alimentos-y-bebidas/lacteos-y-frescos/quesos",
    "quesos": "/categoria/alimentos-y-bebidas/lacteos-y-frescos/quesos",
    "cafe": "/categoria/alimentos-y-bebidas/desayunos/cafe",
    "detergente": "/categoria/aseo-y-limpieza/lavado-y-cuidado-de-ropa/detergentes",
    "jabon": "/categoria/aseo-y-limpieza"
  };
  if (categoria && ALIASES[categoria]) {
    return Astro2.redirect(ALIASES[categoria], 301);
  }
  const collNode = getCollectionNode(categoria);
  let legacyCat = getCategoryBySlug(categoria);
  if (!collNode && !legacyCat) {
    return Astro2.redirect("/categoria", 302);
  }
  if (collNode && collNode.level > 1 && collNode.slugPath !== categoria) {
    return Astro2.redirect(`/categoria/${collNode.slugPath}`, 301);
  }
  const cat = legacyCat || {
    id: collNode.slugPath,
    nombre: collNode.name,
    icono: collNode.icono || "\u{1F3F7}\uFE0F",
    descripcion: `Compara precios de ${collNode.name.toLowerCase()} en Falabella, \xC9xito, Alkosto, D1, Jumbo y m\xE1s tiendas de Colombia.`};
  const items = legacyCat ? getItemsByCategory(legacyCat.id) : [];
  const BASE = "https://mercadolista.com";
  const canonicalUrl = `${BASE}/categoria/${collNode?.slugPath || cat.id}`;
  const isTechCategory = (collNode?.rootSlug || cat.id) === "tecnologia";
  const huinchaNav = collNode ? getHuinchaNavigation(collNode) : null;
  const huinchaItems = huinchaNav ? huinchaNav.items : getTaxChildren(cat.id).map(({ path, node: child }, idx) => ({
    id: path,
    name: child.nombre,
    url: `/categoria/${path}`,
    countStr: `${40 + idx * 23 % 190} refs`,
    emoji: "\u{1F3F7}\uFE0F"
  }));
  const city = findCity("bogota");
  const query = collNode?.query || cat.nombre.toLowerCase();
  let liveOffers = [];
  try {
    const outcomes = await searchStores(query, city, 20);
    const report = buildReport(query, outcomes);
    const rawOffers = report?.offers ?? [];
    liveOffers = [...rawOffers].sort((a, b) => (a.price || 0) - (b.price || 0)).slice(0, 48);
  } catch {
  }
  const rootDepartments = getRootDepartments();
  return renderTemplate(_a || (_a = __template(['<html lang="es" data-astro-cid-mxs6vqg6> <head>', '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Precios ', ' en Colombia hoy \xB7 Mercado Lista</title><meta name="description"', '><link rel="canonical"', '><meta property="og:title"', '><meta property="og:description"', '><meta property="og:url"', '><meta property="og:type" content="website"><meta name="theme-color" content="#0e6a45"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="manifest" href="/manifest.webmanifest"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,640&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">', "<\/script>", "</head> <body data-astro-cid-mxs6vqg6> ", ' <main class="cat-page-container" data-astro-cid-mxs6vqg6>  <nav class="breadcrumb-nav" aria-label="Navegaci\xF3n de miga de pan" data-astro-cid-mxs6vqg6> <ol class="breadcrumb-list" data-astro-cid-mxs6vqg6> <li class="breadcrumb-item" data-astro-cid-mxs6vqg6> <a href="/" class="breadcrumb-link" data-astro-cid-mxs6vqg6>Inicio</a> </li> <li class="breadcrumb-item" data-astro-cid-mxs6vqg6> <span class="breadcrumb-sep" aria-hidden="true" data-astro-cid-mxs6vqg6>\u203A</span> <a href="/categoria" class="breadcrumb-link" data-astro-cid-mxs6vqg6>Categor\xEDas</a> </li> <li class="breadcrumb-item" data-astro-cid-mxs6vqg6> <span class="breadcrumb-sep" aria-hidden="true" data-astro-cid-mxs6vqg6>\u203A</span> <span class="breadcrumb-current" aria-current="page" data-astro-cid-mxs6vqg6>', "</span> </li> </ol> </nav>  ", '  <header class="cat-header" data-astro-cid-mxs6vqg6> <div class="cat-header-kicker" data-astro-cid-mxs6vqg6> <span class="cat-badge-dot" data-astro-cid-mxs6vqg6></span> <span data-astro-cid-mxs6vqg6>DEPARTAMENTO OFICIAL \xB7 ', '</span> </div> <h1 class="cat-main-title" data-astro-cid-mxs6vqg6>', " Precios de ", ' en Colombia</h1> <p class="cat-results-count" data-astro-cid-mxs6vqg6> <strong data-astro-cid-mxs6vqg6>', "</strong> <span data-astro-cid-mxs6vqg6> \xB7 Ordenados por menor precio en Falabella, \xC9xito, Alkosto, D1, Jumbo y m\xE1s</span> </p> </header>  ", '  <div class="other-cats" data-astro-cid-mxs6vqg6> <h2 data-astro-cid-mxs6vqg6>Explorar otros departamentos</h2> <ul class="other-cats-list" role="list" data-astro-cid-mxs6vqg6> ', " </ul> </div>  ", ' </main> <footer class="site-footer" data-astro-cid-mxs6vqg6> <p data-astro-cid-mxs6vqg6>\xA9 ', " Mercado Lista \xB7 Precios consultados en tiempo real en Colombia</p> </footer>  ", " </body> </html>"])), renderComponent($$result, "GoogleAnalytics", $$GoogleAnalytics, { "data-astro-cid-mxs6vqg6": true }), cat.nombre, addAttribute(`Compara precios de ${cat.nombre.toLowerCase()} en Falabella, \xC9xito, Alkosto, D1, Jumbo y m\xE1s tiendas de Colombia. Precios actualizados en tiempo real.`, "content"), addAttribute(canonicalUrl, "href"), addAttribute(`Precios ${cat.nombre} en Colombia hoy`, "content"), addAttribute(`Precios actualizados de ${items.length} productos de ${cat.nombre.toLowerCase()} en supermercados y tiendas colombianas.`, "content"), addAttribute(canonicalUrl, "content"), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: BASE },
      { "@type": "ListItem", position: 2, name: "Categor\xEDas", item: `${BASE}/categoria` },
      { "@type": "ListItem", position: 3, name: cat.nombre, item: canonicalUrl }
    ]
  })), renderHead(), renderComponent($$result, "Nav", $$Nav, { "data-astro-cid-mxs6vqg6": true }), cat.nombre, huinchaItems.length > 0 && renderTemplate`${renderComponent($$result, "CategoryHuincha", $$CategoryHuincha, { "kicker": huinchaNav?.kicker || `CATEGOR\xCDAS DE ${cat.nombre.toUpperCase()} (NIVEL 2)`, "subtitle": huinchaNav?.subtitle || `Navegue entre nuestras categor\xEDas oficiales con precios comparados en tiempo real`, "items": huinchaItems, "data-astro-cid-mxs6vqg6": true })}`, cat.nombre.toUpperCase(), cat.icono, cat.nombre, liveOffers.length > 0 ? `${liveOffers.length} ofertas en tiempo real` : `${items.length} productos destacados`, liveOffers.length > 0 ? renderTemplate`<div class="offers-grid-section" data-astro-cid-mxs6vqg6> <ul class="cat-offers-grid" role="list" data-paginate data-astro-cid-mxs6vqg6> ${liveOffers.map((offer) => renderTemplate`<li class="cat-offer-card" data-astro-cid-mxs6vqg6> <a${addAttribute(offer.product_url || "#", "href")} target="_blank" rel="noopener noreferrer" class="cat-offer-link" data-astro-cid-mxs6vqg6> <div class="cat-offer-img-box" data-astro-cid-mxs6vqg6> ${offer.image_url ? renderTemplate`<img${addAttribute(offer.image_url, "src")}${addAttribute(offer.name, "alt")} loading="lazy" class="cat-offer-img" onerror="this.style.opacity='0.2'" data-astro-cid-mxs6vqg6>` : renderTemplate`<span class="cat-offer-no-img" data-astro-cid-mxs6vqg6>${cat.icono}</span>`} <span class="cat-offer-store-pill" data-astro-cid-mxs6vqg6>${offer.store_name}</span> </div> <div class="cat-offer-info" data-astro-cid-mxs6vqg6> <strong class="cat-offer-name"${addAttribute(offer.name, "title")} data-astro-cid-mxs6vqg6>${offer.name}</strong> <div class="cat-offer-price-row" data-astro-cid-mxs6vqg6> <span class="cat-offer-price" data-astro-cid-mxs6vqg6>${cop(offer.price)}</span> ${offer.normal_price && offer.normal_price > offer.price && renderTemplate`<span class="cat-offer-old-price" data-astro-cid-mxs6vqg6>${cop(offer.normal_price)}</span>`} </div> </div> <span class="cat-offer-cta" data-astro-cid-mxs6vqg6>
Ver en ${offer.store_name} →
</span> </a> </li>`)} </ul> <nav class="offers-pager" aria-label="Páginas de ofertas" hidden data-astro-cid-mxs6vqg6></nav> </div>` : items.length > 0 ? renderTemplate`<ul class="product-grid" role="list" data-paginate data-astro-cid-mxs6vqg6> ${items.map((item) => {
    const slug = toSlug(item.nombre);
    const href = `/categoria/${cat.id}/${slug}`;
    return renderTemplate`<li data-astro-cid-mxs6vqg6> <a${addAttribute(href, "href")} class="product-card" data-astro-cid-mxs6vqg6> <span class="product-icon" data-astro-cid-mxs6vqg6>${item.icono}</span> <div class="product-info" data-astro-cid-mxs6vqg6> <strong class="product-name" data-astro-cid-mxs6vqg6>${item.nombre}</strong> <span class="product-meta" data-astro-cid-mxs6vqg6> ${item.cantidad} ${item.formato} </span> </div> <span class="product-cta" data-astro-cid-mxs6vqg6>Ver precios →</span> </a> </li>`;
  })} </ul>
        <nav class="offers-pager" aria-label="Páginas de productos" hidden data-astro-cid-mxs6vqg6></nav>` : null, rootDepartments.filter((r) => r.slugPath !== (collNode?.slugPath || cat.id)).slice(0, 16).map((r) => renderTemplate`<li data-astro-cid-mxs6vqg6> <a${addAttribute(`/categoria/${r.slugPath}`, "href")} data-astro-cid-mxs6vqg6>${r.icono} ${r.name}</a> </li>`), renderComponent($$result, "CategorySeoFaq", $$CategorySeoFaq, { "categoryName": cat.nombre, "isTechCategory": isTechCategory, "data-astro-cid-mxs6vqg6": true }), (/* @__PURE__ */ new Date()).getFullYear(), renderScript($$result, "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/categoria/[categoria].astro?astro&type=script&index=0&lang.ts"));
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
