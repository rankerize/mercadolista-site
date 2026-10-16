from __future__ import annotations

import asyncio
import json
import logging
import re
from dataclasses import dataclass
from html import unescape

import httpx

from app.normalize import cop, relevance, required_match_ratio, strip_accents

logger = logging.getLogger(__name__)

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)
LIMIT = 16
ALI_COOKIE = "aep_usuc_f=site=col&c_tp=COP&region=CO&b_locale=es_ES"

_CONDITIONAL_SHIPPING = re.compile(
    r"Entrega GRATIS.*?Colombia.*?COP\s*([0-9][0-9.,]*)\)?\s*de art",
    re.IGNORECASE | re.DOTALL,
)
_PAID_SHIPPING = re.compile(r"Entrega por COP\s*([0-9][0-9.,]*)", re.IGNORECASE)
_FREE_SHIPPING = re.compile(r"Entrega GRATIS.*?Colombia", re.IGNORECASE | re.DOTALL)
_BLOCKED_SHIPPING = re.compile(
    r"no se puede enviar|no env[ií]a a colombia|cannot be shipped",
    re.IGNORECASE,
)


@dataclass
class IntlOffer:
    store_id: str
    store_name: str
    name: str
    price: float
    url: str
    image: str | None = None
    shipping_cost: float | None = None
    ships_to_colombia: bool | None = None
    shipping_note: str | None = None

    @property
    def total(self) -> float | None:
        if self.shipping_cost is None or self.ships_to_colombia is False:
            return None
        return self.price + self.shipping_cost


@dataclass
class IntlOutcome:
    store_id: str
    store_name: str
    offers: list[IntlOffer]
    error: str | None = None


def parse_market_amount(raw: str) -> float | None:
    """Parse amounts like '608,537.97' or '730,284' from Amazon's Colombia view."""
    cleaned = (
        unescape(raw)
        .replace("COP", "")
        .replace("US$", "")
        .replace("$", "")
        .replace("\xa0", "")
        .replace(" ", "")
    )
    if not cleaned:
        return None
    if "," in cleaned and "." in cleaned:
        if cleaned.rfind(".") > cleaned.rfind(","):
            cleaned = cleaned.replace(",", "")
        else:
            cleaned = cleaned.replace(".", "").replace(",", ".")
    elif "," in cleaned:
        tail = cleaned.split(",")[-1]
        cleaned = cleaned.replace(",", "") if len(tail) == 3 else cleaned.replace(",", ".")
    try:
        amount = float(cleaned)
    except ValueError:
        return None
    if amount <= 0:
        return None
    return amount


def _strip_html(fragment: str) -> str:
    text = re.sub(r"<[^>]+>", " ", fragment)
    return re.sub(r"\s+", " ", unescape(text)).strip()


def amazon_shipping(card_text: str, price: float) -> tuple[bool | None, float | None, str | None]:
    if _BLOCKED_SHIPPING.search(card_text):
        return False, None, "No envía a Colombia"
    conditional = _CONDITIONAL_SHIPPING.search(card_text)
    if conditional:
        threshold = parse_market_amount(conditional.group(1))
        if threshold and price + 0.5 >= threshold:
            return True, 0.0, f"Envío gratis: el producto supera el mínimo de {cop(threshold)}"
        if threshold:
            return (
                True,
                None,
                f"Envío gratis solo desde {cop(threshold)}. El flete de este artículo no está publicado.",
            )
    paid = _PAID_SHIPPING.search(card_text)
    if paid:
        amount = parse_market_amount(paid.group(1))
        if amount is not None:
            return True, amount, None
    if _FREE_SHIPPING.search(card_text):
        return True, 0.0, None
    return None, None, "Amazon no indicó el envío a Colombia en este resultado"


def parse_amazon(html: str, limit: int = LIMIT) -> list[IntlOffer]:
    if "captcha" in html[:8000].lower() and 'data-asin="' not in html:
        raise LookupError("Amazon no publicó resultados legibles")
    chunks = re.split(r'(?=<div role="listitem" data-asin=")', html)
    offers: list[IntlOffer] = []
    seen: set[str] = set()
    for chunk in chunks:
        asin_match = re.search(r'data-asin="([A-Z0-9]{10})"', chunk)
        if not asin_match or 'data-component-type="s-search-result"' not in chunk[:800]:
            continue
        asin = asin_match.group(1)
        if asin in seen:
            continue
        title_match = re.search(r"<h2[^>]*>(.*?)</h2>", chunk, re.DOTALL)
        if not title_match:
            continue
        name = _strip_html(title_match.group(1))
        price_match = re.search(r'a-offscreen">([^<]*COP[^<]*)</span>', chunk)
        if not price_match or not name:
            continue
        price = parse_market_amount(price_match.group(1))
        if price is None:
            continue
        image_match = re.search(r'class="s-image"[^>]*src="(https://[^"]+)"', chunk)
        if not image_match:
            image_match = re.search(r'src="(https://[^"]+)"[^>]*class="s-image"', chunk)
        ships, shipping_cost, note = amazon_shipping(_strip_html(chunk), price)
        seen.add(asin)
        offers.append(
            IntlOffer(
                store_id="amazon",
                store_name="Amazon",
                name=name,
                price=price,
                url=f"https://www.amazon.com/dp/{asin}",
                image=image_match.group(1) if image_match else None,
                shipping_cost=shipping_cost,
                ships_to_colombia=ships,
                shipping_note=note,
            )
        )
        if len(offers) >= limit:
            break
    return offers


def _json_array_after(html: str, marker: str) -> list:
    index = html.find(marker)
    if index < 0:
        raise LookupError("AliExpress no publicó resultados legibles")
    start = html.find("[", index)
    if start < 0:
        raise LookupError("AliExpress no publicó resultados legibles")
    depth = 0
    for position, char in enumerate(html[start:], start):
        if char == "[":
            depth += 1
        elif char == "]":
            depth -= 1
            if depth == 0:
                return json.loads(html[start : position + 1])
    raise LookupError("AliExpress no publicó resultados legibles")


_EBAY_AMOUNT = re.compile(
    r"COP\s*\$?\s*((?:\d{1,3}(?:[\s\xa0]\d{3})+|\d+)(?:[.,]\d{1,2})?)",
    re.IGNORECASE,
)
_EBAY_PAID = re.compile(
    r"\+\s*COP\s*\$?\s*((?:\d{1,3}(?:[\s\xa0]\d{3})+|\d+)(?:[.,]\d{1,2})?)\s*por el env",
    re.IGNORECASE,
)
_EBAY_FREE = re.compile(r"env[ií]o internacional gratis", re.IGNORECASE)
_EBAY_UNSPECIFIED = re.compile(r"env[ií]o no especificado", re.IGNORECASE)


def _ebay_amount(raw: str) -> float | None:
    match = _EBAY_AMOUNT.search(unescape(raw).replace("\xa0", " "))
    if not match:
        return None
    number = match.group(1).replace(" ", "").replace(",", ".")
    try:
        amount = float(number)
    except ValueError:
        return None
    if amount <= 0:
        return None
    return amount


def ebay_shipping(card_text: str) -> tuple[bool | None, float | None, str | None]:
    plain = unescape(card_text).replace("\xa0", " ")
    if _BLOCKED_SHIPPING.search(plain):
        return False, None, "No envía a Colombia"
    paid = _EBAY_PAID.search(plain)
    if paid:
        amount = _ebay_amount("COP " + paid.group(1))
        if amount is not None:
            return True, amount, None
    if _EBAY_FREE.search(plain):
        return True, 0.0, None
    if _EBAY_UNSPECIFIED.search(plain):
        return True, None, "eBay no especificó el costo de envío a Colombia"
    return None, None, "eBay no indicó el envío a Colombia"


def parse_ebay(html: str, limit: int = LIMIT) -> list[IntlOffer]:
    offers: list[IntlOffer] = []
    seen: set[str] = set()
    for chunk in re.split(r'(?=<li class="s-card )', html):
        link = re.search(r"https://(?:www\.)?ebay\.com/itm/(\d+)", chunk)
        if not link:
            continue
        item_id = link.group(1)
        if len(item_id) < 10 or item_id in seen:
            continue
        title = re.search(r"class=s-card__title[^>]*>\s*<span[^>]*>(.*?)</span>", chunk, re.DOTALL)
        if not title:
            continue
        name = re.sub(r"\s+", " ", _strip_html(title.group(1))).strip()
        name = re.sub(r"\s*Se abre en una ventana nueva\s*", "", name).strip()
        if not name or name.lower() == "shop on ebay":
            continue
        price = None
        for raw in re.findall(r's-card__price">([^<]+)', chunk):
            price = _ebay_amount(raw)
            if price is not None:
                break
        if price is None:
            continue
        image = re.search(r"(?:src|data-defer-load)=(https://i\.ebayimg\.com/[^ >]+)", chunk)
        ships, shipping_cost, note = ebay_shipping(chunk)
        seen.add(item_id)
        offers.append(
            IntlOffer(
                store_id="ebay",
                store_name="eBay",
                name=name,
                price=price,
                url=f"https://www.ebay.com/itm/{item_id}",
                image=image.group(1) if image else None,
                shipping_cost=shipping_cost,
                ships_to_colombia=ships,
                shipping_note=note,
            )
        )
        if len(offers) >= limit:
            break
    return offers


def parse_aliexpress(html: str, limit: int = LIMIT) -> list[IntlOffer]:
    if "_____tmd_____" in html:
        raise LookupError("AliExpress pidió una verificación y no publicó precios")
    items = _json_array_after(html, '"itemList":{"content":')
    offers: list[IntlOffer] = []
    for item in items:
        if not isinstance(item, dict) or not item.get("productId"):
            continue
        title = ((item.get("title") or {}).get("displayTitle") or "").strip()
        sale = ((item.get("prices") or {}).get("salePrice") or {})
        try:
            price = float(sale.get("minPrice"))
        except (TypeError, ValueError):
            continue
        if not title or price <= 0:
            continue
        image = ((item.get("image") or {}).get("imgUrl") or "")
        if image.startswith("//"):
            image = "https:" + image
        product_id = str(item["productId"])
        offers.append(
            IntlOffer(
                store_id="aliexpress",
                store_name="AliExpress",
                name=title,
                price=price,
                url=f"https://es.aliexpress.com/item/{product_id}.html",
                image=image or None,
                shipping_cost=None,
                ships_to_colombia=True,
                shipping_note="Precio del producto para Colombia. El flete no viene en el listado.",
            )
        )
        if len(offers) >= limit:
            break
    return offers


def _offer_payload(offer: IntlOffer, score: float) -> dict:
    return {
        "store_id": offer.store_id,
        "store_name": offer.store_name,
        "name": offer.name,
        "price": offer.price,
        "shipping_cost": offer.shipping_cost,
        "shipping_known": offer.shipping_cost is not None and offer.ships_to_colombia is not False,
        "ships_to_colombia": offer.ships_to_colombia,
        "shipping_note": offer.shipping_note,
        "total": offer.total,
        "url": offer.url,
        "image": offer.image,
        "relevance": round(score, 2),
    }


def _verdict(query: str, offers: list[tuple[IntlOffer, float]]) -> dict | None:
    if not offers:
        return None
    pool = [item for item in offers if item[0].ships_to_colombia is not False]
    if not pool:
        return None
    known = [item for item in pool if item[0].total is not None]
    unknown = [item for item in pool if item[0].total is None]
    if known:
        winner, _score = min(known, key=lambda item: (item[0].total or 0, item[0].price))
        shipping = winner.shipping_cost or 0
        ship_text = "envío gratis" if shipping == 0 else f"envío {cop(shipping)}"
        detail = (
            f"{winner.name} cuesta {cop(winner.price)} más {ship_text} a Colombia. "
            f"El costo publicado es {cop(winner.total or winner.price)}."
        )
        if winner.shipping_note:
            detail += f" {winner.shipping_note}."
        cheaper = [item[0] for item in unknown if item[0].price + 0.5 < (winner.total or winner.price)]
        if cheaper:
            other = min(cheaper, key=lambda offer: offer.price)
            detail += (
                f" {other.store_name} muestra {other.name} a {cop(other.price)}, "
                "pero sin el flete, así que no entra en el costo final."
            )
        return {
            "store_id": winner.store_id,
            "store_name": winner.store_name,
            "name": winner.name,
            "price": winner.price,
            "shipping_cost": winner.shipping_cost,
            "shipping_known": True,
            "total": winner.total,
            "url": winner.url,
            "image": winner.image,
            "kicker": "Menor costo con envío a Colombia",
            "headline": f"El menor costo a Colombia está en {winner.store_name}",
            "detail": detail,
        }

    winner, _score = min(pool, key=lambda item: item[0].price)
    return {
        "store_id": winner.store_id,
        "store_name": winner.store_name,
        "name": winner.name,
        "price": winner.price,
        "shipping_cost": None,
        "shipping_known": False,
        "total": None,
        "url": winner.url,
        "image": winner.image,
        "kicker": "Menor precio del producto",
        "headline": f"El menor precio del producto está en {winner.store_name}",
        "detail": (
            f"{winner.name} sale a {cop(winner.price)}. "
            "Ninguna tienda publicó el flete de este resultado, así que falta el costo de transporte a Colombia."
        ),
    }


def build_international_report(query: str, outcomes: list[IntlOutcome]) -> dict:
    collected: list[IntlOffer] = []
    for outcome in outcomes:
        collected.extend(outcome.offers)
    threshold = required_match_ratio(query)
    scored = [(offer, relevance(query, offer.name)) for offer in collected]
    strict = [item for item in scored if item[1] + 1e-9 >= threshold]
    relaxed = False
    if not strict and scored:
        relaxed = True
        strict = [item for item in scored if item[1] >= 0.5] or scored
    strict.sort(key=lambda item: (item[0].total is None, item[0].total or item[0].price, item[0].price))
    strict = strict[:12]
    return {
        "query": query,
        "relaxed": relaxed,
        "verdict": _verdict(query, strict),
        "offers": [_offer_payload(offer, score) for offer, score in strict],
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


def _short_error(store_name: str, exc: Exception) -> str:
    if isinstance(exc, httpx.TimeoutException):
        return f"{store_name} tardó demasiado"
    if isinstance(exc, httpx.HTTPStatusError):
        return f"{store_name} respondió {exc.response.status_code}"
    message = str(exc).strip() or exc.__class__.__name__
    return message[:160]


async def _search_amazon(client: httpx.AsyncClient, query: str) -> list[IntlOffer]:
    response = await client.get(
        "https://www.amazon.com/s",
        params={"k": query},
        headers={"Accept": "text/html", "Accept-Language": "es-CO,es;q=0.9"},
    )
    response.raise_for_status()
    return parse_amazon(response.text)


async def _search_aliexpress(client: httpx.AsyncClient, query: str) -> list[IntlOffer]:
    slug = re.sub(r"[^a-z0-9]+", "-", strip_accents(query).lower()).strip("-") or "producto"
    response = await client.get(
        f"https://www.aliexpress.com/w/wholesale-{slug}.html",
        headers={
            "Accept": "text/html",
            "Accept-Language": "es-CO,es;q=0.9",
            "Cookie": ALI_COOKIE,
        },
    )
    response.raise_for_status()
    return parse_aliexpress(response.text)


async def _search_ebay(client: httpx.AsyncClient, query: str) -> list[IntlOffer]:
    # eBay sets its own cookies across a few tries, so this search uses a separate session.
    del client
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "text/html",
        "Accept-Language": "es-CO,es;q=0.9",
    }
    params = {"_nkw": query, "_fcid": "46"}
    saw_check = False
    last_status = 0
    async with httpx.AsyncClient(timeout=httpx.Timeout(20.0, connect=5.0), follow_redirects=True) as ebay:
        for _attempt in range(12):
            response = await ebay.get("https://www.ebay.com/sch/i.html", params=params, headers=headers)
            last_status = response.status_code
            body = response.text
            if "s-card__price" in body:
                offers = parse_ebay(body)
                if offers:
                    return offers
                raise LookupError("eBay no publicó precios en pesos para Colombia")
            if "interrupci" in body or "Comprobación del navegador" in body:
                saw_check = True
    if saw_check or last_status == 403:
        raise LookupError("eBay pidió una verificación en el navegador y no publicó precios")
    raise LookupError("eBay no publicó un listado de precios legible")


async def _run(store_id: str, store_name: str, coro) -> IntlOutcome:
    try:
        offers = await coro
        return IntlOutcome(store_id, store_name, offers)
    except LookupError as exc:
        return IntlOutcome(store_id, store_name, [], _short_error(store_name, exc))
    except Exception as exc:
        logger.warning("Fallo buscando en %s", store_name, exc_info=exc)
        return IntlOutcome(store_id, store_name, [], _short_error(store_name, exc))


async def search_international(query: str) -> list[IntlOutcome]:
    timeout = httpx.Timeout(20.0, connect=5.0)
    async with httpx.AsyncClient(
        timeout=timeout,
        headers={"User-Agent": USER_AGENT},
        follow_redirects=True,
    ) as client:
        outcomes = await asyncio.gather(
            _run("amazon", "Amazon", _search_amazon(client, query)),
            _run("aliexpress", "AliExpress", _search_aliexpress(client, query)),
            _run("ebay", "eBay", _search_ebay(client, query)),
        )
    return list(outcomes)
