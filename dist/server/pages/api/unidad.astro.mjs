import { C as CATEGORIES } from '../../chunks/catalog_CZ10BYui.mjs';
import { f as findCity } from '../../chunks/cities_DyPidRWt.mjs';
import { s as searchStores } from '../../chunks/index_BmvhlEI_.mjs';
import { b as buildUnitReport } from '../../chunks/units_BSa3DAKQ.mjs';
import { c as checkRateLimit, r as rateLimitResponse } from '../../chunks/rateLimit_BX5-YUpX.mjs';
export { renderers } from '../../renderers.mjs';

const UNIT_OPTIONS = /* @__PURE__ */ new Set(["todas", "gramos", "mililitros", "unidades"]);
const CATEGORY_OPTIONS = /* @__PURE__ */ new Set(["todas", ...CATEGORIES.map((category) => category.id)]);
const GET = async ({ request, url }) => {
  const limit = checkRateLimit(request, {
    prefix: "api-unidad",
    windowMs: 6e4,
    max: 30
  });
  if (!limit.allowed) {
    return rateLimitResponse(limit);
  }
  const q = url.searchParams.get("q") || "";
  const ciudadParam = url.searchParams.get("ciudad") || "bogota";
  const unidad = url.searchParams.get("unidad") || "todas";
  const categoria = url.searchParams.get("categoria") || "todas";
  const minimoRaw = (url.searchParams.get("minimo") || "").trim().replace(",", ".");
  const query = q.trim().replace(/\s+/g, " ");
  let minimo = null;
  if (minimoRaw) {
    minimo = Number(minimoRaw);
    if (!Number.isFinite(minimo) || minimo <= 0 || minimo > 1e6) {
      return new Response(
        JSON.stringify({ detail: "La cantidad mínima debe ser un número mayor que cero" }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  }
  if (!UNIT_OPTIONS.has(unidad) || !CATEGORY_OPTIONS.has(categoria)) {
    return new Response(
      JSON.stringify({ detail: "Unidad o categoría no válida" }),
      {
        status: 422,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
  if (query.length < 2) {
    return new Response(
      JSON.stringify({ detail: "Escribe al menos 2 caracteres" }),
      {
        status: 422,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
  try {
    const city = findCity(ciudadParam);
    const outcomes = await searchStores(query, city);
    const filters = {
      basis: unidad,
      categoryId: categoria,
      minQuantity: unidad === "todas" ? null : minimo
    };
    const report = buildUnitReport(query, outcomes, filters);
    report.city = { id: city.id, name: city.name };
    return new Response(JSON.stringify(report), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ detail: err.message || "Error al buscar por unidad" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
