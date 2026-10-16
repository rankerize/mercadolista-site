from __future__ import annotations

import asyncio
import math
from dataclasses import dataclass, replace

from app.cities import City
from app.models import Offer, StoreOutcome
from app.normalize import cop, relevance, required_match_ratio
from app.providers import search_stores
from app.units import _dedupe, _measure_offer, _quantity_text, cop_exact

FORMAT_BASIS = {"gramos": "gramo", "mililitros": "mililitro", "unidades": "unidad"}
_QUERY_UNIT = {"gramos": "g", "mililitros": "ml", "unidades": ""}
ANY_BRAND = "TODAS"
_PARALLEL_ITEMS = 2
_OPTIONS = 4
_SIZE_TOLERANCE = 0.005


@dataclass(frozen=True)
class ListItem:
    name: str
    brand: str | None
    format: str
    quantity: float

    @property
    def basis(self) -> str:
        return FORMAT_BASIS[self.format]

    @property
    def query(self) -> str:
        return f"{self.name} {self.brand}" if self.brand else self.name

    @property
    def sized_query(self) -> str:
        amount = int(self.quantity) if self.quantity.is_integer() else self.quantity
        suffix = _QUERY_UNIT[self.format]
        return f"{self.query} {amount} {suffix}".strip()

    @property
    def label(self) -> str:
        brand = self.brand or "todas las marcas"
        return f"{self.name} · {brand} · {_quantity_text(self.quantity, self.basis)}"


def make_item(name: str, brand: str, format: str, quantity: float) -> ListItem:
    clean_brand = " ".join(brand.split())
    if not clean_brand or clean_brand.upper() == ANY_BRAND:
        clean_brand = ""
    return ListItem(" ".join(name.split()), clean_brand or None, format, float(quantity))


def _brand_matches(item: ListItem, offer: Offer) -> bool:
    if not item.brand:
        return True
    return relevance(item.brand, offer.name, offer.brand) >= 1.0


def _candidates(item: ListItem, offers: list[Offer]) -> list[dict]:
    collected = [offer for offer in _dedupe(offers) if _brand_matches(item, offer)]
    threshold = required_match_ratio(item.name)
    scored = [(offer, relevance(item.name, offer.name, offer.brand)) for offer in collected]
    strict = [pair for pair in scored if pair[1] + 1e-9 >= threshold]
    if not strict:
        strict = [pair for pair in scored if pair[1] >= 0.5]
    candidates = []
    for offer, _score in strict:
        measure = _measure_offer(offer)
        if measure is None or measure["basis"] != item.basis:
            continue
        pack_quantity = float(measure["quantity"])
        if abs(pack_quantity - item.quantity) > item.quantity * _SIZE_TOLERANCE:
            continue
        pack_price = float(measure["compared_price"])
        candidates.append(
            {
                "store_id": offer.store_id,
                "store_name": offer.store_name,
                "name": offer.name,
                "brand": offer.brand,
                "url": offer.url,
                "image": offer.image,
                "pack_price": pack_price,
                "shelf_price": offer.price,
                "from_card": bool(measure["from_card"]),
                "payment_label": offer.payment_label if measure["from_card"] else None,
                "pack_quantity_label": _quantity_text(pack_quantity, item.basis),
                "unit_price": float(measure["amount"]),
                "unit_label": str(measure["per"]),
                "total": round(pack_price, 2),
            }
        )
    candidates.sort(key=lambda option: (option["total"], option["unit_price"]))
    return candidates


def _item_detail(item: ListItem, winner: dict) -> str:
    each = "cada una" if item.basis == "unidad" else f"el {winner['unit_label']}"
    text = (
        f"Empaque de {winner['pack_quantity_label']} a {cop(winner['pack_price'])}. "
        f"Sale a {cop_exact(winner['unit_price'])} {each}."
    )
    if winner["from_card"]:
        text += f" Precio con {winner['payment_label']}; el precio normal del empaque es {cop(winner['shelf_price'])}."
    return text


def build_list_report(items: list[ListItem], outcomes_by_item: list[list[StoreOutcome]], city: City) -> dict:
    rows = []
    store_names: dict[str, str] = {}
    store_totals: dict[str, float] = {}
    store_found: dict[str, set[int]] = {}
    store_errors: dict[str, str] = {}
    store_hits: dict[str, int] = {}
    total = 0.0
    missing: list[str] = []

    for index, (item, outcomes) in enumerate(zip(items, outcomes_by_item)):
        for outcome in outcomes:
            store_names.setdefault(outcome.store_id, outcome.store_name)
            store_hits.setdefault(outcome.store_id, 0)
            if outcome.error:
                store_errors.setdefault(outcome.store_id, outcome.error)
            elif outcome.offers:
                store_hits[outcome.store_id] += 1
        candidates = _candidates(item, [offer for outcome in outcomes for offer in outcome.offers])
        best_by_store: dict[str, dict] = {}
        for option in candidates:
            best_by_store.setdefault(option["store_id"], option)
        for store_id, option in best_by_store.items():
            store_totals[store_id] = store_totals.get(store_id, 0.0) + option["total"]
            store_found.setdefault(store_id, set()).add(index)

        winner = candidates[0] if candidates else None
        if winner:
            total += winner["total"]
        else:
            missing.append(item.name)
        rows.append(
            {
                "label": item.label,
                "name": item.name,
                "brand": item.brand or ANY_BRAND,
                "format": item.format,
                "quantity": item.quantity,
                "winner": winner,
                "detail": _item_detail(item, winner) if winner else None,
                "options": candidates[1 : 1 + _OPTIONS],
            }
        )

    single_store = []
    for store_id, name in store_names.items():
        found = store_found.get(store_id, set())
        lacking = [items[index].name for index in range(len(items)) if index not in found]
        single_store.append(
            {
                "store_id": store_id,
                "store_name": name,
                "total": round(store_totals.get(store_id, 0.0), 2) if found else None,
                "missing": lacking,
            }
        )
    single_store.sort(key=lambda row: (len(row["missing"]), row["total"] if row["total"] is not None else math.inf))

    found_count = len(items) - len(missing)
    complete = [row for row in single_store if not row["missing"]]
    best_single = complete[0] if complete else None
    return {
        "city": {"id": city.id, "name": city.name},
        "total": round(total, 2),
        "found": found_count,
        "count": len(items),
        "missing": missing,
        "items": rows,
        "best_single_store": best_single,
        "single_store": single_store,
        "stores": [
            {
                "id": store_id,
                "name": name,
                "count": store_hits.get(store_id, 0),
                "error": store_errors.get(store_id) if not store_hits.get(store_id) else None,
            }
            for store_id, name in store_names.items()
        ],
    }


def _merge_outcomes(first: list[StoreOutcome], second: list[StoreOutcome]) -> list[StoreOutcome]:
    by_store = {outcome.store_id: outcome for outcome in second}
    merged = []
    for outcome in first:
        other = by_store.pop(outcome.store_id, None)
        if other is None:
            merged.append(outcome)
            continue
        offers = _dedupe(list(outcome.offers) + list(other.offers))
        error = None if offers else (outcome.error or other.error)
        merged.append(replace(outcome, offers=offers, error=error))
    merged.extend(by_store.values())
    return merged


async def search_list(items: list[ListItem], city: City) -> dict:
    gate = asyncio.Semaphore(_PARALLEL_ITEMS)

    async def run(item: ListItem) -> list[StoreOutcome]:
        async with gate:
            plain, sized = await asyncio.gather(
                search_stores(item.query, city), search_stores(item.sized_query, city)
            )
        return _merge_outcomes(plain, sized)

    outcomes = await asyncio.gather(*[run(item) for item in items])
    return build_list_report(items, list(outcomes), city)
