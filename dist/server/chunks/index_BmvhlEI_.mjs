import { p as parseCop, s as stripAccents, c as cleanEan } from './normalize_DA1X8QDr.mjs';

const STORE_CARD_NAMES = {
  jumbo: "Tarjeta Cencosud",
  easy: "Tarjeta Cencosud",
  exito: "Tarjeta Éxito",
  carulla: "Tarjeta Carulla",
  olimpica: "Tarjeta Olímpica",
  alkosto: "Tarjeta Alkosto",
  ktronix: "Tarjeta Ktronix",
  falabella: "Tarjeta CMR"
};
const TEASER_TOKENS = {
  jumbo: ["tmc", "cencosud"],
  easy: ["tmc", "cencosud"],
  exito: ["tuya", "tarjeta exito", "tarjeta carulla"],
  carulla: ["tuya", "tarjeta exito", "tarjeta carulla"],
  olimpica: ["olimpica"]
};
function backing(data, logical) {
  if (logical in data) return data[logical];
  const tagged = `<${logical}>k__BackingField`;
  if (tagged in data) return data[tagged];
  return void 0;
}
function paymentMatches(storeId, text) {
  const folded = stripAccents(text).toLowerCase();
  if (storeId === "exito") {
    return folded.includes("tarjeta exito") || folded.includes("exito mastercard");
  }
  if (storeId === "carulla") {
    return folded.includes("tarjeta carulla") || folded.includes("carulla mastercard") || folded.includes("tarjeta exito");
  }
  if (storeId === "olimpica") {
    return folded.includes("tarjeta") && folded.includes("olimpica");
  }
  if (storeId === "jumbo" || storeId === "easy") {
    return folded.includes("cencosud");
  }
  return false;
}
function teaserMatches(storeId, name) {
  const folded = stripAccents(name).toLowerCase();
  const hints = TEASER_TOKENS[storeId] || [];
  for (const hint of hints) {
    if (hint.includes(" ")) {
      if (folded.includes(hint)) return true;
      continue;
    }
    const regex = new RegExp(`\\b${hint}\\b`, "i");
    if (regex.test(folded)) return true;
  }
  return false;
}
function discounted(price, percent, nominal) {
  let result = null;
  if (percent && percent > 0) {
    result = price * (1 - percent / 100);
  }
  if (nominal && nominal > 0) {
    const nominalPrice = price - nominal;
    if (result === null || nominalPrice < result) {
      result = nominalPrice;
    }
  }
  if (result === null || result <= 0 || result >= price - 0.5) {
    return null;
  }
  return Math.round(result);
}
function teaserPrice(storeId, price, commercial) {
  let best = null;
  const teasers = commercial.Teasers || [];
  for (const teaser of teasers) {
    if (typeof teaser !== "object" || !teaser) continue;
    const name = String(backing(teaser, "Name") || "");
    if (!teaserMatches(storeId, name)) continue;
    const effects = backing(teaser, "Effects") || {};
    if (typeof effects !== "object" || !effects) continue;
    let percent = null;
    let nominal = null;
    const params = backing(effects, "Parameters") || [];
    for (const param of params) {
      if (typeof param !== "object" || !param) continue;
      const kind = String(backing(param, "Name") || "");
      const raw = backing(param, "Value");
      const val = Number(raw);
      if (isNaN(val)) continue;
      if (kind === "PercentualDiscount") percent = val;
      else if (kind === "NominalDiscount") nominal = val;
    }
    const disc = discounted(price, percent, nominal);
    if (disc !== null && (best === null || disc < best)) {
      best = disc;
    }
  }
  return best;
}
function installmentPrice(storeId, commercial) {
  const installments = commercial.Installments || [];
  for (const inst of installments) {
    if (typeof inst !== "object" || !inst) continue;
    if (inst.NumberOfInstallments !== 1) continue;
    const name = String(inst.PaymentSystemName || "");
    if (!paymentMatches(storeId, name)) continue;
    const raw = inst.TotalValuePlusInterestRate ?? inst.Value;
    const amount = Number(raw);
    if (isNaN(amount) || amount <= 0) continue;
    return [name, amount];
  }
  return null;
}
function vtexStorePayment(storeId, price, commercial) {
  const installment = installmentPrice(storeId, commercial);
  const label = STORE_CARD_NAMES[storeId];
  let cardPrice = null;
  if (installment && installment[1] <= price - 0.5) {
    cardPrice = Math.round(installment[1]);
  }
  const tPrice = teaserPrice(storeId, price, commercial);
  if (tPrice !== null && (cardPrice === null || tPrice < cardPrice)) {
    cardPrice = tPrice;
  }
  if (installment && cardPrice === null) {
    cardPrice = Math.round(installment[1]);
  }
  if (cardPrice === null || !label || installment === null && tPrice === null) {
    return [null, null];
  }
  return [label, cardPrice];
}
function algoliaStorePayment(promotions, shelfPrice) {
  let bestLabel = null;
  let bestPrice = null;
  for (const raw of promotions || []) {
    const text = String(raw);
    if (!text.toLowerCase().includes("tarjeta")) continue;
    const [labelKey, ...remainderArr] = text.split(":");
    const remainder = remainderArr.join(":");
    const amountText = remainder.split(":")[0];
    const amount = parseCop(amountText);
    if (amount === null || amount > shelfPrice + 0.5) continue;
    const label = labelKey.replace(/_/g, " ").split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    if (bestPrice === null || amount < bestPrice) {
      bestLabel = label;
      bestPrice = amount;
    }
  }
  if (bestLabel === null || bestPrice === null) {
    return [null, null];
  }
  return [bestLabel, bestPrice];
}
function falabellaCmr(prices) {
  for (const entry of prices || []) {
    if (typeof entry !== "object" || !entry) continue;
    const obj = entry;
    if (obj.type !== "cmrPrice") continue;
    const raw = obj.price || [];
    if (!Array.isArray(raw) || raw.length === 0) continue;
    const amount = parseCop(String(raw[0]));
    if (amount !== null) return amount;
  }
  return null;
}

const REGION_TTL = 6 * 60 * 60 * 1e3;
const regionCache = /* @__PURE__ */ new Map();
const USER_AGENT$2 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
function vtexSegment(regionId) {
  const payload = {
    campaigns: null,
    channel: "1",
    priceTables: null,
    regionId,
    utm_campaign: null,
    utm_source: null,
    utmi_campaign: null,
    currencyCode: "COP",
    currencySymbol: "$",
    countryCode: "COL",
    cultureInfo: "es-CO",
    channelPrivacy: "public"
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}
async function getRegionId(store, city) {
  const cacheKey = `${store.site}:${city.postal_code}`;
  const cached = regionCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < REGION_TTL) {
    return cached.regionId;
  }
  const url = `${store.region_root || store.site}/api/checkout/pub/regions?country=COL&postalCode=${city.postal_code}`;
  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": USER_AGENT$2
    },
    signal: AbortSignal.timeout(8e3)
  });
  if (!res.ok) {
    throw new Error(`Error en región VTEX: HTTP ${res.status}`);
  }
  const payload = await res.json();
  let regionId = null;
  if (Array.isArray(payload) && payload.length > 0 && typeof payload[0] === "object" && payload[0]) {
    const sellers = payload[0].sellers || [];
    const candidate = String(payload[0].id || "").trim();
    if (sellers.length > 0 && candidate) {
      regionId = candidate;
    }
  }
  regionCache.set(cacheKey, { timestamp: now, regionId });
  return regionId;
}
function sellerPrice(seller) {
  const commercial = seller?.commertialOffer || {};
  const price = Number(commercial.Price || 0);
  if (isNaN(price) || price <= 0) return null;
  const available = commercial.IsAvailable;
  const quantity = commercial.AvailableQuantity;
  if (available === false) return null;
  if (quantity !== void 0 && quantity <= 0 && available !== true) return null;
  let listPrice = Number(commercial.ListPrice || 0);
  if (isNaN(listPrice) || listPrice <= price) {
    listPrice = null;
  }
  return [price, listPrice];
}
function absoluteUrl$1(site, link, linkText) {
  const publicSite = site.replace(/\/$/, "");
  if (link && link.startsWith("http")) {
    try {
      const parsed = new URL(link);
      if (parsed.hostname.endsWith(".vtexcommercestable.com.br")) {
        const expected = new URL(publicSite);
        return `${expected.origin}${parsed.pathname}${parsed.search}`;
      }
    } catch {
      return link;
    }
    return link;
  }
  if (link && link.startsWith("/")) return `${publicSite}${link}`;
  if (linkText) return `${publicSite}/${linkText}/p`;
  return publicSite;
}
function parseVtex(payload, store, limit = 8) {
  if (!Array.isArray(payload)) return [];
  const offers = [];
  for (const product of payload) {
    if (typeof product !== "object" || !product) continue;
    const productName = String(product.productName || "").trim();
    if (!productName) continue;
    const categories = (product.categories || []).map(String);
    const brand = product.brand ? String(product.brand) : null;
    let chosen = null;
    for (const item2 of product.items || []) {
      if (typeof item2 !== "object" || !item2) continue;
      for (const seller of item2.sellers || []) {
        const priced = sellerPrice(seller);
        if (!priced) continue;
        const [price2, listPrice2] = priced;
        if (!chosen || price2 < chosen.price) {
          chosen = { price: price2, listPrice: listPrice2, item: item2, commercial: seller.commertialOffer || {} };
        }
      }
    }
    if (!chosen) continue;
    const { price, listPrice, item, commercial } = chosen;
    const [paymentLabel, paymentPrice] = vtexStorePayment(store.id, price, commercial);
    let image = null;
    const images = item.images || [];
    if (images.length > 0 && typeof images[0] === "object" && images[0]) {
      image = images[0].imageUrl || null;
    }
    offers.push({
      store_id: store.id,
      store_name: store.name,
      name: productName,
      brand,
      price,
      list_price: listPrice,
      url: absoluteUrl$1(store.site, product.link, product.linkText),
      image,
      ean: cleanEan(item.ean),
      categories,
      payment_label: paymentLabel,
      payment_price: paymentPrice,
      savings: listPrice && listPrice > price ? listPrice - price : null
    });
    if (offers.length >= limit) break;
  }
  return offers;
}
async function searchVtex(store, query, city, limit = 8) {
  const regionId = await getRegionId(store, city);
  if (!regionId) {
    throw new Error(`no publica precios para ${city.name}`);
  }
  const url = `${store.api_root}/api/catalog_system/pub/products/search/${encodeURIComponent(query)}?_from=0&_to=${limit - 1}`;
  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "Cookie": `vtex_segment=${vtexSegment(regionId)}`,
      "User-Agent": USER_AGENT$2
    },
    signal: AbortSignal.timeout(12e3)
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const payload = await res.json();
  return parseVtex(payload, store, limit);
}

const ALGOLIA_TTL = 6 * 60 * 60 * 1e3;
const algoliaCache = /* @__PURE__ */ new Map();
const USER_AGENT$1 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
function parseAlgoliaConfig(html) {
  const appIds = [...html.matchAll(/app(?:lication)?Id["']?\s*[:=]\s*["']([A-Z0-9]{8,12})["']/g)].map((m) => m[1]);
  const keys = [...html.matchAll(/apiKey["']?\s*[:=]\s*["']([A-Za-z0-9+/=]{40,})["']/g)].map((m) => m[1]);
  const indexMatches = [...html.matchAll(/indexName["']?\s*[:=]\s*["']([A-Za-z0-9_]{6,})["']/g)].map((m) => m[1]);
  const indexes = indexMatches.filter((name) => name.toLowerCase().includes("index") || name.toLowerCase().includes("prd"));
  if (!appIds.length || !keys.length || !indexes.length) {
    throw new Error("El buscador de la tienda no publicó su configuración");
  }
  const index = indexes.find((name) => name.includes("PRD")) || indexes[indexes.length - 1];
  return [appIds[0], keys[0], index];
}
async function getAlgoliaConfig(homeUrl) {
  const cached = algoliaCache.get(homeUrl);
  const now = Date.now();
  if (cached && now - cached.timestamp < ALGOLIA_TTL) {
    return cached.config;
  }
  const res = await fetch(homeUrl, {
    headers: {
      "Accept": "text/html",
      "User-Agent": USER_AGENT$1
    },
    signal: AbortSignal.timeout(1e4)
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const html = await res.text();
  const config = parseAlgoliaConfig(html);
  algoliaCache.set(homeUrl, { timestamp: now, config });
  return config;
}
function absoluteUrl(site, url) {
  if (url && url.startsWith("http")) return url;
  if (url && url.startsWith("/")) return `${site.replace(/\/$/, "")}${url}`;
  return site;
}
function parseAlgolia(payload, store, limit = 8) {
  if (typeof payload !== "object" || !payload) return [];
  const hits = payload.hits;
  if (!Array.isArray(hits)) return [];
  const offers = [];
  for (const hit of hits) {
    if (typeof hit !== "object" || !hit) continue;
    const name = String(hit.name_text_es || "").trim();
    const rawPrice = hit.lowestprice_double ?? hit.discountprice_double ?? hit.pricevalue_cop_double;
    const amount = Number(rawPrice);
    if (isNaN(amount) || amount <= 0 || !name) continue;
    const inStock = hit.instockflag_boolean;
    const status = String(hit.stocklevelstatus_string || "");
    if (inStock === false || status.toLowerCase() === "outofstock") continue;
    const brands = hit.brand_string_mv || [];
    const brand = Array.isArray(brands) && brands.length > 0 ? String(brands[0]) : null;
    const categories = Array.isArray(hit.categoryname_text_es_mv) ? hit.categoryname_text_es_mv.map(String) : [];
    let listPrice = Number(hit.pricevalue_cop_double);
    if (isNaN(listPrice) || listPrice <= amount) {
      listPrice = null;
    }
    const [paymentLabel, paymentPrice] = algoliaStorePayment(hit.paymentpromotion_text_mv || [], amount);
    offers.push({
      store_id: store.id,
      store_name: store.name,
      name,
      brand,
      price: amount,
      list_price: listPrice,
      url: absoluteUrl(store.site, hit.url_es_string),
      image: hit["img-310wx310h_string"] || null,
      ean: cleanEan(hit.code_string, 12),
      categories,
      payment_label: paymentLabel,
      payment_price: paymentPrice,
      savings: listPrice && listPrice > amount ? listPrice - amount : null
    });
    if (offers.length >= limit) break;
  }
  return offers;
}
async function searchAlgolia(store, query, limit = 8) {
  const [appId, apiKey, index] = await getAlgoliaConfig(store.home_url);
  const url = `https://${appId.toLowerCase()}-dsn.algolia.net/1/indexes/${index}/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "X-Algolia-Application-Id": appId,
      "X-Algolia-API-Key": apiKey,
      "Content-Type": "application/json",
      "Accept": "application/json",
      "User-Agent": USER_AGENT$1
    },
    body: JSON.stringify({
      query,
      hitsPerPage: limit,
      attributesToHighlight: [],
      attributesToRetrieve: [
        "name_text_es",
        "brand_string_mv",
        "lowestprice_double",
        "discountprice_double",
        "pricevalue_cop_double",
        "url_es_string",
        "img-310wx310h_string",
        "code_string",
        "instockflag_boolean",
        "stocklevelstatus_string",
        "categoryname_text_es_mv",
        "paymentpromotion_text_mv"
      ]
    }),
    signal: AbortSignal.timeout(12e3)
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const payload = await res.json();
  return parseAlgolia(payload, store, limit);
}

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
function falabellaPrices(prices) {
  let current = null;
  let regular = null;
  for (const entry of prices || []) {
    if (typeof entry !== "object" || !entry) continue;
    const item = entry;
    const raw = item.price || [];
    if (!Array.isArray(raw) || raw.length === 0) continue;
    const amount = parseCop(String(raw[0]));
    if (amount === null) continue;
    const kind = String(item.type || "");
    const crossed = Boolean(item.crossed);
    if (crossed || kind === "normalPrice") {
      if (regular === null || amount > regular) {
        regular = amount;
      }
      continue;
    }
    if (kind === "cmrPrice") {
      continue;
    }
    if (current === null || amount < current) {
      current = amount;
    }
  }
  if (current === null) return null;
  if (regular !== null && regular <= current) {
    regular = null;
  }
  return [current, regular, falabellaCmr(prices)];
}
function parseFalabella(html, store, limit = 8) {
  const marker = '<script id="__NEXT_DATA__"';
  const startIdx = html.indexOf(marker);
  if (startIdx < 0) {
    throw new Error("Falabella no devolvió resultados legibles");
  }
  const jsonStart = html.indexOf(">", startIdx) + 1;
  const jsonEnd = html.indexOf("<\/script>", jsonStart);
  if (jsonEnd < 0) {
    throw new Error("Falabella no devolvió resultados legibles");
  }
  const rawJson = html.slice(jsonStart, jsonEnd);
  const data = JSON.parse(rawJson);
  const results = data?.props?.pageProps?.results || [];
  const offers = [];
  for (const product of results) {
    if (typeof product !== "object" || !product) continue;
    const priced = falabellaPrices(product.prices || []);
    if (!priced) continue;
    const [price, listPrice, cmrPrice] = priced;
    const name = String(product.displayName || "").trim();
    if (!name) continue;
    const media = product.mediaUrls || [];
    const brand = product.brand ? String(product.brand) : null;
    offers.push({
      store_id: store.id,
      store_name: store.name,
      name,
      brand,
      price,
      list_price: listPrice,
      url: String(product.url || store.site),
      image: Array.isArray(media) && media.length > 0 ? media[0] : null,
      ean: null,
      categories: [],
      payment_label: cmrPrice ? "Tarjeta CMR" : null,
      payment_price: cmrPrice,
      savings: listPrice && listPrice > price ? listPrice - price : null
    });
    if (offers.length >= limit) break;
  }
  return offers;
}
async function searchFalabella(store, query, limit = 8) {
  const url = `${store.site}/falabella-co/search?Ntt=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "Accept": "text/html",
      "User-Agent": USER_AGENT
    },
    signal: AbortSignal.timeout(12e3)
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const html = await res.text();
  return parseFalabella(html, store, limit);
}

const STORES = [
  { type: "vtex", id: "exito", name: "Éxito", kind: "supermercado", site: "https://www.exito.com", api_root: "https://exitocol.vtexcommercestable.com.br", region_root: "https://exitocol.vtexcommercestable.com.br" },
  { type: "vtex", id: "carulla", name: "Carulla", kind: "supermercado", site: "https://www.carulla.com", api_root: "https://www.carulla.com/io" },
  { type: "vtex", id: "jumbo", name: "Jumbo", kind: "supermercado", site: "https://www.jumbocolombia.com", api_root: "https://www.jumbocolombia.com" },
  { type: "vtex", id: "olimpica", name: "Olímpica", kind: "supermercado", site: "https://www.olimpica.com", api_root: "https://www.olimpica.com" },
  { type: "vtex", id: "d1", name: "D1", kind: "supermercado", site: "https://www.d1.com.co", api_root: "https://www.d1.com.co" },
  { type: "algolia", id: "alkosto", name: "Alkosto", kind: "tecnologia", site: "https://www.alkosto.com", home_url: "https://www.alkosto.com/" },
  { type: "algolia", id: "ktronix", name: "Ktronix", kind: "tecnologia", site: "https://www.ktronix.com", home_url: "https://www.ktronix.com/" },
  { type: "falabella", id: "falabella", name: "Falabella", kind: "tecnologia", site: "https://www.falabella.com.co" },
  { type: "vtex", id: "easy", name: "Easy", kind: "hogar", site: "https://www.easy.com.co", api_root: "https://www.easy.com.co" }
];
function storeCatalog() {
  return STORES.map((s) => ({ id: s.id, name: s.name, kind: s.kind }));
}
function shortError(storeName, error) {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes("Timeout") || msg.includes("timeout") || msg.includes("aborted")) {
    return `${storeName} tardó demasiado`;
  }
  return `${storeName}: ${msg.slice(0, 140)}`;
}
async function searchStores(query, city, limit = 16) {
  const tasks = STORES.map(async (store) => {
    try {
      let offers = [];
      if (store.type === "vtex") {
        offers = await searchVtex(store, query, city, limit);
      } else if (store.type === "algolia") {
        offers = await searchAlgolia(store, query, limit);
      } else if (store.type === "falabella") {
        offers = await searchFalabella(store, query, limit);
      }
      return {
        store_id: store.id,
        store_name: store.name,
        kind: store.kind,
        offers
      };
    } catch (err) {
      return {
        store_id: store.id,
        store_name: store.name,
        kind: store.kind,
        offers: [],
        error: shortError(store.name, err)
      };
    }
  });
  return Promise.all(tasks);
}

export { storeCatalog as a, searchStores as s };
