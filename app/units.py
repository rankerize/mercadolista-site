from __future__ import annotations

from collections import Counter

from app.models import Offer, StoreOutcome
from app.normalize import category_matches, cop, relevance, required_match_ratio, sale_measure
from app.ranking import payment_note

_BASIS_RANK = {"unidad": 0, "gramo": 1, "mililitro": 2}
_BASIS_NOUN = {"unidad": "unidad", "gramo": "gramo", "mililitro": "mililitro"}
_BASIS_PLURAL = {"unidad": "unidades", "gramo": "gramos", "mililitro": "mililitros"}


def _dedupe(offers: list[Offer]) -> list[Offer]:
    best: dict[tuple[str, str], Offer] = {}
    for offer in offers:
        key = (offer.store_id, offer.url or offer.name)
        current = best.get(key)
        if current is None or offer.price < current.price:
            best[key] = offer
    return list(best.values())


def cop_exact(amount: float) -> str:
    if amount >= 100:
        return cop(amount)
    formatted = f"{amount:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"$ {formatted}"


def _quantity_text(quantity: float, basis: str) -> str:
    if abs(quantity - round(quantity)) < 0.05:
        shown = str(int(round(quantity)))
    else:
        shown = f"{quantity:.1f}".replace(".", ",")
    return f"{shown} {_BASIS_PLURAL[basis]}"


def _card_price(offer: Offer) -> float | None:
    if offer.payment_label and offer.payment_price and offer.payment_price + 0.5 < offer.price:
        return float(offer.payment_price)
    return None


def _measure_offer(offer: Offer) -> dict[str, float | str | bool] | None:
    card = _card_price(offer)
    used = card if card is not None else offer.price
    measure = sale_measure(offer.name, used)
    if measure is None:
        return None
    shelf = sale_measure(offer.name, offer.price)
    measure["compared_price"] = used
    measure["from_card"] = card is not None
    measure["shelf_unit_price"] = shelf["amount"] if shelf else measure["amount"]
    return measure


def _offer_payload(offer: Offer, score: float, measure: dict[str, float | str | bool]) -> dict:
    basis = str(measure["basis"])
    return {
        "store_id": offer.store_id,
        "store_name": offer.store_name,
        "name": offer.name,
        "brand": offer.brand,
        "price": offer.price,
        "list_price": offer.list_price,
        "url": offer.url,
        "image": offer.image,
        "ean": offer.ean,
        "relevance": round(score, 2),
        "unit_price": measure["amount"],
        "unit_label": measure["per"],
        "unit_quantity": measure["quantity"],
        "unit_quantity_label": _quantity_text(float(measure["quantity"]), basis),
        "from_card": bool(measure["from_card"]),
        "shelf_unit_price": measure["shelf_unit_price"],
        "payment_label": offer.payment_label,
        "payment_price": offer.payment_price,
    }


def _choose_basis(measured: list[tuple[Offer, float, bool, dict]]) -> str:
    categorized = [item for item in measured if item[2]]
    pool = categorized or measured
    counts = Counter(str(item[3]["basis"]) for item in pool)
    return max(counts, key=lambda basis: (counts[basis], -_BASIS_RANK[basis]))


def _detail(winner: Offer, measure: dict[str, float | str | bool], others: list[tuple[Offer, dict]]) -> str:
    basis = str(measure["basis"])
    noun = _BASIS_NOUN[basis]
    each = "cada una" if basis == "unidad" else f"el {noun}"
    quantity = _quantity_text(float(measure["quantity"]), basis)
    unit_text = cop_exact(float(measure["amount"]))
    if measure["from_card"]:
        text = (
            f"{winner.name}. Con {winner.payment_label} el empaque queda en {cop(float(measure['compared_price']))}, "
            f"por debajo del precio normal {cop(winner.price)}. "
            f"Son {quantity}, a {unit_text} {each}."
        )
    else:
        text = (
            f"{winner.name}. El empaque cuesta {cop(winner.price)}. "
            f"Son {quantity}, a {unit_text} {each}."
        )
    cheaper_pack = [
        item for item in others if float(item[1]["compared_price"]) + 0.5 < float(measure["compared_price"])
    ]
    if cheaper_pack:
        other, other_measure = min(cheaper_pack, key=lambda item: float(item[1]["compared_price"]))
        article = "la" if basis == "unidad" else "el"
        text += (
            f" {other.name} en {other.store_name} queda en {cop(float(other_measure['compared_price']))} el empaque, "
            f"pero {article} {noun} sale a {cop_exact(float(other_measure['amount']))}."
        )
    return text


def build_unit_report(query: str, outcomes: list[StoreOutcome]) -> dict:
    collected = _dedupe([offer for outcome in outcomes for offer in outcome.offers])
    threshold = required_match_ratio(query)
    scored = []
    for offer in collected:
        score = relevance(query, offer.name, offer.brand)
        scored.append((offer, score, category_matches(query, offer.categories)))
    strict = [item for item in scored if item[1] + 1e-9 >= threshold]
    relaxed = False
    if not strict and scored:
        relaxed = True
        strict = [item for item in scored if item[1] >= 0.5] or scored

    measured = []
    unmeasured = 0
    for offer, score, category_hit in strict:
        measure = _measure_offer(offer)
        if measure is None:
            unmeasured += 1
            continue
        measured.append((offer, score, category_hit, measure))

    verdict = None
    shown: list[tuple[Offer, float, dict]] = []
    if measured:
        basis = _choose_basis(measured)
        comparable = [item for item in measured if item[3]["basis"] == basis]
        pool = sorted(comparable, key=lambda item: (float(item[3]["amount"]), item[0].price))
        winner, _score, _category, measure = pool[0]
        noun = _BASIS_NOUN[basis]
        headline = f"La {noun} más barata está en {winner.store_name}"
        if basis == "gramo":
            headline = f"El gramo más barato está en {winner.store_name}"
        elif basis == "mililitro":
            headline = f"El mililitro más barato está en {winner.store_name}"
        others = [(item[0], item[3]) for item in pool[1:]]
        if measure["from_card"]:
            article = "la" if basis == "unidad" else "el"
            note = (
                f"Precio normal de {article} {noun}: {cop_exact(float(measure['shelf_unit_price']))}."
            )
        else:
            note = payment_note([winner])
        verdict = {
            "store_id": winner.store_id,
            "store_name": winner.store_name,
            "name": winner.name,
            "price": winner.price,
            "unit_price": measure["amount"],
            "unit_label": measure["per"],
            "unit_quantity_label": _quantity_text(float(measure["quantity"]), basis),
            "from_card": bool(measure["from_card"]),
            "shelf_unit_price": measure["shelf_unit_price"],
            "url": winner.url,
            "image": winner.image,
            "kicker": f"Menor valor por {noun}",
            "headline": headline,
            "detail": _detail(winner, measure, others),
            "payment_note": note,
        }
        shown = [(item[0], item[1], item[3]) for item in sorted(comparable, key=lambda item: (float(item[3]["amount"]), item[0].price))]

    return {
        "query": query,
        "relaxed": relaxed,
        "basis": verdict["unit_label"] if verdict else None,
        "unmeasured": unmeasured,
        "verdict": verdict,
        "offers": [_offer_payload(offer, score, measure) for offer, score, measure in shown],
        "stores": [
            {
                "id": outcome.store_id,
                "name": outcome.store_name,
                "count": len(outcome.offers),
                "error": outcome.error,
            }
            for outcome in outcomes
        ],
    }
