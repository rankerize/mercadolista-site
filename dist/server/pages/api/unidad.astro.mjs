import { f as findCity } from '../../chunks/cities_DyPidRWt.mjs';
import { s as searchStores } from '../../chunks/index_qWqYRXjv.mjs';
import { b as buildUnitReport } from '../../chunks/units_Cl9q3VkI.mjs';
import { c as checkRateLimit, r as rateLimitResponse } from '../../chunks/rateLimit_BX5-YUpX.mjs';
export { renderers } from '../../renderers.mjs';

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
  const query = q.trim().replace(/\s+/g, " ");
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
    const report = buildUnitReport(query, outcomes);
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
