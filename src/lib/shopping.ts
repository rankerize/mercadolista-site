import type { City, Offer, StoreOutcome } from './types';
import { cop, copExact, relevance, requiredMatchRatio } from './normalize';
import { dedupe } from './ranking';
import { searchStores } from './providers';
import { measureOffer, quantityText } from './units';

export const FORMAT_BASIS: Record<string, string> = {
  gramos: 'gramo',
  mililitros: 'mililitro',
  unidades: 'unidad',
};

const QUERY_UNIT: Record<string, string> = {
  gramos: 'g',
  mililitros: 'ml',
  unidades: '',
};

export const ANY_BRAND = 'TODAS';
const PARALLEL_ITEMS = 2;
const OPTIONS_LIMIT = 4;
const SIZE_TOLERANCE = 0.005;

export interface ListItem {
  name: string;
  brand: string | null;
  format: 'gramos' | 'mililitros' | 'unidades';
  quantity: number;
}

export function makeItem(
  name: string,
  brand: string,
  format: 'gramos' | 'mililitros' | 'unidades',
  quantity: number
): ListItem {
  const cleanBrand = brand.trim();
  const validBrand = !cleanBrand || cleanBrand.toUpperCase() === ANY_BRAND ? null : cleanBrand;
  return {
    name: name.trim().replace(/\s+/g, ' '),
    brand: validBrand,
    format,
    quantity: Number(quantity),
  };
}

export function itemBasis(item: ListItem): string {
  return FORMAT_BASIS[item.format] || 'unidad';
}

export function itemQuery(item: ListItem): string {
  return item.brand ? `${item.name} ${item.brand}` : item.name;
}

export function itemSizedQuery(item: ListItem): string {
  const amount = Number.isInteger(item.quantity) ? item.quantity.toString() : item.quantity.toString();
  const suffix = QUERY_UNIT[item.format] || '';
  return `${itemQuery(item)} ${amount} ${suffix}`.trim();
}

export function itemLabel(item: ListItem): string {
  const brand = item.brand || 'todas las marcas';
  return `${item.name} · ${brand} · ${quantityText(item.quantity, itemBasis(item))}`;
}

function brandMatches(item: ListItem, offer: Offer): boolean {
  if (!item.brand) return true;
  return relevance(item.brand, offer.name, offer.brand) >= 1.0;
}

function getCandidates(item: ListItem, offers: Offer[]): Record<string, any>[] {
  const collected = dedupe(offers).filter((offer) => brandMatches(item, offer));
  const threshold = requiredMatchRatio(item.name);
  const scored = collected.map((offer) => ({
    offer,
    score: relevance(item.name, offer.name, offer.brand),
  }));

  let strict = scored.filter((p) => p.score + 1e-9 >= threshold);
  if (strict.length === 0) {
    strict = scored.filter((p) => p.score >= 0.5);
  }

  const basis = itemBasis(item);
  const candidates: Record<string, any>[] = [];

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
      total: Number(packPrice.toFixed(2)),
    });
  }

  candidates.sort((a, b) => {
    if (a.total !== b.total) return a.total - b.total;
    return a.unit_price - b.unit_price;
  });

  return candidates;
}

function itemDetail(item: ListItem, winner: Record<string, any>): string {
  const basis = itemBasis(item);
  const each = basis === 'unidad' ? 'cada una' : `el ${winner.unit_label}`;
  let text = `Empaque de ${winner.pack_quantity_label} a ${cop(winner.pack_price)}. Sale a ${copExact(winner.unit_price)} ${each}.`;
  if (winner.from_card) {
    text += ` Precio con ${winner.payment_label}; el precio normal del empaque es ${cop(winner.shelf_price)}.`;
  }
  return text;
}

export function buildListReport(
  items: ListItem[],
  outcomesByItem: StoreOutcome[][],
  city: City
): Record<string, any> {
  const rows: Record<string, any>[] = [];
  const storeNames = new Map<string, string>();
  const storeTotals = new Map<string, number>();
  const storeFound = new Map<string, Set<number>>();
  const storeErrors = new Map<string, string>();
  const storeHits = new Map<string, number>();
  let total = 0.0;
  const missing: string[] = [];

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
    const bestByStore = new Map<string, Record<string, any>>();
    for (const option of candidates) {
      if (!bestByStore.has(option.store_id)) {
        bestByStore.set(option.store_id, option);
      }
    }

    for (const [storeId, option] of bestByStore.entries()) {
      storeTotals.set(storeId, (storeTotals.get(storeId) || 0) + option.total);
      if (!storeFound.has(storeId)) storeFound.set(storeId, new Set());
      storeFound.get(storeId)!.add(index);
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
      options: candidates.slice(1, 1 + OPTIONS_LIMIT),
    });
  });

  const singleStore: Record<string, any>[] = [];
  for (const [storeId, name] of storeNames.entries()) {
    const found = storeFound.get(storeId) || new Set<number>();
    const lacking = items
      .map((item, idx) => (found.has(idx) ? null : item.name))
      .filter((n): n is string => n !== null);

    singleStore.push({
      store_id: storeId,
      store_name: name,
      total: found.size > 0 ? Number((storeTotals.get(storeId) || 0).toFixed(2)) : null,
      missing: lacking,
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
      error: (storeHits.get(storeId) || 0) === 0 ? storeErrors.get(storeId) || null : null,
    })),
  };
}

function mergeOutcomes(first: StoreOutcome[], second: StoreOutcome[]): StoreOutcome[] {
  const byStore = new Map<string, StoreOutcome>();
  for (const outcome of second) {
    byStore.set(outcome.store_id, outcome);
  }

  const merged: StoreOutcome[] = [];
  for (const outcome of first) {
    const other = byStore.get(outcome.store_id);
    if (!other) {
      merged.push(outcome);
      continue;
    }
    byStore.delete(outcome.store_id);
    const combinedOffers = dedupe([...outcome.offers, ...other.offers]);
    const error = combinedOffers.length > 0 ? undefined : (outcome.error || other.error);
    merged.push({
      ...outcome,
      offers: combinedOffers,
      error,
    });
  }

  for (const leftover of byStore.values()) {
    merged.push(leftover);
  }
  return merged;
}

export async function searchList(items: ListItem[], city: City): Promise<Record<string, any>> {
  // Concurrency limiter
  const results: StoreOutcome[][] = new Array(items.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const idx = currentIndex++;
      const item = items[idx];
      const [plain, sized] = await Promise.all([
        searchStores(itemQuery(item), city),
        searchStores(itemSizedQuery(item), city),
      ]);
      results[idx] = mergeOutcomes(plain, sized);
    }
  }

  const workers = Array.from({ length: Math.min(PARALLEL_ITEMS, items.length) }, () => worker());
  await Promise.all(workers);

  return buildListReport(items, results, city);
}
