import { f as createComponent, r as renderTemplate, k as renderComponent, h as addAttribute, l as renderHead, u as unescapeHTML } from '../../chunks/astro/server_zl8i4EZZ.mjs';
import 'piccolore';
/* empty css                                        */
import { $ as $$Nav } from '../../chunks/Nav_kzfrG_m0.mjs';
import { a as $$CookieBanner, $ as $$CategoryBanner } from '../../chunks/CategoryBanner_DHHQS4sf.mjs';
import { a as $$GoogleAdSense, $ as $$GoogleAnalytics } from '../../chunks/GoogleAdSense_Bc90ZQI7.mjs';
import { $ as $$AssistantChatWidget } from '../../chunks/AssistantChatWidget_DppeQAfd.mjs';
/* empty css                                           */
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$BlackFriday = createComponent(($$result, $$props, $$slots) => {
  const BASE = "https://mercadolista.com";
  const CANONICAL = `${BASE}/page/black-friday`;
  const RETAILER_STORES = [
    {
      id: "exito",
      name: "\xC9xito",
      badge: "Hipermercado y Tecnolog\xEDa",
      color: "#f2c200",
      textColor: "#1f2937",
      siteUrl: "https://www.exito.com",
      searchQuery: "exito",
      description: "Smart TVs, celulares Samsung y Xiaomi, freidoras de aire, electrodom\xE9sticos y mercado con descuentos Puntos Colombia.",
      tags: ["Televisores", "Celulares", "Electro", "Mercado"]
    },
    {
      id: "falabella",
      name: "Falabella",
      badge: "Tienda por Departamentos",
      color: "#6fbf4a",
      textColor: "#ffffff",
      siteUrl: "https://www.falabella.com.co",
      searchQuery: "falabella",
      description: "Moda mujer y hombre, calzado deportivo Nike/Adidas, iPhones, computadores port\xE1tiles y l\xEDnea blanca con CMR.",
      tags: ["Moda", "Zapatos", "iPhone", "Laptops"]
    },
    {
      id: "alkosto",
      name: "Alkosto",
      badge: "Hiperahorro y Tecnolog\xEDa",
      color: "#e23b2f",
      textColor: "#ffffff",
      siteUrl: "https://www.alkosto.com",
      searchQuery: "alkosto",
      description: "Celulares libres, port\xE1tiles Lenovo y ASUS, Smart TVs 4K, neveras No Frost y llantas con env\xEDo gratis nacional.",
      tags: ["Celulares Libres", "Port\xE1tiles", "Neveras", "Llantas"]
    },
    {
      id: "ktronix",
      name: "Ktronix",
      badge: "Especialista en Tecnolog\xEDa",
      color: "#111111",
      textColor: "#ffffff",
      siteUrl: "https://www.ktronix.com",
      searchQuery: "ktronix",
      description: "Consolas PS5, Xbox Series X, Nintendo Switch, aud\xEDfonos JBL y Sony, smartwatches y computaci\xF3n gamer.",
      tags: ["PS5", "Gaming", "Aud\xEDfonos", "Smartwatch"]
    },
    {
      id: "jumbo",
      name: "Jumbo",
      badge: "Supermercado y Electro",
      color: "#00a34a",
      textColor: "#ffffff",
      siteUrl: "https://www.jumbocolombia.com",
      searchQuery: "jumbo",
      description: "Licores importados, carnes premium, despensa gourmet y electrodom\xE9sticos Samsung y LG con Tarjeta Cencosud.",
      tags: ["Licores", "L\xEDnea Blanca", "Cafeteras", "Gourmet"]
    },
    {
      id: "carulla",
      name: "Carulla",
      badge: "Supermercado Gourmet",
      color: "#1f8f4e",
      textColor: "#ffffff",
      siteUrl: "https://www.carulla.com",
      searchQuery: "carulla",
      description: "Vinos del mundo, quesos finos, carnes maduradas y caf\xE9 especial con ofertas exclusivas Black Days.",
      tags: ["Vinos", "Quesos", "Caf\xE9", "Delicatessen"]
    },
    {
      id: "d1",
      name: "Tiendas D1",
      badge: "Precios Bajos Siempre",
      color: "#e10600",
      textColor: "#ffffff",
      siteUrl: "https://www.d1.com.co",
      searchQuery: "d1",
      description: "Abarrotes, productos de aseo, despensa diaria y art\xEDculos de temporada al menor costo garantizado.",
      tags: ["Abarrotes", "Aseo", "Despensa", "Ahorro"]
    },
    {
      id: "olimpica",
      name: "Ol\xEDmpica",
      badge: "Supertiendas y Droguer\xEDas",
      color: "#d21f3c",
      textColor: "#ffffff",
      siteUrl: "https://www.olimpica.com",
      searchQuery: "olimpica",
      description: "Mercado familiar, droguer\xEDa, electrodom\xE9sticos Challenger y descuentos especiales con Tarjeta Plata.",
      tags: ["Farmacia", "Mercado", "Challenger", "Tarjeta Plata"]
    },
    {
      id: "easy",
      name: "Easy Colombia",
      badge: "Hogar y Construcci\xF3n",
      color: "#f18a00",
      textColor: "#ffffff",
      siteUrl: "https://www.easy.com.co",
      searchQuery: "easy",
      description: "Muebles de sala y oficina, herramientas Dewalt/Bosch, pinturas Corona, ba\xF1os y remodelaci\xF3n para el hogar.",
      tags: ["Muebles", "Herramientas", "Pinturas", "Ba\xF1os"]
    },
    {
      id: "amazon",
      name: "Amazon Colombia",
      badge: "E-commerce Internacional",
      color: "#ff9900",
      textColor: "#111111",
      siteUrl: "https://www.amazon.com",
      searchQuery: "amazon",
      description: "Env\xEDos gratis a Colombia en compras seleccionadas de m\xE1s de USD $35. Dispositivos Echo, Kindle y gadgets.",
      tags: ["Env\xEDo Gratis > $35", "Echo Alexa", "Kindle", "Importados"]
    },
    {
      id: "mercadolibre",
      name: "Mercado Libre",
      badge: "Marketplace L\xEDder",
      color: "#ffe600",
      textColor: "#1f2937",
      siteUrl: "https://www.mercadolibre.com.co",
      searchQuery: "mercado libre",
      description: "Millones de ofertas con env\xEDos Full en 24 horas y tiendas oficiales directas de fabricantes.",
      tags: ["Env\xEDos Full", "Tiendas Oficiales", "Garant\xEDa", "Tecnolog\xEDa"]
    }
  ];
  const FAQS = [
    {
      q: "\xBFCu\xE1ndo se realiza el Black Friday 2026 en Colombia?",
      a: "El Black Friday 2026 en Colombia se llevar\xE1 a cabo oficialmente desde el viernes 27 de noviembre hasta el viernes 4 de diciembre de 2026. Esta semana de ofertas online (Black Week) re\xFAne a las principales tiendas de comercio electr\xF3nico de Colombia con promociones continuas durante 8 d\xEDas."
    },
    {
      q: "\xBFQu\xE9 comercios online participan en el Black Friday Colombia 2026?",
      a: "Participan las principales cadenas de retail y supermercados del pa\xEDs: \xC9xito, Falabella, Alkosto, Ktronix, Jumbo, Carulla, Tiendas D1, Ol\xEDmpica, Easy, Mercado Libre y Amazon con cobertura de despachos a nivel nacional."
    },
    {
      q: "\xBFC\xF3mo saber en qu\xE9 tienda est\xE1 m\xE1s barato un producto durante el Black Friday?",
      a: 'En Mercado Lista puedes escribir el nombre de cualquier producto (ej. "iPhone 15", "Televisor 55", "Freidora de aire", "Tenis Nike") y nuestro comparador consulta en tiempo real todas las tiendas simult\xE1neamente para decirte exactamente en cu\xE1l est\xE1 el precio m\xE1s bajo.'
    },
    {
      q: "\xBFCu\xE1les son las categor\xEDas m\xE1s buscadas con descuento en Black Friday?",
      a: "Las categor\xEDas con mayor volumen de rebajas son tecnolog\xEDa (celulares libres, televisores Smart TV 4K, computadores port\xE1tiles y consolas de videojuegos), electrohogar (freidoras de aire, neveras No Frost, lavadoras), calzado deportivo, moda y productos de despensa familiar."
    },
    {
      q: "\xBFLos descuentos de Black Friday aplican en Bogot\xE1, Medell\xEDn, Cali y otras ciudades?",
      a: "S\xED. Las ofertas del comercio online aplican para Bogot\xE1, Medell\xEDn, Cali, Barranquilla, Bucaramanga, Cartagena, Pereira, Manizales y la gran mayor\xEDa de ciudades de Colombia con despacho directo a domicilio o la opci\xF3n de retiro gratis en tienda f\xEDsica."
    },
    {
      q: "\xBFC\xF3mo evitar ofertas enga\xF1osas o precios inflados antes del Black Friday?",
      a: "Compara siempre antes de comprar. En Mercado Lista puedes contrastar el precio en vivo entre m\xFAltiples tiendas competidoras para verificar si una rebaja es real o si otro comercio tiene el mismo producto a un valor m\xE1s econ\xF3mico sin necesidad de promociones infladas."
    }
  ];
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "SaleEvent",
    name: "Black Friday Colombia 2026",
    alternateName: "Black Week Colombia 2026",
    description: "Semana oficial de ofertas y descuentos de Black Friday 2026 en Colombia del 27 de noviembre al 4 de diciembre. Compara precios en tiempo real entre \xC9xito, Falabella, Alkosto, Ktronix, Jumbo, Carulla, D1, Amazon y m\xE1s comercios online.",
    startDate: "2026-11-27T00:00:00-05:00",
    endDate: "2026-12-04T23:59:59-05:00",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: {
      "@type": "VirtualLocation",
      url: CANONICAL
    },
    organizer: {
      "@type": "Organization",
      name: "Mercado Lista",
      url: BASE,
      logo: `${BASE}/logo.png`
    },
    offers: {
      "@type": "AggregateOffer",
      url: CANONICAL,
      priceCurrency: "COP",
      lowPrice: "1000",
      highPrice: "20000000",
      offerCount: "250000"
    }
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a
      }
    }))
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: BASE },
      { "@type": "ListItem", position: 2, name: "Especiales", item: `${BASE}/page/black-friday` },
      { "@type": "ListItem", position: 3, name: "Black Friday 2026 Colombia", item: CANONICAL }
    ]
  };
  return renderTemplate(_a || (_a = __template(['<html lang="es" data-astro-cid-qetyv5ws> <head>', '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Black Friday Colombia 2026 \xB7 Ofertas, Fechas y Comparador de Precios en Vivo</title><meta name="description" content="Black Friday Colombia 2026 del 27 de noviembre al 4 de diciembre en comercios online. Compara precios en tiempo real entre \xC9xito, Falabella, Alkosto, Ktronix, Jumbo y m\xE1s tiendas."><link rel="canonical"', '><meta name="theme-color" content="#0e6a45"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="manifest" href="/manifest.webmanifest"><!-- Open Graph / Redes Sociales --><meta property="og:type" content="website"><meta property="og:title" content="Black Friday Colombia 2026 \xB7 Comparador de Ofertas en Vivo"><meta property="og:description" content="Compara precios de Black Friday 2026 entre tiendas de Colombia. Encuentra el menor precio en celulares, tecnolog\xEDa, electrohogar y supermercado del 27 nov al 4 dic."><meta property="og:url"', '><meta property="og:site_name" content="Mercado Lista"><!-- Google Fonts --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,640;9..144,700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet"><!-- Structured Data Schemas --><script type="application/ld+json">', '<\/script><script type="application/ld+json">', '<\/script><script type="application/ld+json">', "<\/script>", "", '</head> <body class="bf-page-body" data-astro-cid-qetyv5ws> ', ' <!-- \u2500\u2500 Hero Section Black Friday \u2500\u2500 --> <header class="bf-hero" aria-label="Black Friday Colombia 2026" data-astro-cid-qetyv5ws> <div class="bf-container" data-astro-cid-qetyv5ws> <nav class="bf-breadcrumbs" aria-label="Ruta de navegaci\xF3n" data-astro-cid-qetyv5ws> <a href="/" data-astro-cid-qetyv5ws>Inicio</a> <span aria-hidden="true" data-astro-cid-qetyv5ws>\u203A</span> <span data-astro-cid-qetyv5ws>Especiales</span> <span aria-hidden="true" data-astro-cid-qetyv5ws>\u203A</span> <span aria-current="page" data-astro-cid-qetyv5ws>Black Friday 2026</span> </nav> <div class="bf-hero__badge-wrap" data-astro-cid-qetyv5ws> <span class="bf-hero__badge" data-astro-cid-qetyv5ws> <span class="bf-pulse-dot" aria-hidden="true" data-astro-cid-qetyv5ws></span> <span data-astro-cid-qetyv5ws>27 NOVIEMBRE AL 4 DICIEMBRE \xB7 BLACK WEEK COLOMBIA 2026</span> </span> </div> <h1 class="bf-hero__title" data-astro-cid-qetyv5ws>\nBlack Friday Colombia 2026\n<span class="bf-hero__subtitle-accent" data-astro-cid-qetyv5ws>Comparador de Precios y Ofertas en Tiempo Real</span> </h1> <p class="bf-hero__lead" data-astro-cid-qetyv5ws>\nNo compres a ciegas con descuentos inflados. Compara precios en vivo entre los principales comercios\n          online de Colombia (<strong data-astro-cid-qetyv5ws>\xC9xito, Falabella, Alkosto, Ktronix, Jumbo, Carulla, D1, Amazon</strong>)\n          y descubre cu\xE1l tienda tiene realmente la mejor oferta.\n</p> <!-- Buscador integrado en Hero para buscar ofertas al instante --> <div class="bf-search-box" data-astro-cid-qetyv5ws> <form class="bf-search-form" action="/search/" method="get" role="search" data-astro-cid-qetyv5ws> <div class="bf-search-input-wrap" data-astro-cid-qetyv5ws> <span class="bf-search-icon" aria-hidden="true" data-astro-cid-qetyv5ws>\u{1F50D}</span> <input type="search" name="query" id="bf-search-q" class="bf-search-input" placeholder="\xBFQu\xE9 oferta buscas hoy? Ej. iPhone 15, Smart TV 55, Freidora de aire, Tenis..." required minlength="2" autocomplete="off" aria-label="Buscar producto en oferta de Black Friday" data-astro-cid-qetyv5ws> </div> <button type="submit" class="bf-search-btn" data-astro-cid-qetyv5ws> <span data-astro-cid-qetyv5ws>Comparar Precios</span> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-astro-cid-qetyv5ws> <line x1="5" y1="12" x2="19" y2="12" data-astro-cid-qetyv5ws></line> <polyline points="12 5 19 12 12 19" data-astro-cid-qetyv5ws></polyline> </svg> </button> </form> <!-- B\xFAsquedas calientes directas --> <div class="bf-quick-tags" aria-label="B\xFAsquedas destacadas de Black Friday" data-astro-cid-qetyv5ws> <span class="bf-quick-tag-label" data-astro-cid-qetyv5ws>Tendencias:</span> <a href="/search/?query=celular+smartphone" class="bf-tag" data-astro-cid-qetyv5ws>\u{1F4F1} Celulares 5G</a> <a href="/search/?query=televisor+smart+tv" class="bf-tag" data-astro-cid-qetyv5ws>\u{1F4FA} Smart TV 4K</a> <a href="/search/?query=computador+portatil" class="bf-tag" data-astro-cid-qetyv5ws>\u{1F4BB} Port\xE1tiles</a> <a href="/search/?query=freidora+de+aire" class="bf-tag" data-astro-cid-qetyv5ws>\u{1F373} Freidoras de Aire</a> <a href="/search/?query=audifonos+bluetooth" class="bf-tag" data-astro-cid-qetyv5ws>\u{1F3A7} Aud\xEDfonos</a> <a href="/search/?query=playstation+5" class="bf-tag" data-astro-cid-qetyv5ws>\u{1F3AE} PS5 / Gaming</a> <a href="/search/?query=tenis+deportivos" class="bf-tag" data-astro-cid-qetyv5ws>\u{1F45F} Tenis</a> </div> </div> <!-- Banner de fechas y garant\xEDa --> <div class="bf-dates-bar" data-astro-cid-qetyv5ws> <div class="bf-date-item" data-astro-cid-qetyv5ws> <span class="bf-date-num" data-astro-cid-qetyv5ws>27</span> <span class="bf-date-label" data-astro-cid-qetyv5ws>Noviembre (Inicio)</span> </div> <div class="bf-date-arrow" aria-hidden="true" data-astro-cid-qetyv5ws>\u2794</div> <div class="bf-date-item" data-astro-cid-qetyv5ws> <span class="bf-date-num" data-astro-cid-qetyv5ws>04</span> <span class="bf-date-label" data-astro-cid-qetyv5ws>Diciembre (Cierre)</span> </div> <div class="bf-date-info" data-astro-cid-qetyv5ws> <strong data-astro-cid-qetyv5ws>8 D\xEDas de Ofertas Continuas</strong> <span data-astro-cid-qetyv5ws>V\xE1lido en todo el comercio online de Colombia</span> </div> </div> </div> </header> <main class="bf-main-content" data-astro-cid-qetyv5ws> <!-- \u2500\u2500 Carrusel de Categor\xEDas Retail \u2500\u2500 --> <section class="bf-section bf-categories-section" data-astro-cid-qetyv5ws> <div class="bf-container" data-astro-cid-qetyv5ws> ', ' </div> </section> <!-- \u2500\u2500 Directorio de Comercios Participantes \u2500\u2500 --> <section class="bf-section bf-stores-section" id="tiendas-participantes" aria-label="Comercios participantes en Black Friday" data-astro-cid-qetyv5ws> <div class="bf-container" data-astro-cid-qetyv5ws> <div class="bf-section-header" data-astro-cid-qetyv5ws> <span class="bf-pill-tag" data-astro-cid-qetyv5ws>COMERCIOS OFICIALES EN COLOMBIA</span> <h2 class="bf-section-title" data-astro-cid-qetyv5ws>Principales Tiendas Online con Ofertas de Black Friday</h2> <p class="bf-section-desc" data-astro-cid-qetyv5ws>\nCompara precios en tiempo real entre las cadenas l\xEDderes de retail y supermercados del pa\xEDs.\n              Haz clic en cada tienda para comparar sus productos o ir directamente a su web oficial.\n</p> </div> <div class="bf-stores-grid" data-astro-cid-qetyv5ws> ', ' </div> </div> </section> <!-- \u2500\u2500 Consejos para Ahorrar en Black Friday \u2500\u2500 --> <section class="bf-section bf-tips-section" aria-label="Consejos de compra inteligente" data-astro-cid-qetyv5ws> <div class="bf-container" data-astro-cid-qetyv5ws> <div class="bf-section-header" data-astro-cid-qetyv5ws> <span class="bf-pill-tag" data-astro-cid-qetyv5ws>COMPRA INTELIGENTE</span> <h2 class="bf-section-title" data-astro-cid-qetyv5ws>4 Claves para Ahorrar de Verdad en el Black Friday 2026</h2> <p class="bf-section-desc" data-astro-cid-qetyv5ws>Estrategias pr\xE1cticas para aprovechar los descuentos sin caer en ofertas ficticias.</p> </div> <div class="bf-tips-grid" data-astro-cid-qetyv5ws> <div class="bf-tip-card" data-astro-cid-qetyv5ws> <span class="bf-tip-icon" aria-hidden="true" data-astro-cid-qetyv5ws>\u2696\uFE0F</span> <h3 data-astro-cid-qetyv5ws>1. Compara entre tiendas antes de pagar</h3> <p data-astro-cid-qetyv5ws>\nMuchos comercios lanzan el mismo televisor o celular con nombres ligeramente distintos.\n                Mercado Lista unifica los cat\xE1logos de Falabella, \xC9xito, Alkosto y Jumbo para mostrarte cu\xE1l tiene el menor valor final.\n</p> </div> <div class="bf-tip-card" data-astro-cid-qetyv5ws> <span class="bf-tip-icon" aria-hidden="true" data-astro-cid-qetyv5ws>\u{1F4B3}</span> <h3 data-astro-cid-qetyv5ws>2. Revisa descuentos con tarjetas aliadas</h3> <p data-astro-cid-qetyv5ws>\nTiendas como Falabella (CMR), \xC9xito (Tuya), Jumbo (Cencosud) y Ol\xEDmpica (Tarjeta Plata) suelen aplicar rebajas\n                adicionales del 10% al 25% sobre el precio de lista. Verifica siempre las condiciones de financiaci\xF3n.\n</p> </div> <div class="bf-tip-card" data-astro-cid-qetyv5ws> <span class="bf-tip-icon" aria-hidden="true" data-astro-cid-qetyv5ws>\u{1F4E6}</span> <h3 data-astro-cid-qetyv5ws>3. Ten en cuenta los costos de env\xEDo</h3> <p data-astro-cid-qetyv5ws>\nUna oferta barata puede perder su ventaja si el flete a tu ciudad es elevado. Comercios como Alkosto incluyen\n                env\xEDo gratis nacional en tecnolog\xEDa, y Amazon ofrece despacho sin costo a Colombia a partir de compras de USD $35.\n</p> </div> <div class="bf-tip-card" data-astro-cid-qetyv5ws> <span class="bf-tip-icon" aria-hidden="true" data-astro-cid-qetyv5ws>\u{1F50D}</span> <h3 data-astro-cid-qetyv5ws>4. Revisa el valor por unidad o gramo</h3> <p data-astro-cid-qetyv5ws>\nEn productos de supermercado, aseo y despensa familiar, compara siempre el costo por mililitro o por gramo\n                para cerciorarte de que la presentaci\xF3n grande en promoci\xF3n sea verdaderamente m\xE1s econ\xF3mica que el empaque regular.\n</p> </div> </div> </div> </section> <!-- \u2500\u2500 Preguntas Frecuentes (FAQ) \u2500\u2500 --> <section class="bf-section bf-faq-section" id="preguntas-frecuentes" aria-label="Preguntas frecuentes sobre Black Friday" data-astro-cid-qetyv5ws> <div class="bf-container bf-container--narrow" data-astro-cid-qetyv5ws> <div class="bf-section-header" data-astro-cid-qetyv5ws> <span class="bf-pill-tag" data-astro-cid-qetyv5ws>RESUELVE TUS DUDAS</span> <h2 class="bf-section-title" data-astro-cid-qetyv5ws>Preguntas Frecuentes sobre el Black Friday Colombia 2026</h2> <p class="bf-section-desc" data-astro-cid-qetyv5ws>Todo lo que necesitas saber sobre las fechas, tiendas participantes y c\xF3mo comparar precios.</p> </div> <div class="bf-faq-accordion" role="region" aria-label="Acorde\xF3n de preguntas frecuentes" data-astro-cid-qetyv5ws> ', ' </div> </div> </section> <!-- \u2500\u2500 CTA Final de B\xFAsqueda \u2500\u2500 --> <section class="bf-section bf-cta-section" data-astro-cid-qetyv5ws> <div class="bf-container" data-astro-cid-qetyv5ws> <div class="bf-cta-card" data-astro-cid-qetyv5ws> <h2 data-astro-cid-qetyv5ws>\xBFListo para encontrar la mejor oferta de Black Friday?</h2> <p data-astro-cid-qetyv5ws>Escribe el producto que buscas y cotiza al instante en todos los almacenes de Colombia.</p> <a href="/" class="bf-btn-cta" data-astro-cid-qetyv5ws>Ir al Comparador Principal</a> </div> </div> </section> </main> <!-- Footer --> <footer class="site-footer" data-astro-cid-qetyv5ws> <div class="bf-container" data-astro-cid-qetyv5ws> <p data-astro-cid-qetyv5ws>\xA9 ', ' Mercado Lista \xB7 Comparador de precios independiente en tiempo real para Colombia.</p> <p class="footer-meta" data-astro-cid-qetyv5ws>\nBlack Friday Colombia 2026: Del 27 de noviembre al 4 de diciembre de 2026. Precios consultados de fuentes p\xFAblicas oficiales.\n</p> </div> </footer> ', " ", "  </body> </html>"])), renderComponent($$result, "GoogleAnalytics", $$GoogleAnalytics, { "data-astro-cid-qetyv5ws": true }), addAttribute(CANONICAL, "href"), addAttribute(CANONICAL, "content"), unescapeHTML(JSON.stringify(eventSchema)), unescapeHTML(JSON.stringify(faqSchema)), unescapeHTML(JSON.stringify(breadcrumbSchema)), renderComponent($$result, "GoogleAdSense", $$GoogleAdSense, { "data-astro-cid-qetyv5ws": true }), renderHead(), renderComponent($$result, "Nav", $$Nav, { "data-astro-cid-qetyv5ws": true }), renderComponent($$result, "CategoryBanner", $$CategoryBanner, { "data-astro-cid-qetyv5ws": true }), RETAILER_STORES.map((store) => renderTemplate`<article class="bf-store-card"${addAttribute(`--store-brand: ${store.color}`, "style")} data-astro-cid-qetyv5ws> <div class="bf-store-card__header" data-astro-cid-qetyv5ws> <div class="bf-store-card__badge-logo"${addAttribute(`background-color: ${store.color}; color: ${store.textColor}`, "style")} data-astro-cid-qetyv5ws> <strong data-astro-cid-qetyv5ws>${store.name}</strong> </div> <span class="bf-store-card__kind" data-astro-cid-qetyv5ws>${store.badge}</span> </div> <p class="bf-store-card__desc" data-astro-cid-qetyv5ws>${store.description}</p> <div class="bf-store-card__tags" data-astro-cid-qetyv5ws> ${store.tags.map((tag) => renderTemplate`<span class="bf-store-tag" data-astro-cid-qetyv5ws>${tag}</span>`)} </div> <div class="bf-store-card__actions" data-astro-cid-qetyv5ws> <a${addAttribute(`/search/?query=${encodeURIComponent(store.searchQuery)}`, "href")} class="bf-btn-compare"${addAttribute(`Comparar ofertas de ${store.name}`, "title")} data-astro-cid-qetyv5ws> <span data-astro-cid-qetyv5ws>Comparar en vivo</span> <span aria-hidden="true" data-astro-cid-qetyv5ws>→</span> </a> <a${addAttribute(store.siteUrl, "href")} target="_blank" rel="noopener noreferrer" class="bf-btn-store"${addAttribute(`Ir al sitio web oficial de ${store.name}`, "title")} data-astro-cid-qetyv5ws> <span data-astro-cid-qetyv5ws>Visitar tienda</span> <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-astro-cid-qetyv5ws> <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" data-astro-cid-qetyv5ws></path> <polyline points="15 3 21 3 21 9" data-astro-cid-qetyv5ws></polyline> <line x1="10" y1="14" x2="21" y2="3" data-astro-cid-qetyv5ws></line> </svg> </a> </div> </article>`), FAQS.map((faq, index) => renderTemplate`<details class="bf-faq-item"${addAttribute(index === 0, "open")} data-astro-cid-qetyv5ws> <summary class="bf-faq-question" data-astro-cid-qetyv5ws> <span data-astro-cid-qetyv5ws>${faq.q}</span> <svg class="bf-faq-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-astro-cid-qetyv5ws> <polyline points="6 9 12 15 18 9" data-astro-cid-qetyv5ws></polyline> </svg> </summary> <div class="bf-faq-answer" data-astro-cid-qetyv5ws> <p data-astro-cid-qetyv5ws>${faq.a}</p> </div> </details>`), (/* @__PURE__ */ new Date()).getFullYear(), renderComponent($$result, "CookieBanner", $$CookieBanner, { "data-astro-cid-qetyv5ws": true }), renderComponent($$result, "AssistantChatWidget", $$AssistantChatWidget, { "data-astro-cid-qetyv5ws": true }));
}, "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/page/black-friday.astro", void 0);

const $$file = "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/page/black-friday.astro";
const $$url = "/page/black-friday";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$BlackFriday,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
