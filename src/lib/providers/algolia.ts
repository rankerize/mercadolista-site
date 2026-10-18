import type { Offer } from '../types';
import { cleanEan } from '../normalize';
import { algoliaStorePayment } from '../payments';

export interface AlgoliaStoreConfig {
  id: string;
  name: string;
  kind: string;
  site: string;
  home_url: string;
}

const ALGOLIA_TTL = 6 * 60 * 60 * 1000;
const algoliaCache = new Map<string, { timestamp: number; config: [string, string, string] }>();
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export function parseAlgoliaConfig(html: string): [string, string, string] {
  const appIds = [...html.matchAll(/app(?:lication)?Id["']?\s*[:=]\s*["']([A-Z0-9]{8,12})["']/g)].map((m) => m[1]);
  const keys = [...html.matchAll(/apiKey["']?\s*[:=]\s*["']([A-Za-z0-9+/=]{40,})["']/g)].map((m) => m[1]);
  const indexMatches = [...html.matchAll(/indexName["']?\s*[:=]\s*["']([A-Za-z0-9_]{6,})["']/g)].map((m) => m[1]);
  const indexes = indexMatches.filter((name) => name.toLowerCase().includes('index') || name.toLowerCase().includes('prd'));

  if (!appIds.length || !keys.length || !indexes.length) {
    throw new Error('El buscador de la tienda no publicó su configuración');
  }

  const index = indexes.find((name) => name.includes('PRD')) || indexes[indexes.length - 1];
  return [appIds[0], keys[0], index];
}

async function getAlgoliaConfig(homeUrl: string): Promise<[string, string, string]> {
  const cached = algoliaCache.get(homeUrl);
  const now = Date.now();
  if (cached && now - cached.timestamp < ALGOLIA_TTL) {
    return cached.config;
  }

  const res = await fetch(homeUrl, {
    headers: {
      'Accept': 'text/html',
      'User-Agent': USER_AGENT,
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const html = await res.text();
  const config = parseAlgoliaConfig(html);
  algoliaCache.set(homeUrl, { timestamp: now, config });
  return config;
}

function absoluteUrl(site: string, url?: string | null): string {
  if (url && url.startsWith('http')) return url;
  if (url && url.startsWith('/')) return `${site.replace(/\/$/, '')}${url}`;
  return site;
}

export function parseAlgolia(payload: unknown, store: AlgoliaStoreConfig, limit = 8): Offer[] {
  if (typeof payload !== 'object' || !payload) return [];
  const hits = (payload as any).hits;
  if (!Array.isArray(hits)) return [];

  const offers: Offer[] = [];
  for (const hit of hits) {
    if (typeof hit !== 'object' || !hit) continue;

    const name = String(hit.name_text_es || '').trim();
    const rawPrice = hit.lowestprice_double ?? hit.discountprice_double ?? hit.pricevalue_cop_double;
    const amount = Number(rawPrice);
    if (isNaN(amount) || amount <= 0 || !name) continue;

    const inStock = hit.instockflag_boolean;
    const status = String(hit.stocklevelstatus_string || '');
    if (inStock === false || status.toLowerCase() === 'outofstock') continue;

    const brands = hit.brand_string_mv || [];
    const brand = Array.isArray(brands) && brands.length > 0 ? String(brands[0]) : null;
    const categories = Array.isArray(hit.categoryname_text_es_mv) ? hit.categoryname_text_es_mv.map(String) : [];

    let listPrice: number | null = Number(hit.pricevalue_cop_double);
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
      image: hit['img-310wx310h_string'] || null,
      ean: cleanEan(hit.code_string, 12),
      categories,
      payment_label: paymentLabel,
      payment_price: paymentPrice,
      savings: listPrice && listPrice > amount ? listPrice - amount : null,
    });

    if (offers.length >= limit) break;
  }

  return offers;
}

export async function searchAlgolia(store: AlgoliaStoreConfig, query: string, limit = 8): Promise<Offer[]> {
  const [appId, apiKey, index] = await getAlgoliaConfig(store.home_url);
  const url = `https://${appId.toLowerCase()}-dsn.algolia.net/1/indexes/${index}/query`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'X-Algolia-Application-Id': appId,
      'X-Algolia-API-Key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': USER_AGENT,
    },
    body: JSON.stringify({
      query,
      hitsPerPage: limit,
      attributesToHighlight: [],
      attributesToRetrieve: [
        'name_text_es',
        'brand_string_mv',
        'lowestprice_double',
        'discountprice_double',
        'pricevalue_cop_double',
        'url_es_string',
        'img-310wx310h_string',
        'code_string',
        'instockflag_boolean',
        'stocklevelstatus_string',
        'categoryname_text_es_mv',
        'paymentpromotion_text_mv',
      ],
    }),
    signal: AbortSignal.timeout(12000),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const payload = await res.json();
  return parseAlgolia(payload, store, limit);
}
