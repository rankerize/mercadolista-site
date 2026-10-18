import type { Offer, StoreOutcome } from './types';
import {
  categoryMatches,
  cop,
  copExact,
  relevance,
  requiredMatchRatio,
  saleMeasure,
} from './normalize';
import { dedupe, paymentNote } from './ranking';

const BASIS_RANK: Record<string, number> = { unidad: 0, gramo: 1, mililitro: 2 };
const BASIS_NOUN: Record<string, string> = { unidad: 'unidad', gramo: 'gramo', mililitro: 'mililitro' };
const BASIS_PLURAL: Record<string, string> = { unidad: 'unidades', gramo: 'gramos', mililitro: 'mililitros' };

export function quantityText(quantity: number, basis: string): string {
  let shown: string;
  if (Math.abs(quantity - Math.round(quantity)) < 0.05) {
    shown = Math.round(quantity).toString();
  } else {
    shown = quantity.toFixed(1).replace('.', ',');
  }
  return `${shown} ${BASIS_PLURAL[basis] || basis}`;
}

export function cardPrice(offer: Offer): number | null {
  if (offer.payment_label && offer.payment_price && offer.payment_price + 0.5 < offer.price) {
    return Number(offer.payment_price);
  }
  return null;
}

export interface MeasuredOfferData {
  amount: number;
  quantity: number;
  per: string;
  basis: string;
  compared_price: number;
  from_card: boolean;
  shelf_unit_price: number;
}

export function measureOffer(offer: Offer): MeasuredOfferData | null {
  const card = cardPrice(offer);
  const used = card !== null ? card : offer.price;
  const measure = saleMeasure(offer.name, used);
  if (!measure) return null;

  const shelf = saleMeasure(offer.name, offer.price);
  return {
    ...measure,
    compared_price: used,
    from_card: card !== null,
    shelf_unit_price: shelf ? shelf.amount : measure.amount,
  };
}

function offerPayload(offer: Offer, score: number, measure: MeasuredOfferData): Record<string, any> {
  const basis = String(measure.basis);
  return {
    store_id: offer.store_id,
    store_name: offer.store_name,
    name: offer.name,
    brand: offer.brand,
    price: offer.price,
    list_price: offer.list_price,
    url: offer.url,
    image: offer.image,
    ean: offer.ean,
    relevance: Number(score.toFixed(2)),
    unit_price: measure.amount,
    unit_label: measure.per,
    unit_quantity: measure.quantity,
    unit_quantity_label: quantityText(measure.quantity, basis),
    from_card: Boolean(measure.from_card),
    shelf_unit_price: measure.shelf_unit_price,
    payment_label: offer.payment_label,
    payment_price: offer.payment_price,
  };
}

function chooseBasis(measured: [Offer, number, boolean, MeasuredOfferData][]): string {
  const categorized = measured.filter((item) => item[2]);
  const pool = categorized.length > 0 ? categorized : measured;
  const counts: Record<string, number> = {};
  for (const item of pool) {
    const basis = item[3].basis;
    counts[basis] = (counts[basis] || 0) + 1;
  }

  const bases = Object.keys(counts);
  bases.sort((a, b) => {
    if (counts[b] !== counts[a]) {
      return counts[b] - counts[a];
    }
    return (BASIS_RANK[a] ?? 99) - (BASIS_RANK[b] ?? 99);
  });
  return bases[0];
}

function detail(winner: Offer, measure: MeasuredOfferData, others: [Offer, MeasuredOfferData][]): string {
  const basis = String(measure.basis);
  const noun = BASIS_NOUN[basis] || basis;
  const each = basis === 'unidad' ? 'cada una' : `el ${noun}`;
  const qty = quantityText(measure.quantity, basis);
  const unitText = copExact(measure.amount);

  let text = '';
  if (measure.from_card) {
    text = `${winner.name}. Con ${winner.payment_label} el empaque queda en ${cop(measure.compared_price)}, por debajo del precio normal ${cop(winner.price)}. Son ${qty}, a ${unitText} ${each}.`;
  } else {
    text = `${winner.name}. El empaque cuesta ${cop(winner.price)}. Son ${qty}, a ${unitText} ${each}.`;
  }

  const cheaperPack = others.filter(
    (item) => item[1].compared_price + 0.5 < measure.compared_price
  );
  if (cheaperPack.length > 0) {
    cheaperPack.sort((a, b) => a[1].compared_price - b[1].compared_price);
    const [other, otherMeasure] = cheaperPack[0];
    const article = basis === 'unidad' ? 'la' : 'el';
    text += ` ${other.name} en ${other.store_name} queda en ${cop(otherMeasure.compared_price)} el empaque, pero ${article} ${noun} sale a ${copExact(otherMeasure.amount)}.`;
  }
  return text;
}

export function buildUnitReport(query: string, outcomes: StoreOutcome[]): Record<string, any> {
  const allOffers = outcomes.flatMap((outcome) => outcome.offers);
  const collected = dedupe(allOffers);
  const threshold = requiredMatchRatio(query);

  const scored: [Offer, number, boolean][] = collected.map((offer) => [
    offer,
    relevance(query, offer.name, offer.brand),
    categoryMatches(query, offer.categories),
  ]);

  let strict = scored.filter((item) => item[1] + 1e-9 >= threshold);
  let relaxed = false;
  if (strict.length === 0 && scored.length > 0) {
    relaxed = true;
    strict = scored.filter((item) => item[1] >= 0.5);
    if (strict.length === 0) strict = scored;
  }

  const measured: [Offer, number, boolean, MeasuredOfferData][] = [];
  let unmeasured = 0;
  for (const [offer, score, categoryHit] of strict) {
    const m = measureOffer(offer);
    if (!m) {
      unmeasured += 1;
      continue;
    }
    measured.push([offer, score, categoryHit, m]);
  }

  let verdict: Record<string, any> | null = null;
  let shown: [Offer, number, MeasuredOfferData][] = [];

  if (measured.length > 0) {
    const basis = chooseBasis(measured);
    const comparable = measured.filter((item) => item[3].basis === basis);
    comparable.sort((a, b) => {
      if (a[3].amount !== b[3].amount) {
        return a[3].amount - b[3].amount;
      }
      return a[0].price - b[0].price;
    });

    const [winner, _score, _category, winnerMeasure] = comparable[0];
    const noun = BASIS_NOUN[basis] || basis;
    let headline = `La ${noun} más barata está en ${winner.store_name}`;
    if (basis === 'gramo') {
      headline = `El gramo más barato está en ${winner.store_name}`;
    } else if (basis === 'mililitro') {
      headline = `El mililitro más barato está en ${winner.store_name}`;
    }

    const others: [Offer, MeasuredOfferData][] = comparable.slice(1).map((item) => [item[0], item[3]]);
    let note: string | null;
    if (winnerMeasure.from_card) {
      const article = basis === 'unidad' ? 'la' : 'el';
      note = `Precio normal de ${article} ${noun}: ${copExact(winnerMeasure.shelf_unit_price)}.`;
    } else {
      note = paymentNote([winner]);
    }

    verdict = {
      store_id: winner.store_id,
      store_name: winner.store_name,
      name: winner.name,
      price: winner.price,
      unit_price: winnerMeasure.amount,
      unit_label: winnerMeasure.per,
      unit_quantity_label: quantityText(winnerMeasure.quantity, basis),
      from_card: Boolean(winnerMeasure.from_card),
      shelf_unit_price: winnerMeasure.shelf_unit_price,
      url: winner.url,
      image: winner.image,
      kicker: `Menor valor por ${noun}`,
      headline,
      detail: detail(winner, winnerMeasure, others),
      payment_note: note,
    };

    shown = comparable.map((item) => [item[0], item[1], item[3]]);
  }

  return {
    query,
    relaxed,
    basis: verdict ? verdict.unit_label : null,
    unmeasured,
    verdict,
    offers: shown.map(([offer, score, m]) => offerPayload(offer, score, m)),
    stores: outcomes.map((outcome) => ({
      id: outcome.store_id,
      name: outcome.store_name,
      count: outcome.offers.length,
      error: outcome.error,
    })),
  };
}
