import { r as requiredMatchRatio, a as relevance, s as stripAccents, b as cop } from '../../chunks/normalize_DA1X8QDr.mjs';
import { c as checkRateLimit, r as rateLimitResponse } from '../../chunks/rateLimit_BX5-YUpX.mjs';
export { renderers } from '../../renderers.mjs';

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const ALI_COOKIE = "aep_usuc_f=site=col&c_tp=COP&region=CO&b_locale=es_ES";
const CONDITIONAL_SHIPPING = /Entrega GRATIS.*?Colombia.*?COP\s*([0-9][0-9.,]*)\)?\s*de art/is;
const PAID_SHIPPING = /Entrega por COP\s*([0-9][0-9.,]*)/i;
const FREE_SHIPPING = /Entrega GRATIS.*?Colombia/is;
const BLOCKED_SHIPPING = /no se puede enviar|no env[ií]a a colombia|cannot be shipped/i;
function stripHtml(fragment) {
  return fragment.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function parseMarketAmount(raw) {
  let cleaned = raw.replace(/COP/g, "").replace(/US\$/g, "").replace(/\$/g, "").replace(/\s/g, "");
  if (!cleaned) return null;
  if (cleaned.includes(",") && cleaned.includes(".")) {
    if (cleaned.lastIndexOf(".") > cleaned.lastIndexOf(",")) {
      cleaned = cleaned.replace(/,/g, "");
    } else {
      cleaned = cleaned.replace(/\./g, "").replace(/,/g, ".");
    }
  } else if (cleaned.includes(",")) {
    const parts = cleaned.split(",");
    cleaned = parts[parts.length - 1].length === 3 ? cleaned.replace(/,/g, "") : cleaned.replace(/,/g, ".");
  }
  const amount = Number(cleaned);
  return isNaN(amount) || amount <= 0 ? null : amount;
}
function amazonShipping(cardText, price) {
  if (BLOCKED_SHIPPING.test(cardText)) {
    return [false, null, "No envía a Colombia"];
  }
  const conditional = CONDITIONAL_SHIPPING.exec(cardText);
  if (conditional) {
    const threshold = parseMarketAmount(conditional[1]);
    if (threshold && price + 0.5 >= threshold) {
      return [true, 0, `Envío gratis: el producto supera el mínimo de ${cop(threshold)}`];
    }
    if (threshold) {
      return [true, null, `Envío gratis solo desde ${cop(threshold)}. El flete de este artículo no está publicado.`];
    }
  }
  const paid = PAID_SHIPPING.exec(cardText);
  if (paid) {
    const amount = parseMarketAmount(paid[1]);
    if (amount !== null) {
      return [true, amount, null];
    }
  }
  if (FREE_SHIPPING.test(cardText)) {
    return [true, 0, null];
  }
  return [null, null, "Amazon no indicó el envío a Colombia en este resultado"];
}
function parseAmazon(html, limit = 16) {
  if (html.slice(0, 8e3).toLowerCase().includes("captcha") && !html.includes('data-asin="')) {
    throw new Error("Amazon no publicó resultados legibles");
  }
  const chunks = html.split(/(?=<div role="listitem" data-asin=")/);
  const offers = [];
  const seen = /* @__PURE__ */ new Set();
  for (const chunk of chunks) {
    const asinMatch = /data-asin="([A-Z0-9]{10})"/.exec(chunk);
    if (!asinMatch || !chunk.slice(0, 800).includes('data-component-type="s-search-result"')) {
      continue;
    }
    const asin = asinMatch[1];
    if (seen.has(asin)) continue;
    const titleMatch = /<h2[^>]*>(.*?)<\/h2>/s.exec(chunk);
    if (!titleMatch) continue;
    const name = stripHtml(titleMatch[1]);
    const priceMatch = /a-offscreen">([^<]*COP[^<]*)<\/span>/.exec(chunk);
    if (!priceMatch || !name) continue;
    const price = parseMarketAmount(priceMatch[1]);
    if (price === null) continue;
    const imgMatch = /class="s-image"[^>]*src="(https:\/\/[^"]+)"/.exec(chunk) || /src="(https:\/\/[^"]+)"[^>]*class="s-image"/.exec(chunk);
    const [ships, shippingCost, note] = amazonShipping(stripHtml(chunk), price);
    seen.add(asin);
    offers.push({
      store_id: "amazon",
      store_name: "Amazon",
      name,
      price,
      url: `https://www.amazon.com/dp/${asin}`,
      image: imgMatch ? imgMatch[1] : null,
      shipping_cost: shippingCost,
      ships_to_colombia: ships,
      shipping_note: note,
      total: shippingCost !== null && ships !== false ? price + shippingCost : null
    });
    if (offers.length >= limit) break;
  }
  return offers;
}
const EBAY_AMOUNT = /COP\s*\$?\s*((?:\d{1,3}(?:[\s\xa0]\d{3})+|\d+)(?:[.,]\d{1,2})?)/i;
const EBAY_PAID = /\+\s*COP\s*\$?\s*((?:\d{1,3}(?:[\s\xa0]\d{3})+|\d+)(?:[.,]\d{1,2})?)\s*por el env/i;
const EBAY_FREE = /env[ií]o internacional gratis/i;
const EBAY_UNSPECIFIED = /env[ií]o no especificado/i;
function ebayAmount(raw) {
  const match = EBAY_AMOUNT.exec(raw.replace(/\xa0/g, " "));
  if (!match) return null;
  const num = match[1].replace(/\s/g, "").replace(/,/g, ".");
  const amount = Number(num);
  return isNaN(amount) || amount <= 0 ? null : amount;
}
function ebayShipping(cardText) {
  const plain = cardText.replace(/\xa0/g, " ");
  if (BLOCKED_SHIPPING.test(plain)) {
    return [false, null, "No envía a Colombia"];
  }
  const paid = EBAY_PAID.exec(plain);
  if (paid) {
    const amount = ebayAmount(`COP ${paid[1]}`);
    if (amount !== null) return [true, amount, null];
  }
  if (EBAY_FREE.test(plain)) {
    return [true, 0, null];
  }
  if (EBAY_UNSPECIFIED.test(plain)) {
    return [true, null, "eBay no especificó el costo de envío a Colombia"];
  }
  return [null, null, "eBay no indicó el envío a Colombia"];
}
function parseEbay(html, limit = 16) {
  const offers = [];
  const seen = /* @__PURE__ */ new Set();
  for (const chunk of html.split(/(?=<li class="s-card )/)) {
    const link = /https:\/\/(?:www\.)?ebay\.com\/itm\/(\d+)/.exec(chunk);
    if (!link) continue;
    const itemId = link[1];
    if (itemId.length < 10 || seen.has(itemId)) continue;
    const title = /class=s-card__title[^>]*>\s*<span[^>]*>(.*?)<\/span>/s.exec(chunk);
    if (!title) continue;
    let name = stripHtml(title[1]).replace(/\s*Se abre en una ventana nueva\s*/g, "").trim();
    if (!name || name.toLowerCase() === "shop on ebay") continue;
    let price = null;
    const priceMatches = [...chunk.matchAll(/s-card__price">([^<]+)/g)];
    for (const pMatch of priceMatches) {
      price = ebayAmount(pMatch[1]);
      if (price !== null) break;
    }
    if (price === null) continue;
    const image = /(?:src|data-defer-load)=(https:\/\/i\.ebayimg\.com\/[^ >]+)/.exec(chunk);
    const [ships, shippingCost, note] = ebayShipping(chunk);
    seen.add(itemId);
    offers.push({
      store_id: "ebay",
      store_name: "eBay",
      name,
      price,
      url: `https://www.ebay.com/itm/${itemId}`,
      image: image ? image[1] : null,
      shipping_cost: shippingCost,
      ships_to_colombia: ships,
      shipping_note: note,
      total: shippingCost !== null && ships !== false ? price + shippingCost : null
    });
    if (offers.length >= limit) break;
  }
  return offers;
}
function jsonArrayAfter(html, marker) {
  const idx = html.indexOf(marker);
  if (idx < 0) throw new Error("AliExpress no publicó resultados legibles");
  const start = html.indexOf("[", idx);
  if (start < 0) throw new Error("AliExpress no publicó resultados legibles");
  let depth = 0;
  for (let i = start; i < html.length; i++) {
    if (html[i] === "[") depth++;
    else if (html[i] === "]") {
      depth--;
      if (depth === 0) {
        return JSON.parse(html.slice(start, i + 1));
      }
    }
  }
  throw new Error("AliExpress no publicó resultados legibles");
}
function parseAliexpress(html, limit = 16) {
  if (html.includes("_____tmd_____")) {
    throw new Error("AliExpress pidió una verificación y no publicó precios");
  }
  const items = jsonArrayAfter(html, '"itemList":{"content":');
  const offers = [];
  for (const item of items) {
    if (typeof item !== "object" || !item || !item.productId) continue;
    const title = String(item.title?.displayTitle || "").trim();
    const rawPrice = item.prices?.salePrice?.minPrice;
    const price = Number(rawPrice);
    if (isNaN(price) || price <= 0 || !title) continue;
    let image = String(item.image?.imgUrl || "");
    if (image.startsWith("//")) image = `https:${image}`;
    const productId = String(item.productId);
    offers.push({
      store_id: "aliexpress",
      store_name: "AliExpress",
      name: title,
      price,
      url: `https://es.aliexpress.com/item/${productId}.html`,
      image: image || null,
      shipping_cost: null,
      ships_to_colombia: true,
      shipping_note: "Precio del producto para Colombia. El flete no viene en el listado.",
      total: null
    });
    if (offers.length >= limit) break;
  }
  return offers;
}
async function searchInternational(query) {
  const fetchAmazon = async () => {
    try {
      const url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: {
          "Accept": "text/html",
          "Accept-Language": "es-CO,es;q=0.9",
          "User-Agent": USER_AGENT
        },
        signal: AbortSignal.timeout(15e3)
      });
      const html = await res.text();
      return { store_id: "amazon", store_name: "Amazon", offers: parseAmazon(html) };
    } catch (err) {
      return { store_id: "amazon", store_name: "Amazon", offers: [], error: err.message };
    }
  };
  const fetchEbay = async () => {
    try {
      const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_fcid=46`;
      const res = await fetch(url, {
        headers: {
          "Accept": "text/html",
          "Accept-Language": "es-CO,es;q=0.9",
          "User-Agent": USER_AGENT
        },
        signal: AbortSignal.timeout(15e3)
      });
      const html = await res.text();
      return { store_id: "ebay", store_name: "eBay", offers: parseEbay(html) };
    } catch (err) {
      return { store_id: "ebay", store_name: "eBay", offers: [], error: err.message };
    }
  };
  const fetchAliexpress = async () => {
    try {
      const slug = stripAccents(query).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "producto";
      const url = `https://www.aliexpress.com/w/wholesale-${slug}.html`;
      const res = await fetch(url, {
        headers: {
          "Accept": "text/html",
          "Accept-Language": "es-CO,es;q=0.9",
          "Cookie": ALI_COOKIE,
          "User-Agent": USER_AGENT
        },
        signal: AbortSignal.timeout(15e3)
      });
      const html = await res.text();
      return { store_id: "aliexpress", store_name: "AliExpress", offers: parseAliexpress(html) };
    } catch (err) {
      return { store_id: "aliexpress", store_name: "AliExpress", offers: [], error: err.message };
    }
  };
  return Promise.all([fetchAmazon(), fetchAliexpress(), fetchEbay()]);
}
function offerPayload(offer, score) {
  return {
    store_id: offer.store_id,
    store_name: offer.store_name,
    name: offer.name,
    price: offer.price,
    shipping_cost: offer.shipping_cost,
    shipping_known: offer.shipping_cost !== null && offer.ships_to_colombia !== false,
    ships_to_colombia: offer.ships_to_colombia,
    shipping_note: offer.shipping_note,
    total: offer.total,
    url: offer.url,
    image: offer.image,
    relevance: Number(score.toFixed(2))
  };
}
function buildVerdict(query, offers) {
  if (offers.length === 0) return null;
  const pool = offers.filter((item) => item[0].ships_to_colombia !== false);
  if (pool.length === 0) return null;
  const known = pool.filter((item) => item[0].total !== null);
  const unknown = pool.filter((item) => item[0].total === null);
  if (known.length > 0) {
    known.sort((a, b) => {
      const totA = a[0].total ?? 0;
      const totB = b[0].total ?? 0;
      return totA === totB ? a[0].price - b[0].price : totA - totB;
    });
    const winner2 = known[0][0];
    const shipping = winner2.shipping_cost || 0;
    const shipText = shipping === 0 ? "envío gratis" : `envío ${cop(shipping)}`;
    let detail = `${winner2.name} cuesta ${cop(winner2.price)} más ${shipText} a Colombia. El costo publicado es ${cop(winner2.total || winner2.price)}.`;
    if (winner2.shipping_note) {
      detail += ` ${winner2.shipping_note}.`;
    }
    const cheaper = unknown.map((i) => i[0]).filter((o) => o.price + 0.5 < (winner2.total || winner2.price));
    if (cheaper.length > 0) {
      cheaper.sort((a, b) => a.price - b.price);
      const other = cheaper[0];
      detail += ` ${other.store_name} muestra ${other.name} a ${cop(other.price)}, pero sin el flete, así que no entra en el costo final.`;
    }
    return {
      store_id: winner2.store_id,
      store_name: winner2.store_name,
      name: winner2.name,
      price: winner2.price,
      shipping_cost: winner2.shipping_cost,
      shipping_known: true,
      total: winner2.total,
      url: winner2.url,
      image: winner2.image,
      kicker: "Menor costo con envío a Colombia",
      headline: `El menor costo a Colombia está en ${winner2.store_name}`,
      detail
    };
  }
  pool.sort((a, b) => a[0].price - b[0].price);
  const winner = pool[0][0];
  return {
    store_id: winner.store_id,
    store_name: winner.store_name,
    name: winner.name,
    price: winner.price,
    shipping_cost: null,
    shipping_known: false,
    total: null,
    url: winner.url,
    image: winner.image,
    kicker: "Menor precio del producto",
    headline: `El menor precio del producto está en ${winner.store_name}`,
    detail: `${winner.name} sale a ${cop(winner.price)}. Ninguna tienda publicó el flete de este resultado, así que falta el costo de transporte a Colombia.`
  };
}
function buildInternationalReport(query, outcomes) {
  const collected = [];
  for (const o of outcomes) {
    collected.push(...o.offers);
  }
  const threshold = requiredMatchRatio(query);
  const scored = collected.map((offer) => [offer, relevance(query, offer.name)]);
  let strict = scored.filter((item) => item[1] + 1e-9 >= threshold);
  let relaxed = false;
  if (strict.length === 0 && scored.length > 0) {
    relaxed = true;
    strict = scored.filter((item) => item[1] >= 0.5);
    if (strict.length === 0) strict = scored;
  }
  strict.sort((a, b) => {
    const aTotalNull = a[0].total === null;
    const bTotalNull = b[0].total === null;
    if (aTotalNull !== bTotalNull) return aTotalNull ? 1 : -1;
    const aCost = a[0].total ?? a[0].price;
    const bCost = b[0].total ?? b[0].price;
    if (aCost !== bCost) return aCost - bCost;
    return a[0].price - b[0].price;
  });
  const sliced = strict.slice(0, 12);
  return {
    query,
    relaxed,
    verdict: buildVerdict(query, sliced),
    offers: sliced.map(([offer, score]) => offerPayload(offer, score)),
    stores: outcomes.map((o) => ({
      id: o.store_id,
      name: o.store_name,
      count: o.offers.length,
      error: o.error || null
    }))
  };
}

const GET = async ({ request, url }) => {
  const limit = checkRateLimit(request, {
    prefix: "api-intl",
    windowMs: 6e4,
    max: 20
  });
  if (!limit.allowed) {
    return rateLimitResponse(limit);
  }
  const q = url.searchParams.get("q") || "";
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
    const outcomes = await searchInternational(query);
    const report = buildInternationalReport(query, outcomes);
    return new Response(JSON.stringify(report), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ detail: err.message || "Error en búsqueda internacional" }),
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
