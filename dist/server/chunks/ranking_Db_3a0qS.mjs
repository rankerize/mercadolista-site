import { a as relevance, e as categoryMatches, r as requiredMatchRatio, b as cop, u as unitPrice } from './normalize_DA1X8QDr.mjs';
import { f as findBestCategoryHelp } from './collectionTaxonomy_PwVXjHAC.mjs';

function offerPayload(offer, score, categoryHit) {
  const measured = unitPrice(offer.name, offer.price);
  return {
    store_id: offer.store_id,
    store_name: offer.store_name,
    name: offer.name,
    brand: offer.brand,
    price: offer.price,
    list_price: offer.list_price,
    savings: offer.savings,
    url: offer.url,
    image: offer.image,
    ean: offer.ean,
    relevance: Number(score.toFixed(2)),
    category_match: categoryHit,
    unit_price: measured ? measured.amount : null,
    unit_label: measured ? measured.per : null,
    payment_label: offer.payment_label,
    payment_price: offer.payment_price
  };
}
function dedupe(offers) {
  const best = /* @__PURE__ */ new Map();
  for (const offer of offers) {
    const key = `${offer.store_id}:${offer.url || offer.name}`;
    const current = best.get(key);
    if (!current || offer.price < current.price) {
      best.set(key, offer);
    }
  }
  return Array.from(best.values());
}
function sameProduct(scored) {
  const groups = /* @__PURE__ */ new Map();
  for (const item of scored) {
    const ean = item[0].ean;
    if (ean) {
      if (!groups.has(ean)) groups.set(ean, []);
      groups.get(ean).push(item);
    }
  }
  const candidates = [];
  for (const items of groups.values()) {
    const byStore = /* @__PURE__ */ new Map();
    for (const item of items) {
      const storeId = item[0].store_id;
      const current = byStore.get(storeId);
      if (!current || item[0].price < current[0].price) {
        byStore.set(storeId, item);
      }
    }
    const unique = Array.from(byStore.values());
    if (unique.length < 2) continue;
    const score = Math.max(...unique.map((i) => i[1]));
    const categoryHits = unique.filter((i) => i[2]).length;
    candidates.push({ score, categoryHits, count: unique.length, unique });
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    if (a.categoryHits !== b.categoryHits) return b.categoryHits - a.categoryHits;
    return b.count - a.count;
  });
  const top = candidates[0];
  if (top.score < 0.67) return null;
  top.unique.sort((a, b) => a[0].price - b[0].price);
  return top.unique;
}
function pickSingle(scored) {
  const withCategory = scored.filter((i) => i[2]);
  const pool = withCategory.length > 0 ? withCategory : scored;
  pool.sort((a, b) => {
    if (a[1] !== b[1]) return b[1] - a[1];
    return a[0].price - b[0].price;
  });
  return pool[0];
}
function joinNames(names) {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} y ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
}
function verdictCopy(winner, same, scored) {
  if (same) {
    const offers = same.map((i) => i[0]);
    const tied = offers.filter((o) => o.price === winner.price);
    const higher = offers.filter((o) => o.price > winner.price);
    const names = joinNames(tied.map((o) => o.store_name));
    const headline2 = `El mejor precio está en ${names}`;
    const verb = tied.length === 1 ? "cobra" : "cobran";
    let detail2 = `El mismo producto, código ${winner.ean}, está en ${offers.length} tiendas. ${names} ${verb} ${cop(winner.price)}`;
    if (higher.length > 0) {
      const compared = higher.map((o) => `${o.store_name} (${cop(o.price)})`).join(", ");
      detail2 += `, por debajo de ${compared}`;
    }
    detail2 += ".";
    const cheaperOther = scored.map((i) => i[0]).filter((o) => o.price < winner.price && o.ean !== winner.ean);
    if (cheaperOther.length > 0) {
      cheaperOther.sort((a, b) => a.price - b.price);
      const other = cheaperOther[0];
      detail2 += ` Hay algo más barato (${other.name} en ${other.store_name} a ${cop(other.price)}), pero no es el mismo producto.`;
    }
    return [headline2, detail2];
  }
  const headline = `El mejor precio está en ${winner.store_name}`;
  const detail = `${winner.name} sale a ${cop(winner.price)} en ${winner.store_name}. Es la oferta más barata parecida a tu búsqueda. No apareció el mismo código de barras en otra tienda, así que revisa marca y tamaño.`;
  return [headline, detail];
}
function paymentNote(offers) {
  const priced = offers.filter((o) => o.payment_label && o.payment_price);
  if (priced.length === 0) return null;
  priced.sort((a, b) => {
    if (a.payment_price !== b.payment_price) return (a.payment_price || 0) - (b.payment_price || 0);
    return a.price - b.price;
  });
  const best = priced[0];
  const discounted = priced.filter((o) => o.payment_price + 0.5 < o.price);
  if (discounted.length === 0) {
    const distinctLabels = Array.from(new Set(priced.map((o) => o.payment_label))).sort();
    const labels = joinNames(distinctLabels);
    return `Con ${labels} el precio publicado es el mismo que el normal.`;
  }
  const saving = best.price - best.payment_price;
  let text = `Con ${best.payment_label} en ${best.store_name} queda en ${cop(best.payment_price)}`;
  if (saving > 0.5) {
    text += `, ${cop(saving)} menos que el precio normal de esa tienda`;
  }
  const sortedByPrice = [...offers].sort((a, b) => a.price - b.price);
  const shelf = sortedByPrice[0];
  if (best.payment_price + 0.5 < shelf.price && best.store_id !== shelf.store_id) {
    text += `. Así queda por debajo del precio normal de ${shelf.store_name} (${cop(shelf.price)})`;
  }
  return `${text}.`;
}
function buildReport(query, outcomes) {
  const allOffers = outcomes.flatMap((o) => o.offers);
  const collected = dedupe(allOffers);
  const scored = collected.map((offer) => [
    offer,
    relevance(query, offer.name, offer.brand),
    categoryMatches(query, offer.categories, offer.name)
  ]);
  const threshold = requiredMatchRatio(query);
  let strict = scored.filter((item) => item[1] > 0 && item[1] + 1e-9 >= threshold);
  let relaxed = false;
  if (strict.length === 0 && scored.length > 0) {
    relaxed = true;
    strict = scored.filter((item) => item[1] >= 0.5);
    if (strict.length === 0) strict = scored.filter((item) => item[1] > 0);
  }
  const same = strict.length > 0 ? sameProduct(strict) : null;
  const winnerItem = same ? same[0] : strict.length > 0 ? pickSingle(strict) : null;
  const offersSorted = [...strict].sort((a, b) => {
    if (a[0].price !== b[0].price) return a[0].price - b[0].price;
    return b[1] - a[1];
  });
  let verdict = null;
  if (winnerItem) {
    const winner = winnerItem[0];
    const described = same ? [...same].sort((a, b) => b[0].name.length - a[0].name.length)[0][0] : winner;
    const [headline, detail] = verdictCopy(winner, same, strict);
    verdict = {
      store_id: winner.store_id,
      store_name: winner.store_name,
      price: winner.price,
      name: described.name,
      url: winner.url,
      image: described.image || winner.image,
      ean: winner.ean,
      headline,
      detail,
      same_product: same !== null,
      payment_note: paymentNote(same ? same.map((i) => i[0]) : [winner])
    };
  }
  let samePayload = null;
  if (same) {
    const cheapest = same[0][0].price;
    const described = [...same].sort((a, b) => b[0].name.length - a[0].name.length)[0][0];
    samePayload = {
      ean: described.ean,
      name: described.name,
      offers: same.map(([offer, score, categoryHit]) => ({
        ...offerPayload(offer, score, categoryHit),
        difference: Number((offer.price - cheapest).toFixed(2))
      }))
    };
  }
  const categoryHelp = findBestCategoryHelp(query);
  return {
    query,
    relaxed,
    verdict,
    same_product: samePayload,
    category_suggestion: categoryHelp,
    offers: offersSorted.map(([offer, score, categoryHit]) => offerPayload(offer, score, categoryHit)),
    stores: outcomes.map((outcome) => ({
      id: outcome.store_id,
      name: outcome.store_name,
      kind: outcome.kind,
      count: outcome.offers.length,
      error: outcome.error || null
    }))
  };
}

export { buildReport as b, dedupe as d, paymentNote as p };
