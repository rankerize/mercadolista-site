from __future__ import annotations

import re
import unicodedata

STOPWORDS = {
    "de",
    "la",
    "el",
    "en",
    "y",
    "para",
    "con",
    "por",
    "del",
    "los",
    "las",
    "un",
    "una",
    "al",
    "lo",
    "su",
    "x",
}

SYNONYMS = {
    "televisor": {"televisor", "tv", "television"},
    "tv": {"televisor", "tv", "television"},
    "television": {"televisor", "tv", "television"},
    "celular": {"celular", "smartphone", "iphone"},
    "smartphone": {"celular", "smartphone", "iphone"},
    "nevera": {"nevera", "refrigerador", "refrigeradora"},
    "refrigerador": {"nevera", "refrigerador", "refrigeradora"},
    "lavadora": {"lavadora", "lavarropas"},
    "portatil": {"portatil", "laptop", "notebook"},
    "laptop": {"portatil", "laptop", "notebook"},
    "arroz": {"arroz"},
    "leche": {"leche"},
    "aceite": {"aceite"},
    "cargador": {"cargador", "charger"},
    "charger": {"cargador", "charger"},
    "mouse": {"mouse", "raton"},
    "raton": {"mouse", "raton"},
}

_AUDIO = {
    "audifono",
    "audifonos",
    "auricular",
    "auriculares",
    "earbud",
    "earbuds",
    "earphone",
    "earphones",
    "headphone",
    "headphones",
    "headset",
    "cascos",
    "buds",
}
for _word in _AUDIO:
    SYNONYMS[_word] = _AUDIO

_SIZE_RE = re.compile(
    r"(\d+(?:[.,]\d+)?)\s*(mililitros|ml|litros|litro|lts|lt|l|kg|kilogramos|kilos|gramos|gramo|grs|gr|g)\b",
    re.IGNORECASE,
)
_PACK_RE = re.compile(r"\bx\s*(\d+)\s*(unds|und|unidades|unid|u)\b", re.IGNORECASE)

_UNIT_TO_BASE = {
    "ml": ("L", 0.001),
    "mililitros": ("L", 0.001),
    "l": ("L", 1),
    "lt": ("L", 1),
    "lts": ("L", 1),
    "litro": ("L", 1),
    "litros": ("L", 1),
    "g": ("kg", 0.001),
    "gr": ("kg", 0.001),
    "grs": ("kg", 0.001),
    "gramo": ("kg", 0.001),
    "gramos": ("kg", 0.001),
    "kg": ("kg", 1),
    "kilos": ("kg", 1),
    "kilogramos": ("kg", 1),
}


def strip_accents(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    return "".join(char for char in normalized if not unicodedata.combining(char))


def normalize(text: str) -> str:
    return strip_accents(text).lower()


def tokens(text: str) -> list[str]:
    raw = re.findall(r"[a-z0-9]+", normalize(text))
    return [token for token in raw if token not in STOPWORDS and len(token) > 1]


def token_matches(token: str, product_tokens: set[str], product_text: str) -> bool:
    options = SYNONYMS.get(token, {token})
    if options & product_tokens:
        return True
    if token.isdigit() and len(token) >= 2:
        return re.search(rf"(?<![0-9]){re.escape(token)}(?![0-9])", product_text) is not None
    if len(token) >= 5:
        return any(
            product.startswith(token) or token.startswith(product)
            for product in product_tokens
            if len(product) >= 5
        )
    return False


def relevance(query: str, name: str, brand: str | None = None) -> float:
    query_tokens = tokens(query)
    if not query_tokens:
        return 0.0
    blob = f"{name} {brand or ''}"
    product_tokens = set(tokens(blob))
    product_text = normalize(blob)
    matched = sum(1 for token in query_tokens if token_matches(token, product_tokens, product_text))
    return matched / len(query_tokens)


def required_match_ratio(query: str) -> float:
    count = len(tokens(query))
    if count <= 2:
        return 1.0
    return 0.67


def category_matches(query: str, categories: list[str]) -> bool:
    if not categories:
        return False
    blob = " ".join(categories)
    product_tokens = set(tokens(blob))
    product_text = normalize(blob)
    return any(token_matches(token, product_tokens, product_text) for token in tokens(query))


def parse_cop(value: str) -> float | None:
    cleaned = value.strip().replace("$", "").replace(" ", "")
    if not cleaned:
        return None
    if "," in cleaned and "." in cleaned:
        cleaned = cleaned.replace(".", "").replace(",", ".")
    elif "," in cleaned:
        cleaned = cleaned.replace(",", ".")
    else:
        cleaned = cleaned.replace(".", "")
    try:
        amount = float(cleaned)
    except ValueError:
        return None
    if amount <= 0:
        return None
    return amount


def clean_ean(value: object, min_length: int = 8) -> str | None:
    if value is None:
        return None
    digits = re.sub(r"\D", "", str(value))
    if min_length <= len(digits) <= 14 and len(set(digits)) > 1:
        return digits
    return None


def _number(raw: str) -> float:
    if "," in raw and "." in raw:
        raw = raw.replace(".", "").replace(",", ".")
    elif raw.count(".") == 1 and len(raw.split(".")[1]) != 3:
        raw = raw.replace(",", ".")
    else:
        raw = raw.replace(".", "").replace(",", ".")
    return float(raw)


_COUNT_RE = re.compile(
    r"(?:x\s*)?(\d+)\s*(?:unidades|unidad|unds|und|unid|uds|un)\b",
    re.IGNORECASE,
)
_EGG_RE = re.compile(r"(\d+)\s*huevos?\b", re.IGNORECASE)
_LOOSE_COUNT_RE = re.compile(
    r"\bx\s*(\d+)\b(?!\s*(?:\.\d{3})?\s*(?:mililitros|ml|litros|litro|lts|lt|l|kg|kilogramos|kilos|gramos|gramo|grs|gr|g)\b)",
    re.IGNORECASE,
)
_MULTIPACK_PREFIX_RE = re.compile(r"(?<![\d.,])(\d{1,2})\s*[x×]\s*$", re.IGNORECASE)
_GRAM_FACTOR = {"g": 1, "gr": 1, "grs": 1, "gramo": 1, "gramos": 1, "kg": 1000, "kilos": 1000, "kilogramos": 1000}
_ML_FACTOR = {"ml": 1, "mililitros": 1, "l": 1000, "lt": 1000, "lts": 1000, "litro": 1000, "litros": 1000}


def _count_in_name(name: str) -> int | None:
    for pattern in (_COUNT_RE, _EGG_RE, _LOOSE_COUNT_RE):
        match = pattern.search(name)
        if not match:
            continue
        count = int(match.group(1))
        if 1 <= count <= 500:
            return count
    return None


def sale_measure(name: str, price: float) -> dict[str, float | str] | None:
    """Price of one piece, one gram, or one milliliter, taken from the product name."""
    folded = strip_accents(name)
    count = _count_in_name(folded)
    if count:
        return {
            "amount": round(price / count, 4),
            "quantity": float(count),
            "per": "unidad",
            "basis": "unidad",
        }
    match = _SIZE_RE.search(folded)
    if not match:
        return None
    quantity = _number(match.group(1))
    unit = match.group(2).lower()
    if unit in _GRAM_FACTOR:
        total = quantity * _GRAM_FACTOR[unit]
        per = "gramo"
    elif unit in _ML_FACTOR:
        total = quantity * _ML_FACTOR[unit]
        per = "mililitro"
    else:
        return None
    multipack = _MULTIPACK_PREFIX_RE.search(folded[: match.start()])
    if multipack and int(multipack.group(1)) >= 2:
        total *= int(multipack.group(1))
    if total <= 0:
        return None
    return {"amount": round(price / total, 4), "quantity": total, "per": per, "basis": per}


def unit_price(name: str, price: float) -> dict[str, float | str] | None:
    match = _SIZE_RE.search(name)
    if not match:
        return None
    quantity = _number(match.group(1))
    unit = match.group(2).lower()
    base, factor = _UNIT_TO_BASE[unit]
    total = quantity * factor
    pack = _PACK_RE.search(name)
    if pack:
        total *= int(pack.group(1))
    if total <= 0:
        return None
    return {"amount": round(price / total, 2), "per": base}


def cop(amount: float) -> str:
    return f"$ {amount:,.0f}".replace(",", ".")
