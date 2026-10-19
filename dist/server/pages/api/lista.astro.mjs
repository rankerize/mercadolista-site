import { f as findCity } from '../../chunks/cities_Bh7Qi1an.mjs';
import { r as requiredMatchRatio, a as relevance, c as cop, b as copExact } from '../../chunks/normalize_BklFQcMY.mjs';
import { d as dedupe } from '../../chunks/ranking_5o1QqFy4.mjs';
import { s as searchStores } from '../../chunks/index_qWqYRXjv.mjs';
import { m as measureOffer, q as quantityText } from '../../chunks/units_Cl9q3VkI.mjs';
import { c as checkRateLimit, r as rateLimitResponse } from '../../chunks/rateLimit_BX5-YUpX.mjs';
export { renderers } from '../../renderers.mjs';

const FORMAT_BASIS = {
  gramos: "gramo",
  mililitros: "mililitro",
  unidades: "unidad"
};
const QUERY_UNIT = {
  gramos: "g",
  mililitros: "ml",
  unidades: ""
};
const ANY_BRAND = "TODAS";
const PARALLEL_ITEMS = 2;
const OPTIONS_LIMIT = 4;
const SIZE_TOLERANCE = 5e-3;
function makeItem(name, brand, format, quantity) {
  const cleanBrand = brand.trim();
  const validBrand = !cleanBrand || cleanBrand.toUpperCase() === ANY_BRAND ? null : cleanBrand;
  return {
    name: name.trim().replace(/\s+/g, " "),
    brand: validBrand,
    format,
    quantity: Number(quantity)
  };
}
function itemBasis(item) {
  return FORMAT_BASIS[item.format] || "unidad";
}
function itemQuery(item) {
  return item.brand ? `${item.name} ${item.brand}` : item.name;
}
function itemSizedQuery(item) {
  const amount = Number.isInteger(item.quantity) ? item.quantity.toString() : item.quantity.toString();
  const suffix = QUERY_UNIT[item.format] || "";
  return `${itemQuery(item)} ${amount} ${suffix}`.trim();
}
function itemLabel(item) {
  const brand = item.brand || "todas las marcas";
  return `${item.name} · ${brand} · ${quantityText(item.quantity, itemBasis(item))}`;
}
function brandMatches(item, offer) {
  if (!item.brand) return true;
  return relevance(item.brand, offer.name, offer.brand) >= 1;
}
function getCandidates(item, offers) {
  const collected = dedupe(offers).filter((offer) => brandMatches(item, offer));
  const threshold = requiredMatchRatio(item.name);
  const scored = collected.map((offer) => ({
    offer,
    score: relevance(item.name, offer.name, offer.brand)
  }));
  let strict = scored.filter((p) => p.score + 1e-9 >= threshold);
  if (strict.length === 0) {
    strict = scored.filter((p) => p.score >= 0.5);
  }
  const basis = itemBasis(item);
  const candidates = [];
  for (const { offer } of strict) {
    const measure = measureOffer(offer);
    if (!measure || measure.basis !== basis) continue;
    const packQuantity = measure.quantity;
    if (Math.abs(packQuantity - item.quantity) > item.quantity * SIZE_TOLERANCE) {
      continue;
    }
    const packPrice = measure.compared_price;
    candidates.push({
      store_id: offer.store_id,
      store_name: offer.store_name,
      name: offer.name,
      brand: offer.brand,
      url: offer.url,
      image: offer.image,
      pack_price: packPrice,
      shelf_price: offer.price,
      from_card: Boolean(measure.from_card),
      payment_label: measure.from_card ? offer.payment_label : null,
      pack_quantity_label: quantityText(packQuantity, basis),
      unit_price: measure.amount,
      unit_label: measure.per,
      total: Number(packPrice.toFixed(2))
    });
  }
  candidates.sort((a, b) => {
    if (a.total !== b.total) return a.total - b.total;
    return a.unit_price - b.unit_price;
  });
  return candidates;
}
function itemDetail(item, winner) {
  const basis = itemBasis(item);
  const each = basis === "unidad" ? "cada una" : `el ${winner.unit_label}`;
  let text = `Empaque de ${winner.pack_quantity_label} a ${cop(winner.pack_price)}. Sale a ${copExact(winner.unit_price)} ${each}.`;
  if (winner.from_card) {
    text += ` Precio con ${winner.payment_label}; el precio normal del empaque es ${cop(winner.shelf_price)}.`;
  }
  return text;
}
function buildListReport(items, outcomesByItem, city) {
  const rows = [];
  const storeNames = /* @__PURE__ */ new Map();
  const storeTotals = /* @__PURE__ */ new Map();
  const storeFound = /* @__PURE__ */ new Map();
  const storeErrors = /* @__PURE__ */ new Map();
  const storeHits = /* @__PURE__ */ new Map();
  let total = 0;
  const missing = [];
  items.forEach((item, index) => {
    const outcomes = outcomesByItem[index] || [];
    for (const outcome of outcomes) {
      if (!storeNames.has(outcome.store_id)) storeNames.set(outcome.store_id, outcome.store_name);
      if (!storeHits.has(outcome.store_id)) storeHits.set(outcome.store_id, 0);
      if (outcome.error) {
        if (!storeErrors.has(outcome.store_id)) storeErrors.set(outcome.store_id, outcome.error);
      } else if (outcome.offers.length > 0) {
        storeHits.set(outcome.store_id, (storeHits.get(outcome.store_id) || 0) + 1);
      }
    }
    const allOffers = outcomes.flatMap((o) => o.offers);
    const candidates = getCandidates(item, allOffers);
    const bestByStore = /* @__PURE__ */ new Map();
    for (const option of candidates) {
      if (!bestByStore.has(option.store_id)) {
        bestByStore.set(option.store_id, option);
      }
    }
    for (const [storeId, option] of bestByStore.entries()) {
      storeTotals.set(storeId, (storeTotals.get(storeId) || 0) + option.total);
      if (!storeFound.has(storeId)) storeFound.set(storeId, /* @__PURE__ */ new Set());
      storeFound.get(storeId).add(index);
    }
    const winner = candidates.length > 0 ? candidates[0] : null;
    if (winner) {
      total += winner.total;
    } else {
      missing.push(item.name);
    }
    rows.push({
      label: itemLabel(item),
      name: item.name,
      brand: item.brand || ANY_BRAND,
      format: item.format,
      quantity: item.quantity,
      winner,
      detail: winner ? itemDetail(item, winner) : null,
      options: candidates.slice(1, 1 + OPTIONS_LIMIT)
    });
  });
  const singleStore = [];
  for (const [storeId, name] of storeNames.entries()) {
    const found = storeFound.get(storeId) || /* @__PURE__ */ new Set();
    const lacking = items.map((item, idx) => found.has(idx) ? null : item.name).filter((n) => n !== null);
    singleStore.push({
      store_id: storeId,
      store_name: name,
      total: found.size > 0 ? Number((storeTotals.get(storeId) || 0).toFixed(2)) : null,
      missing: lacking
    });
  }
  singleStore.sort((a, b) => {
    if (a.missing.length !== b.missing.length) {
      return a.missing.length - b.missing.length;
    }
    const valA = a.total !== null ? a.total : Infinity;
    const valB = b.total !== null ? b.total : Infinity;
    return valA - valB;
  });
  const foundCount = items.length - missing.length;
  const complete = singleStore.filter((row) => row.missing.length === 0);
  const bestSingle = complete.length > 0 ? complete[0] : null;
  return {
    city: { id: city.id, name: city.name },
    total: Number(total.toFixed(2)),
    found: foundCount,
    count: items.length,
    missing,
    items: rows,
    best_single_store: bestSingle,
    single_store: singleStore,
    stores: Array.from(storeNames.entries()).map(([storeId, name]) => ({
      id: storeId,
      name,
      count: storeHits.get(storeId) || 0,
      error: (storeHits.get(storeId) || 0) === 0 ? storeErrors.get(storeId) || null : null
    }))
  };
}
function mergeOutcomes(first, second) {
  const byStore = /* @__PURE__ */ new Map();
  for (const outcome of second) {
    byStore.set(outcome.store_id, outcome);
  }
  const merged = [];
  for (const outcome of first) {
    const other = byStore.get(outcome.store_id);
    if (!other) {
      merged.push(outcome);
      continue;
    }
    byStore.delete(outcome.store_id);
    const combinedOffers = dedupe([...outcome.offers, ...other.offers]);
    const error = combinedOffers.length > 0 ? void 0 : outcome.error || other.error;
    merged.push({
      ...outcome,
      offers: combinedOffers,
      error
    });
  }
  for (const leftover of byStore.values()) {
    merged.push(leftover);
  }
  return merged;
}
async function searchList(items, city) {
  const results = new Array(items.length);
  let currentIndex = 0;
  async function worker() {
    while (currentIndex < items.length) {
      const idx = currentIndex++;
      const item = items[idx];
      const [plain, sized] = await Promise.all([
        searchStores(itemQuery(item), city),
        searchStores(itemSizedQuery(item), city)
      ]);
      results[idx] = mergeOutcomes(plain, sized);
    }
  }
  const workers = Array.from({ length: Math.min(PARALLEL_ITEMS, items.length) }, () => worker());
  await Promise.all(workers);
  return buildListReport(items, results, city);
}

const POST = async ({ request }) => {
  const limit = checkRateLimit(request, {
    prefix: "api-lista",
    windowMs: 6e4,
    max: 10
  });
  if (!limit.allowed) {
    return rateLimitResponse(limit);
  }
  try {
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 5e4) {
      return new Response(
        JSON.stringify({ detail: "La solicitud excede el tamaño máximo permitido" }),
        { status: 413, headers: { "Content-Type": "application/json" } }
      );
    }
    const body = await request.json();
    const ciudadParam = body.ciudad || "bogota";
    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0 || rawItems.length > 15) {
      return new Response(
        JSON.stringify({ detail: "La lista debe contener entre 1 y 15 productos" }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }
    const items = [];
    for (const row of rawItems) {
      const nombre = (row.nombre || "").trim();
      if (nombre.length < 2) {
        return new Response(
          JSON.stringify({ detail: "Cada producto necesita un nombre de al menos 2 caracteres" }),
          { status: 422, headers: { "Content-Type": "application/json" } }
        );
      }
      const formato = row.formato || "unidades";
      if (!["gramos", "mililitros", "unidades"].includes(formato)) {
        return new Response(
          JSON.stringify({ detail: `Formato inválido: ${formato}` }),
          { status: 422, headers: { "Content-Type": "application/json" } }
        );
      }
      const cantidad = Number(row.cantidad);
      if (isNaN(cantidad) || cantidad <= 0 || cantidad > 1e6) {
        return new Response(
          JSON.stringify({ detail: "Cantidad inválida" }),
          { status: 422, headers: { "Content-Type": "application/json" } }
        );
      }
      items.push(makeItem(nombre, row.marca || "TODAS", formato, cantidad));
    }
    const city = findCity(ciudadParam);
    const report = await searchList(items, city);
    return new Response(JSON.stringify(report), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ detail: err.message || "Error al procesar la lista" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
