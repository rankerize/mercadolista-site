import { parseCop, stripAccents } from './normalize';

export const STORE_CARD_NAMES: Record<string, string> = {
  jumbo: 'Tarjeta Cencosud',
  easy: 'Tarjeta Cencosud',
  exito: 'Tarjeta Éxito',
  carulla: 'Tarjeta Carulla',
  olimpica: 'Tarjeta Olímpica',
  alkosto: 'Tarjeta Alkosto',
  ktronix: 'Tarjeta Ktronix',
  falabella: 'Tarjeta CMR',
};

const TEASER_TOKENS: Record<string, string[]> = {
  jumbo: ['tmc', 'cencosud'],
  easy: ['tmc', 'cencosud'],
  exito: ['tuya', 'tarjeta exito', 'tarjeta carulla'],
  carulla: ['tuya', 'tarjeta exito', 'tarjeta carulla'],
  olimpica: ['olimpica'],
};

function backing(data: Record<string, any>, logical: string): any {
  if (logical in data) return data[logical];
  const tagged = `<${logical}>k__BackingField`;
  if (tagged in data) return data[tagged];
  return undefined;
}

function paymentMatches(storeId: string, text: string): boolean {
  const folded = stripAccents(text).toLowerCase();
  if (storeId === 'exito') {
    return folded.includes('tarjeta exito') || folded.includes('exito mastercard');
  }
  if (storeId === 'carulla') {
    return folded.includes('tarjeta carulla') || folded.includes('carulla mastercard') || folded.includes('tarjeta exito');
  }
  if (storeId === 'olimpica') {
    return folded.includes('tarjeta') && folded.includes('olimpica');
  }
  if (storeId === 'jumbo' || storeId === 'easy') {
    return folded.includes('cencosud');
  }
  return false;
}

function teaserMatches(storeId: string, name: string): boolean {
  const folded = stripAccents(name).toLowerCase();
  const hints = TEASER_TOKENS[storeId] || [];
  for (const hint of hints) {
    if (hint.includes(' ')) {
      if (folded.includes(hint)) return true;
      continue;
    }
    const regex = new RegExp(`\\b${hint}\\b`, 'i');
    if (regex.test(folded)) return true;
  }
  return false;
}

function discounted(price: number, percent?: number | null, nominal?: number | null): number | null {
  let result: number | null = null;
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

function teaserPrice(storeId: string, price: number, commercial: Record<string, any>): number | null {
  let best: number | null = null;
  const teasers = commercial.Teasers || [];
  for (const teaser of teasers) {
    if (typeof teaser !== 'object' || !teaser) continue;
    const name = String(backing(teaser, 'Name') || '');
    if (!teaserMatches(storeId, name)) continue;
    const effects = backing(teaser, 'Effects') || {};
    if (typeof effects !== 'object' || !effects) continue;
    let percent: number | null = null;
    let nominal: number | null = null;
    const params = backing(effects, 'Parameters') || [];
    for (const param of params) {
      if (typeof param !== 'object' || !param) continue;
      const kind = String(backing(param, 'Name') || '');
      const raw = backing(param, 'Value');
      const val = Number(raw);
      if (isNaN(val)) continue;
      if (kind === 'PercentualDiscount') percent = val;
      else if (kind === 'NominalDiscount') nominal = val;
    }
    const disc = discounted(price, percent, nominal);
    if (disc !== null && (best === null || disc < best)) {
      best = disc;
    }
  }
  return best;
}

function installmentPrice(storeId: string, commercial: Record<string, any>): [string, number] | null {
  const installments = commercial.Installments || [];
  for (const inst of installments) {
    if (typeof inst !== 'object' || !inst) continue;
    if (inst.NumberOfInstallments !== 1) continue;
    const name = String(inst.PaymentSystemName || '');
    if (!paymentMatches(storeId, name)) continue;
    const raw = inst.TotalValuePlusInterestRate ?? inst.Value;
    const amount = Number(raw);
    if (isNaN(amount) || amount <= 0) continue;
    return [name, amount];
  }
  return null;
}

export function vtexStorePayment(
  storeId: string,
  price: number,
  commercial: Record<string, any>
): [string | null, number | null] {
  const installment = installmentPrice(storeId, commercial);
  const label = STORE_CARD_NAMES[storeId];
  let cardPrice: number | null = null;
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
  if (cardPrice === null || !label || (installment === null && tPrice === null)) {
    return [null, null];
  }
  return [label, cardPrice];
}

export function algoliaStorePayment(
  promotions: unknown[],
  shelfPrice: number
): [string | null, number | null] {
  let bestLabel: string | null = null;
  let bestPrice: number | null = null;
  for (const raw of promotions || []) {
    const text = String(raw);
    if (!text.toLowerCase().includes('tarjeta')) continue;
    const [labelKey, ...remainderArr] = text.split(':');
    const remainder = remainderArr.join(':');
    const amountText = remainder.split(':')[0];
    const amount = parseCop(amountText);
    if (amount === null || amount > shelfPrice + 0.5) continue;
    const label = labelKey
      .replace(/_/g, ' ')
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
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

export function falabellaCmr(prices: unknown[]): number | null {
  for (const entry of prices || []) {
    if (typeof entry !== 'object' || !entry) continue;
    const obj = entry as Record<string, any>;
    if (obj.type !== 'cmrPrice') continue;
    const raw = obj.price || [];
    if (!Array.isArray(raw) || raw.length === 0) continue;
    const amount = parseCop(String(raw[0]));
    if (amount !== null) return amount;
  }
  return null;
}
