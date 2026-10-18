import type { City, Offer } from '../types';
import { cleanEan } from '../normalize';
import { vtexStorePayment } from '../payments';

export interface VtexStoreConfig {
  id: string;
  name: string;
  kind: string;
  site: string;
  api_root: string;
}

const REGION_TTL = 6 * 60 * 60 * 1000;
const regionCache = new Map<string, { timestamp: number; regionId: string | null }>();
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export function vtexSegment(regionId: string): string {
  const payload = {
    campaigns: null,
    channel: '1',
    priceTables: null,
    regionId: regionId,
    utm_campaign: null,
    utm_source: null,
    utmi_campaign: null,
    currencyCode: 'COP',
    currencySymbol: '$',
    countryCode: 'COL',
    cultureInfo: 'es-CO',
    channelPrivacy: 'public',
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export async function getRegionId(store: VtexStoreConfig, city: City): Promise<string | null> {
  const cacheKey = `${store.site}:${city.postal_code}`;
  const cached = regionCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < REGION_TTL) {
    return cached.regionId;
  }

  const url = `${store.site}/api/checkout/pub/regions?country=COL&postalCode=${city.postal_code}`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': USER_AGENT,
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`Error en región VTEX: HTTP ${res.status}`);
  }

  const payload = await res.json();
  let regionId: string | null = null;
  if (Array.isArray(payload) && payload.length > 0 && typeof payload[0] === 'object' && payload[0]) {
    const sellers = payload[0].sellers || [];
    const candidate = String(payload[0].id || '').trim();
    if (sellers.length > 0 && candidate) {
      regionId = candidate;
    }
  }

  regionCache.set(cacheKey, { timestamp: now, regionId });
  return regionId;
}

function sellerPrice(seller: any): [number, number | null] | null {
  const commercial = seller?.commertialOffer || {};
  const price = Number(commercial.Price || 0);
  if (isNaN(price) || price <= 0) return null;
  const available = commercial.IsAvailable;
  const quantity = commercial.AvailableQuantity;
  if (available === false) return null;
  if (quantity !== undefined && quantity <= 0 && available !== true) return null;

  let listPrice: number | null = Number(commercial.ListPrice || 0);
  if (isNaN(listPrice) || listPrice <= price) {
    listPrice = null;
  }
  return [price, listPrice];
}

function absoluteUrl(site: string, link?: string | null, linkText?: string | null): string {
  if (link && link.startsWith('http')) return link;
  if (link && link.startsWith('/')) return `${site.replace(/\/$/, '')}${link}`;
  if (linkText) return `${site.replace(/\/$/, '')}/${linkText}/p`;
  return site;
}

export function parseVtex(payload: unknown, store: VtexStoreConfig, limit = 8): Offer[] {
  if (!Array.isArray(payload)) return [];
  const offers: Offer[] = [];

  for (const product of payload) {
    if (typeof product !== 'object' || !product) continue;
    const productName = String(product.productName || '').trim();
    if (!productName) continue;

    const categories = (product.categories || []).map(String);
    const brand = product.brand ? String(product.brand) : null;

    let chosen: { price: number; listPrice: number | null; item: any; commercial: any } | null = null;
    for (const item of product.items || []) {
      if (typeof item !== 'object' || !item) continue;
      for (const seller of item.sellers || []) {
        const priced = sellerPrice(seller);
        if (!priced) continue;
        const [price, listPrice] = priced;
        if (!chosen || price < chosen.price) {
          chosen = { price, listPrice, item, commercial: seller.commertialOffer || {} };
        }
      }
    }

    if (!chosen) continue;

    const { price, listPrice, item, commercial } = chosen;
    const [paymentLabel, paymentPrice] = vtexStorePayment(store.id, price, commercial);

    let image: string | null = null;
    const images = item.images || [];
    if (images.length > 0 && typeof images[0] === 'object' && images[0]) {
      image = images[0].imageUrl || null;
    }

    offers.push({
      store_id: store.id,
      store_name: store.name,
      name: productName,
      brand,
      price,
      list_price: listPrice,
      url: absoluteUrl(store.site, product.link, product.linkText),
      image,
      ean: cleanEan(item.ean),
      categories,
      payment_label: paymentLabel,
      payment_price: paymentPrice,
      savings: listPrice && listPrice > price ? listPrice - price : null,
    });

    if (offers.length >= limit) break;
  }

  return offers;
}

export async function searchVtex(store: VtexStoreConfig, query: string, city: City, limit = 8): Promise<Offer[]> {
  const regionId = await getRegionId(store, city);
  if (!regionId) {
    throw new Error(`no publica precios para ${city.name}`);
  }

  const url = `${store.api_root}/api/catalog_system/pub/products/search/${encodeURIComponent(query)}?_from=0&_to=${limit - 1}`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Cookie': `vtex_segment=${vtexSegment(regionId)}`,
      'User-Agent': USER_AGENT,
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const payload = await res.json();
  return parseVtex(payload, store, limit);
}
