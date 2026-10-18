import type { Offer } from '../types';
import { parseCop } from '../normalize';
import { falabellaCmr } from '../payments';

export interface FalabellaStoreConfig {
  id: string;
  name: string;
  kind: string;
  site: string;
}

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

function falabellaPrices(prices: unknown[]): [number, number | null, number | null] | null {
  let current: number | null = null;
  let regular: number | null = null;

  for (const entry of prices || []) {
    if (typeof entry !== 'object' || !entry) continue;
    const item = entry as Record<string, any>;
    const raw = item.price || [];
    if (!Array.isArray(raw) || raw.length === 0) continue;
    const amount = parseCop(String(raw[0]));
    if (amount === null) continue;

    const kind = String(item.type || '');
    const crossed = Boolean(item.crossed);

    if (crossed || kind === 'normalPrice') {
      if (regular === null || amount > regular) {
        regular = amount;
      }
      continue;
    }
    if (kind === 'cmrPrice') {
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

export function parseFalabella(html: string, store: FalabellaStoreConfig, limit = 8): Offer[] {
  const marker = '<script id="__NEXT_DATA__"';
  const startIdx = html.indexOf(marker);
  if (startIdx < 0) {
    throw new Error('Falabella no devolvió resultados legibles');
  }
  const jsonStart = html.indexOf('>', startIdx) + 1;
  const jsonEnd = html.indexOf('</script>', jsonStart);
  if (jsonEnd < 0) {
    throw new Error('Falabella no devolvió resultados legibles');
  }

  const rawJson = html.slice(jsonStart, jsonEnd);
  const data = JSON.parse(rawJson);
  const results = data?.props?.pageProps?.results || [];

  const offers: Offer[] = [];
  for (const product of results) {
    if (typeof product !== 'object' || !product) continue;
    const priced = falabellaPrices(product.prices || []);
    if (!priced) continue;
    const [price, listPrice, cmrPrice] = priced;

    const name = String(product.displayName || '').trim();
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
      payment_label: cmrPrice ? 'Tarjeta CMR' : null,
      payment_price: cmrPrice,
      savings: listPrice && listPrice > price ? listPrice - price : null,
    });

    if (offers.length >= limit) break;
  }

  return offers;
}

export async function searchFalabella(store: FalabellaStoreConfig, query: string, limit = 8): Promise<Offer[]> {
  const url = `${store.site}/falabella-co/search?Ntt=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'text/html',
      'User-Agent': USER_AGENT,
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const html = await res.text();
  return parseFalabella(html, store, limit);
}
