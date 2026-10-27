import { e as createAstro, f as createComponent, r as renderTemplate, k as renderComponent, l as renderHead, u as unescapeHTML, h as addAttribute } from '../../chunks/astro/server_zl8i4EZZ.mjs';
import 'piccolore';
/* empty css                                        */
import { C as CATEGORIES } from '../../chunks/catalog_CZ10BYui.mjs';
import { g as getTaxNode, a as getItemBySlug, b as getTaxChildren, c as getBreadcrumb } from '../../chunks/slugs_FA5KJuS_.mjs';
import { g as getCollectionNode, a as getCollectionSeo, b as getCollectionBreadcrumbItems, c as getHuinchaNavigation } from '../../chunks/collectionTaxonomy_PwVXjHAC.mjs';
import { s as searchStores } from '../../chunks/index_BmvhlEI_.mjs';
import { b as buildReport } from '../../chunks/ranking_Db_3a0qS.mjs';
import { f as findCity } from '../../chunks/cities_DyPidRWt.mjs';
import { b as cop } from '../../chunks/normalize_DA1X8QDr.mjs';
import { $ as $$Nav } from '../../chunks/Nav_DtWye2VG.mjs';
import { $ as $$AddToListModal } from '../../chunks/AddToListModal_BrWp5P3E.mjs';
import { $ as $$PlpView } from '../../chunks/PlpView_CER36IUx.mjs';
import { a as $$GoogleAdSense, $ as $$GoogleAnalytics } from '../../chunks/GoogleAdSense_Bc90ZQI7.mjs';
/* empty css                                     */
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a, _b;
const $$Astro = createAstro("https://mercadolista.com");
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const { slug } = Astro2.params;
  let segments = (slug ?? "").split("/").filter(Boolean);
  const ALIAS_PREFIXES = {
    "celulares": "tecnologia/telefonia/celulares-y-telefonos",
    "celulares-y-telefonos": "tecnologia/telefonia/celulares-y-telefonos",
    "smartphones": "tecnologia/telefonia/celulares-y-telefonos/smartphones",
    "televisores": "tecnologia/televisores-y-video",
    "laptops": "tecnologia/computadores",
    "portatiles": "tecnologia/computadores",
    "audifonos": "tecnologia/audio",
    "freidoras-de-aire": "electrohogar/electrodomesticos-cocina"
  };
  if (segments.length >= 1 && ALIAS_PREFIXES[segments[0]]) {
    const targetPrefix = ALIAS_PREFIXES[segments[0]];
    const rest = segments.slice(1).join("/");
    const targetUrl = rest ? `/categoria/${targetPrefix}/${rest}` : `/categoria/${targetPrefix}`;
    return Astro2.redirect(targetUrl, 301);
  }
  if (segments.length < 2) {
    return Astro2.redirect("/categoria", 302);
  }
  const catId = segments[0];
  const taxPath = segments.join("/");
  const collNode = getCollectionNode(taxPath);
  let cat = CATEGORIES.find((c) => c.id === catId);
  if (!cat && collNode) {
    const rootNode = getCollectionNode(collNode.rootSlug);
    cat = {
      id: collNode.rootSlug,
      nombre: rootNode ? rootNode.name : collNode.breadcrumb[0] || collNode.name,
      icono: rootNode?.icono || "\u{1F3F7}\uFE0F",
      descripcion: `Compara precios en tiendas de Colombia`,
      color: "#0e6a45"
    };
  }
  if (!cat) return Astro2.redirect("/categoria", 302);
  let node = getTaxNode(taxPath);
  if (!node && collNode) {
    const seo = getCollectionSeo(collNode);
    node = {
      id: collNode.id,
      nombre: collNode.name,
      icono: collNode.icono || "\u{1F3F7}\uFE0F",
      query: collNode.query || collNode.name.toLowerCase(),
      titleSeo: seo.titleSeo,
      metaDesc: seo.metaDesc,
      h1: seo.h1,
      childIds: collNode.childIds,
      level: collNode.level
    };
  }
  if (!node && !collNode && segments.length === 2) {
    const legacyItem = getItemBySlug(segments[0], segments[1]);
    if (legacyItem) {
      node = {
        id: segments.join("/"),
        nombre: legacyItem.nombre,
        icono: legacyItem.icono,
        query: legacyItem.nombre,
        titleSeo: `Precio de ${legacyItem.nombre} en Colombia hoy \xB7 Mercado Lista`,
        metaDesc: `\xBFD\xF3nde comprar ${legacyItem.nombre} m\xE1s barato en Colombia? Compara precios en tiempo real.`,
        h1: `${legacyItem.icono} Precio de ${legacyItem.nombre} en Colombia`,
        childIds: [],
        level: 2
      };
    }
  }
  if (!node) return Astro2.redirect(`/categoria/${catId}`, 302);
  const children = getTaxChildren(taxPath);
  collNode ? collNode.childIds.length === 0 : children.length === 0;
  const BASE = "https://mercadolista.com";
  const canonicalUrl = `${BASE}/categoria/${collNode ? collNode.slugPath : taxPath}`;
  const ciudadParam = Astro2.url.searchParams.get("ciudad") || "bogota";
  const city = findCity(ciudadParam);
  let report = null;
  let errorMsg = null;
  if (node.query) {
    try {
      const searchPromise = searchStores(node.query, city);
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error("SSR timeout")), 4e3)
      );
      const outcomes = await Promise.race([searchPromise, timeoutPromise]);
      report = buildReport(node.query, outcomes);
    } catch {
    }
  }
  const verdict = report?.verdict ?? null;
  const rawOffers = report?.offers ?? [];
  const sortedOffers = [...rawOffers].sort((a, b) => (a.price || 0) - (b.price || 0));
  const topOffers = sortedOffers.slice(0, 200);
  const crumbData = collNode ? getCollectionBreadcrumbItems(collNode, BASE).map((c) => ({ name: c.name, item: c.url })) : getBreadcrumb(segments, BASE);
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbData.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.item
    }))
  };
  const itemListSchema = topOffers.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: node.nombre,
    description: node.metaDesc,
    numberOfItems: topOffers.length,
    itemListElement: topOffers.map((o, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Product",
        name: o.name,
        ...o.image ? { image: o.image } : {},
        offers: {
          "@type": "Offer",
          price: o.price.toFixed(0),
          priceCurrency: "COP",
          seller: { "@type": "Organization", name: o.store_name },
          url: o.url,
          availability: "https://schema.org/InStock"
        }
      }
    }))
  } : null;
  const huinchaNav = collNode ? getHuinchaNavigation(collNode) : null;
  const isCelularesCat = taxPath.startsWith("tecnologia/celulares");
  let huinchaItems = [];
  if (huinchaNav && huinchaNav.items.length > 0) {
    huinchaItems = huinchaNav.items;
  } else if (isCelularesCat) {
    huinchaItems = [
      {
        id: "apple",
        name: "Apple iPhone",
        url: "/categoria/tecnologia/celulares/apple",
        countStr: "142 refs",
        iconType: "apple",
        isActive: taxPath === "tecnologia/celulares/apple"
      },
      {
        id: "samsung",
        name: "Samsung Galaxy",
        url: "/categoria/tecnologia/celulares/samsung",
        countStr: "198 refs",
        iconType: "samsung",
        isActive: taxPath === "tecnologia/celulares/samsung"
      },
      {
        id: "xiaomi",
        name: "Xiaomi Redmi",
        url: "/categoria/tecnologia/celulares/xiaomi",
        countStr: "156 refs",
        iconType: "xiaomi",
        isActive: taxPath === "tecnologia/celulares/xiaomi"
      },
      {
        id: "motorola",
        name: "Motorola Moto",
        url: "/categoria/tecnologia/celulares/motorola",
        countStr: "118 refs",
        iconType: "motorola",
        isActive: taxPath === "tecnologia/celulares/motorola"
      },
      {
        id: "honor",
        name: "Honor",
        url: "/categoria/tecnologia/celulares/honor",
        countStr: "86 refs",
        iconType: "honor",
        isActive: taxPath === "tecnologia/celulares/honor"
      },
      {
        id: "smartwatches",
        name: "Smartwatches",
        url: "/categoria/tecnologia/celulares/smartwatches",
        countStr: "64 refs",
        iconType: "smartwatch",
        isActive: taxPath === "tecnologia/celulares/smartwatches"
      },
      {
        id: "audifonos",
        name: "Aud\xEDfonos",
        url: "/categoria/tecnologia/celulares/audifonos",
        countStr: "92 refs",
        iconType: "audifonos",
        isActive: taxPath === "tecnologia/celulares/audifonos"
      },
      {
        id: "accesorios",
        name: "Accesorios",
        url: "/categoria/tecnologia/celulares/accesorios",
        countStr: "75 refs",
        iconType: "accesorios",
        isActive: taxPath === "tecnologia/celulares/accesorios"
      }
    ];
  } else if (children.length > 0) {
    huinchaItems = children.map(({ path, node: child }, idx) => ({
      id: path,
      name: child.nombre,
      url: `/categoria/${path}`,
      countStr: `${30 + idx * 17 % 180} refs`,
      emoji: "\u{1F3F7}\uFE0F",
      isActive: taxPath === path
    }));
  }
  const huinchaKicker = huinchaNav?.kicker || (isCelularesCat ? "L\xCDNEAS Y MARCAS OFICIALES DE CELULARES" : `SUBCATEGOR\xCDAS DE ${node.nombre.toUpperCase()}`);
  const huinchaSubtitle = huinchaNav?.subtitle || (isCelularesCat ? "Navegue entre nuestras familias de telefon\xEDa oficial con env\xEDos a toda Colombia y precios en tiempo real" : "Navegue entre nuestras subcategor\xEDas con precios actualizados");
  return renderTemplate(_b || (_b = __template(['<html lang="es" data-astro-cid-nhjqudez> <head>', "", '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>', '</title><meta name="description"', '><link rel="canonical"', '><meta property="og:title"', '><meta property="og:description"', '><meta property="og:url"', '><meta property="og:type" content="website">', '<meta name="theme-color" content="#0e6a45"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="manifest" href="/manifest.webmanifest"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,640&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet"><script type="application/ld+json">', "<\/script>", "", "</head> <body data-astro-cid-nhjqudez> ", " ", " ", ' <footer class="site-footer" data-astro-cid-nhjqudez> <p data-astro-cid-nhjqudez>\xA9 ', " Mercado Lista \xB7 Comparador de precios en tiempo real para Colombia</p> </footer>   </body> </html>"])), renderComponent($$result, "GoogleAnalytics", $$GoogleAnalytics, { "data-astro-cid-nhjqudez": true }), renderComponent($$result, "GoogleAdSense", $$GoogleAdSense, { "data-astro-cid-nhjqudez": true }), node.titleSeo, addAttribute(node.metaDesc, "content"), addAttribute(canonicalUrl, "href"), addAttribute(node.titleSeo, "content"), addAttribute(verdict ? `${verdict.headline} \xB7 ${cop(verdict.price)} en ${verdict.store_name}` : node.metaDesc, "content"), addAttribute(canonicalUrl, "content"), verdict?.image && renderTemplate`<meta property="og:image"${addAttribute(verdict.image, "content")}>`, unescapeHTML(JSON.stringify(breadcrumbSchema)), itemListSchema && renderTemplate(_a || (_a = __template(['<script type="application/ld+json">', "<\/script>"])), unescapeHTML(JSON.stringify(itemListSchema))), renderHead(), renderComponent($$result, "Nav", $$Nav, { "data-astro-cid-nhjqudez": true }), renderComponent($$result, "PlpView", $$PlpView, { "h1": node.h1 || `${node.nombre} en Colombia`, "nombre": node.nombre, "query": node.query || "", "city": city, "crumbs": crumbData, "offers": topOffers, "verdict": verdict, "errorMsg": errorMsg, "huinchaItems": huinchaItems, "huinchaKicker": huinchaKicker, "huinchaSubtitle": huinchaSubtitle, "showFaq": true, "isTechCategory": catId === "tecnologia", "data-astro-cid-nhjqudez": true }), renderComponent($$result, "AddToListModal", $$AddToListModal, { "data-astro-cid-nhjqudez": true }), (/* @__PURE__ */ new Date()).getFullYear());
}, "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/categoria/[...slug].astro", void 0);

const $$file = "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/categoria/[...slug].astro";
const $$url = "/categoria/[...slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
