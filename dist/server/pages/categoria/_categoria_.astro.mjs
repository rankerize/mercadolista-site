import { e as createAstro, f as createComponent, r as renderTemplate, k as renderComponent, l as renderHead, u as unescapeHTML, h as addAttribute } from '../../chunks/astro/server_zl8i4EZZ.mjs';
import 'piccolore';
/* empty css                                        */
import { g as getItemsByCategory } from '../../chunks/catalog_CZ10BYui.mjs';
import { d as getCategoryBySlug, b as getTaxChildren } from '../../chunks/slugs_FA5KJuS_.mjs';
import { g as getCollectionNode, c as getHuinchaNavigation, d as getRootDepartments } from '../../chunks/collectionTaxonomy_PwVXjHAC.mjs';
import { s as searchStores } from '../../chunks/index_BmvhlEI_.mjs';
import { b as buildReport } from '../../chunks/ranking_Db_3a0qS.mjs';
import { f as findCity } from '../../chunks/cities_DyPidRWt.mjs';
import { $ as $$Nav } from '../../chunks/Nav_kzfrG_m0.mjs';
import { a as $$GoogleAdSense, $ as $$GoogleAnalytics } from '../../chunks/GoogleAdSense_Bc90ZQI7.mjs';
import { $ as $$PlpView } from '../../chunks/PlpView_CER36IUx.mjs';
import { $ as $$AddToListModal } from '../../chunks/AddToListModal_BrWp5P3E.mjs';
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
  let verdict = null;
  try {
    const outcomes = await searchStores(query, city, 20);
    const report = buildReport(query, outcomes);
    const rawOffers = report?.offers ?? [];
    liveOffers = [...rawOffers].sort((a, b) => (a.price || 0) - (b.price || 0)).slice(0, 48);
    verdict = report?.verdict ?? null;
  } catch {
  }
  const crumbData = [
    { name: "Inicio", item: BASE },
    { name: "Categor\xEDas", item: `${BASE}/categoria` },
    { name: cat.nombre, item: canonicalUrl }
  ];
  getRootDepartments();
  return renderTemplate(_a || (_a = __template(['<html lang="es" data-astro-cid-mxs6vqg6> <head>', "", '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Precios ', ' en Colombia hoy \xB7 Mercado Lista</title><meta name="description"', '><link rel="canonical"', '><meta property="og:title"', '><meta property="og:description"', '><meta property="og:url"', '><meta property="og:type" content="website"><meta name="theme-color" content="#0e6a45"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="manifest" href="/manifest.webmanifest"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,640&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">', "<\/script>", "</head> <body data-astro-cid-mxs6vqg6> ", " ", " ", ' <footer class="site-footer" data-astro-cid-mxs6vqg6> <p data-astro-cid-mxs6vqg6>\xA9 ', " Mercado Lista \xB7 Comparador de precios en tiempo real para Colombia</p> </footer>  </body> </html>"])), renderComponent($$result, "GoogleAnalytics", $$GoogleAnalytics, { "data-astro-cid-mxs6vqg6": true }), renderComponent($$result, "GoogleAdSense", $$GoogleAdSense, { "data-astro-cid-mxs6vqg6": true }), cat.nombre, addAttribute(`Compara precios de ${cat.nombre.toLowerCase()} en Falabella, \xC9xito, Alkosto, D1, Jumbo y m\xE1s tiendas de Colombia. Precios actualizados en tiempo real.`, "content"), addAttribute(canonicalUrl, "href"), addAttribute(`Precios ${cat.nombre} en Colombia hoy`, "content"), addAttribute(`Precios actualizados de ${items.length} productos de ${cat.nombre.toLowerCase()} en supermercados y tiendas colombianas.`, "content"), addAttribute(canonicalUrl, "content"), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: BASE },
      { "@type": "ListItem", position: 2, name: "Categor\xEDas", item: `${BASE}/categoria` },
      { "@type": "ListItem", position: 3, name: cat.nombre, item: canonicalUrl }
    ]
  })), renderHead(), renderComponent($$result, "Nav", $$Nav, { "data-astro-cid-mxs6vqg6": true }), renderComponent($$result, "PlpView", $$PlpView, { "h1": `Precios de ${cat.nombre} en Colombia`, "nombre": cat.nombre, "query": query, "city": city, "crumbs": crumbData, "offers": liveOffers, "verdict": verdict, "huinchaItems": huinchaItems, "huinchaKicker": huinchaNav?.kicker || `CATEGOR\xCDAS DE ${cat.nombre.toUpperCase()} (NIVEL 2)`, "huinchaSubtitle": huinchaNav?.subtitle || `Navegue entre nuestras categor\xEDas oficiales con precios comparados en tiempo real`, "showFaq": true, "isTechCategory": isTechCategory, "data-astro-cid-mxs6vqg6": true }), renderComponent($$result, "AddToListModal", $$AddToListModal, { "data-astro-cid-mxs6vqg6": true }), (/* @__PURE__ */ new Date()).getFullYear());
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
