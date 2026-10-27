import { e as createAstro, f as createComponent, k as renderComponent, h as addAttribute, l as renderHead, r as renderTemplate } from '../chunks/astro/server_zl8i4EZZ.mjs';
import 'piccolore';
/* empty css                                     */
import { s as searchStores } from '../chunks/index_BmvhlEI_.mjs';
import { b as buildReport } from '../chunks/ranking_Db_3a0qS.mjs';
import { f as findCity } from '../chunks/cities_DyPidRWt.mjs';
import { $ as $$Nav } from '../chunks/Nav_kzfrG_m0.mjs';
import { $ as $$AddToListModal } from '../chunks/AddToListModal_BrWp5P3E.mjs';
import { $ as $$GoogleAnalytics, a as $$GoogleAdSense } from '../chunks/GoogleAdSense_Bc90ZQI7.mjs';
import { $ as $$PlpView } from '../chunks/PlpView_Wk6qOAxo.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://mercadolista.com");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const BASE = "https://mercadolista.com";
  const rawQuery = Astro2.url.searchParams.get("query") ?? Astro2.url.searchParams.get("q") ?? "";
  const query = rawQuery.trim().replace(/\s+/g, " ");
  if (query.length < 2) {
    return Astro2.redirect("/", 302);
  }
  const city = findCity(Astro2.url.searchParams.get("ciudad") || "bogota");
  let report = null;
  try {
    const searchPromise = searchStores(query, city);
    const timeoutPromise = new Promise(
      (_, reject) => setTimeout(() => reject(new Error("SSR timeout")), 4e3)
    );
    const outcomes = await Promise.race([searchPromise, timeoutPromise]);
    report = buildReport(query, outcomes);
  } catch {
  }
  const verdict = report?.verdict ?? null;
  const offers = [...report?.offers ?? []].sort((a, b) => (a.price || 0) - (b.price || 0));
  const searchUrl = `${BASE}/search/?query=${encodeURIComponent(query)}`;
  const crumbs = [
    { name: "Inicio", item: BASE },
    { name: "B\xFAsqueda", item: `${BASE}/search/` },
    { name: query, item: searchUrl }
  ];
  return renderTemplate`<html lang="es" data-astro-cid-sqekdmok> <head>${renderComponent($$result, "GoogleAnalytics", $$GoogleAnalytics, { "data-astro-cid-sqekdmok": true })}${renderComponent($$result, "GoogleAdSense", $$GoogleAdSense, { "data-astro-cid-sqekdmok": true })}<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${`Precios de "${query}" en Colombia hoy \xB7 Mercado Lista`}</title><meta name="description"${addAttribute(`Compara precios de ${query} en Falabella, \xC9xito, Alkosto, D1, Jumbo y m\xE1s tiendas de Colombia.`, "content")}><meta name="robots" content="noindex,follow"><meta name="theme-color" content="#0e6a45"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="manifest" href="/manifest.webmanifest"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,640&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">${renderHead()}</head> <body data-astro-cid-sqekdmok> ${renderComponent($$result, "Nav", $$Nav, { "data-astro-cid-sqekdmok": true })} ${renderComponent($$result, "PlpView", $$PlpView, { "h1": `Resultados para "${query}"`, "nombre": query, "query": query, "city": city, "crumbs": crumbs, "offers": offers, "verdict": verdict, "data-astro-cid-sqekdmok": true })} ${renderComponent($$result, "AddToListModal", $$AddToListModal, { "data-astro-cid-sqekdmok": true })} <footer class="site-footer" data-astro-cid-sqekdmok> <p data-astro-cid-sqekdmok>© ${(/* @__PURE__ */ new Date()).getFullYear()} Mercado Lista · Comparador de precios en tiempo real para Colombia</p> </footer>  </body> </html>`;
}, "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/search/index.astro", void 0);

const $$file = "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/search/index.astro";
const $$url = "/search";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
