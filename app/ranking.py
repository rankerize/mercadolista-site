from __future__ import annotations

from collections import defaultdict

from app.models import Offer, StoreOutcome
from app.normalize import category_matches, cop, relevance, required_match_ratio, unit_price


def _offer_payload(offer: Offer, score: float, category_hit: bool) -> dict:
    measured = unit_price(offer.name, offer.price)
    return {
        "store_id": offer.store_id,
        "store_name": offer.store_name,
        "name": offer.name,
        "brand": offer.brand,
        "price": offer.price,
        "list_price": offer.list_price,
        "savings": offer.savings,
        "url": offer.url,
        "image": offer.image,
        "ean": offer.ean,
        "relevance": round(score, 2),
        "category_match": category_hit,
        "unit_price": measured["amount"] if measured else None,
        "unit_label": measured["per"] if measured else None,
        "payment_label": offer.payment_label,
        "payment_price": offer.payment_price,
    }


def _dedupe(offers: list[Offer]) -> list[Offer]:
    best: dict[tuple[str, str], Offer] = {}
    for offer in offers:
        key = (offer.store_id, offer.url or offer.name)
        current = best.get(key)
        if current is None or offer.price < current.price:
            best[key] = offer
    return list(best.values())


def _same_product(scored: list[tuple[Offer, float, bool]]) -> list[tuple[Offer, float, bool]] | None:
    groups: dict[str, list[tuple[Offer, float, bool]]] = defaultdict(list)
    for item in scored:
        ean = item[0].ean
        if ean:
            groups[ean].append(item)

    candidates: list[tuple[float, int, int, list[tuple[Offer, float, bool]]]] = []
    for items in groups.values():
        by_store: dict[str, tuple[Offer, float, bool]] = {}
        for item in items:
            current = by_store.get(item[0].store_id)
            if current is None or item[0].price < current[0].price:
                by_store[item[0].store_id] = item
        unique = list(by_store.values())
        if len(unique) < 2:
            continue
        score = max(item[1] for item in unique)
        category_hits = sum(1 for item in unique if item[2])
        candidates.append((score, category_hits, len(unique), unique))

    if not candidates:
        return None
    candidates.sort(key=lambda item: (item[0], item[1], item[2]), reverse=True)
    score, _category_hits, _stores, unique = candidates[0]
    if score < 0.67:
        return None
    unique.sort(key=lambda item: item[0].price)
    return unique


def _pick_single(scored: list[tuple[Offer, float, bool]]) -> tuple[Offer, float, bool]:
    with_category = [item for item in scored if item[2]]
    pool = with_category or scored
    return min(pool, key=lambda item: (-item[1], item[0].price))


def _join_names(names: list[str]) -> str:
    if len(names) == 1:
        return names[0]
    if len(names) == 2:
        return f"{names[0]} y {names[1]}"
    return f"{', '.join(names[:-1])} y {names[-1]}"


def _verdict_copy(
    winner: Offer,
    same: list[tuple[Offer, float, bool]] | None,
    scored: list[tuple[Offer, float, bool]],
) -> tuple[str, str]:
    if same:
        offers = [item[0] for item in same]
        tied = [offer for offer in offers if offer.price == winner.price]
        higher = [offer for offer in offers if offer.price > winner.price]
        names = _join_names([offer.store_name for offer in tied])
        headline = f"El mejor precio está en {names}"
        verb = "cobra" if len(tied) == 1 else "cobran"
        detail = (
            f"El mismo producto, código {winner.ean}, está en {len(offers)} tiendas. "
            f"{names} {verb} {cop(winner.price)}"
        )
        if higher:
            compared = ", ".join(f"{offer.store_name} ({cop(offer.price)})" for offer in higher)
            detail += f", por debajo de {compared}"
        detail += "."
        cheaper_other = [
            item[0]
            for item in scored
            if item[0].price < winner.price and item[0].ean != winner.ean
        ]
        if cheaper_other:
            other = min(cheaper_other, key=lambda offer: offer.price)
            detail += (
                f" Hay algo más barato ({other.name} en {other.store_name} a {cop(other.price)}), "
                "pero no es el mismo producto."
            )
        return headline, detail

    headline = f"El mejor precio está en {winner.store_name}"
    detail = (
        f"{winner.name} sale a {cop(winner.price)} en {winner.store_name}. "
        "Es la oferta más barata parecida a tu búsqueda. "
        "No apareció el mismo código de barras en otra tienda, así que revisa marca y tamaño."
    )
    return headline, detail


def payment_note(offers: list[Offer]) -> str | None:
    priced = [offer for offer in offers if offer.payment_label and offer.payment_price]
    if not priced:
        return None
    best = min(priced, key=lambda offer: (offer.payment_price, offer.price))
    discounted = [offer for offer in priced if offer.payment_price + 0.5 < offer.price]
    if not discounted:
        labels = _join_names(sorted({offer.payment_label for offer in priced if offer.payment_label}))
        return f"Con {labels} el precio publicado es el mismo que el normal."
    saving = best.price - best.payment_price
    text = f"Con {best.payment_label} en {best.store_name} queda en {cop(best.payment_price)}"
    if saving > 0.5:
        text += f", {cop(saving)} menos que el precio normal de esa tienda"
    shelf = min(offers, key=lambda offer: offer.price)
    if best.payment_price + 0.5 < shelf.price and best.store_id != shelf.store_id:
        text += f". Así queda por debajo del precio normal de {shelf.store_name} ({cop(shelf.price)})"
    return text + "."


def build_report(query: str, outcomes: list[StoreOutcome]) -> dict:
    collected = _dedupe([offer for outcome in outcomes for offer in outcome.offers])
    scored = [
        (offer, relevance(query, offer.name, offer.brand), category_matches(query, offer.categories))
        for offer in collected
    ]
    threshold = required_match_ratio(query)
    strict = [item for item in scored if item[1] + 1e-9 >= threshold]
    relaxed = False
    if not strict and scored:
        relaxed = True
        strict = [item for item in scored if item[1] >= 0.5] or scored

    same = _same_product(strict) if strict else None
    winner_item = same[0] if same else (_pick_single(strict) if strict else None)

    offers_sorted = sorted(strict, key=lambda item: (item[0].price, -item[1]))
    verdict = None
    if winner_item:
        winner = winner_item[0]
        described = max(same, key=lambda item: len(item[0].name))[0] if same else winner
        headline, detail = _verdict_copy(winner, same, strict)
        verdict = {
            "store_id": winner.store_id,
            "store_name": winner.store_name,
            "price": winner.price,
            "name": described.name,
            "url": winner.url,
            "image": described.image or winner.image,
            "ean": winner.ean,
            "headline": headline,
            "detail": detail,
            "same_product": same is not None,
            "payment_note": payment_note([item[0] for item in same] if same else [winner]),
        }

    same_payload = None
    if same:
        cheapest = same[0][0].price
        described = max(same, key=lambda item: len(item[0].name))[0]
        same_payload = {
            "ean": described.ean,
            "name": described.name,
            "offers": [
                {
                    **_offer_payload(offer, score, category_hit),
                    "difference": round(offer.price - cheapest, 2),
                }
                for offer, score, category_hit in same
            ],
        }

    return {
        "query": query,
        "relaxed": relaxed,
        "verdict": verdict,
        "same_product": same_payload,
        "offers": [_offer_payload(offer, score, category_hit) for offer, score, category_hit in offers_sorted],
        "stores": [
            {
                "id": outcome.store_id,
                "name": outcome.store_name,
                "kind": outcome.kind,
                "count": len(outcome.offers),
                "error": outcome.error,
            }
            for outcome in outcomes
        ],
    }
