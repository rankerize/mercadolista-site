from __future__ import annotations

import re

from app.normalize import parse_cop, strip_accents

STORE_CARD_NAMES = {
    "jumbo": "Tarjeta Cencosud",
    "easy": "Tarjeta Cencosud",
    "exito": "Tarjeta Éxito",
    "carulla": "Tarjeta Carulla",
    "olimpica": "Tarjeta Olímpica",
    "alkosto": "Tarjeta Alkosto",
    "ktronix": "Tarjeta Ktronix",
    "falabella": "Tarjeta CMR",
}

_TEASER_TOKENS = {
    "jumbo": ("tmc", "cencosud"),
    "easy": ("tmc", "cencosud"),
    "exito": ("tuya", "tarjeta exito", "tarjeta carulla"),
    "carulla": ("tuya", "tarjeta exito", "tarjeta carulla"),
    "olimpica": ("olimpica",),
}


def _backing(data: dict, logical: str):
    if logical in data:
        return data[logical]
    tagged = f"<{logical}>k__BackingField"
    if tagged in data:
        return data[tagged]
    return None


def _payment_matches(store_id: str, text: str) -> bool:
    folded = strip_accents(text).lower()
    if store_id == "exito":
        return "tarjeta exito" in folded or "exito mastercard" in folded
    if store_id == "carulla":
        return "tarjeta carulla" in folded or "carulla mastercard" in folded or "tarjeta exito" in folded
    if store_id == "olimpica":
        return "tarjeta" in folded and "olimpica" in folded
    if store_id in {"jumbo", "easy"}:
        return "cencosud" in folded
    return False


def _teaser_matches(store_id: str, name: str) -> bool:
    folded = strip_accents(name).lower()
    for hint in _TEASER_TOKENS.get(store_id, ()):
        if " " in hint:
            if hint in folded:
                return True
            continue
        if re.search(rf"\b{re.escape(hint)}\b", folded):
            return True
    return False


def _discounted(price: float, percent: float | None, nominal: float | None) -> float | None:
    result = None
    if percent and percent > 0:
        result = price * (1 - percent / 100)
    if nominal and nominal > 0:
        nominal_price = price - nominal
        if result is None or nominal_price < result:
            result = nominal_price
    if result is None or result <= 0 or result >= price - 0.5:
        return None
    return float(round(result))


def _teaser_price(store_id: str, price: float, commercial: dict) -> float | None:
    best: float | None = None
    for teaser in commercial.get("Teasers") or []:
        if not isinstance(teaser, dict):
            continue
        name = str(_backing(teaser, "Name") or "")
        if not _teaser_matches(store_id, name):
            continue
        effects = _backing(teaser, "Effects") or {}
        if not isinstance(effects, dict):
            continue
        percent = None
        nominal = None
        for param in _backing(effects, "Parameters") or []:
            if not isinstance(param, dict):
                continue
            kind = str(_backing(param, "Name") or "")
            raw = _backing(param, "Value")
            try:
                value = float(raw)
            except (TypeError, ValueError):
                continue
            if kind == "PercentualDiscount":
                percent = value
            elif kind == "NominalDiscount":
                nominal = value
        discounted = _discounted(price, percent, nominal)
        if discounted is not None and (best is None or discounted < best):
            best = discounted
    return best


def _installment_price(store_id: str, commercial: dict) -> tuple[str, float] | None:
    for installment in commercial.get("Installments") or []:
        if not isinstance(installment, dict):
            continue
        if installment.get("NumberOfInstallments") != 1:
            continue
        name = str(installment.get("PaymentSystemName") or "")
        if not _payment_matches(store_id, name):
            continue
        raw = installment.get("TotalValuePlusInterestRate") or installment.get("Value")
        try:
            amount = float(raw)
        except (TypeError, ValueError):
            continue
        if amount <= 0:
            continue
        return name, amount
    return None


def vtex_store_payment(store_id: str, price: float, commercial: dict) -> tuple[str | None, float | None]:
    """Price published for the store's own card, such as Tarjeta Cencosud at Jumbo."""
    installment = _installment_price(store_id, commercial)
    label = STORE_CARD_NAMES.get(store_id)
    card_price = None
    if installment and installment[1] <= price - 0.5:
        card_price = float(round(installment[1]))
    teaser_price = _teaser_price(store_id, price, commercial)
    if teaser_price is not None and (card_price is None or teaser_price < card_price):
        card_price = teaser_price
    if installment and card_price is None:
        card_price = float(round(installment[1]))
    if card_price is None or not label or (installment is None and teaser_price is None):
        return None, None
    return label, card_price


def algolia_store_payment(promotions: list, shelf_price: float) -> tuple[str | None, float | None]:
    best_label = None
    best_price = None
    for raw in promotions or []:
        text = str(raw)
        if "tarjeta" not in text.lower():
            continue
        label_key, _, remainder = text.partition(":")
        amount_text = remainder.split(":", 1)[0]
        amount = parse_cop(amount_text)
        if amount is None or amount > shelf_price + 0.5:
            continue
        label = " ".join(part.capitalize() for part in label_key.replace("_", " ").split())
        if best_price is None or amount < best_price:
            best_label = label
            best_price = amount
    if best_label is None or best_price is None:
        return None, None
    return best_label, best_price


def falabella_cmr(prices: list) -> float | None:
    for entry in prices:
        if not isinstance(entry, dict) or entry.get("type") != "cmrPrice":
            continue
        raw = entry.get("price") or []
        if not raw:
            continue
        amount = parse_cop(str(raw[0]))
        if amount is not None:
            return amount
    return None
