from __future__ import annotations

import asyncio
import base64
import json
import logging
import re
import time
from dataclasses import dataclass
from urllib.parse import quote

import httpx

from app.cities import City
from app.models import Offer, StoreOutcome
from app.normalize import clean_ean, parse_cop
from app.payments import algolia_store_payment, falabella_cmr, vtex_store_payment

logger = logging.getLogger(__name__)

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)
LIMIT = 8
_ALGOLIA_TTL = 6 * 60 * 60
_algolia_cache: dict[str, tuple[float, tuple[str, str, str]]] = {}


@dataclass(frozen=True)
class VtexStore:
    id: str
    name: str
    kind: str
    site: str
    api_root: str


@dataclass(frozen=True)
class AlgoliaStore:
    id: str
    name: str
    kind: str
    site: str
    home_url: str


@dataclass(frozen=True)
class FalabellaStore:
    id: str
    name: str
    kind: str
    site: str


_REGION_TTL = 6 * 60 * 60
_region_cache: dict[tuple[str, str], tuple[float, str | None]] = {}


STORES: list[VtexStore | AlgoliaStore | FalabellaStore] = [
    VtexStore("exito", "Éxito", "supermercado", "https://www.exito.com", "https://www.exito.com/io"),
    VtexStore("carulla", "Carulla", "supermercado", "https://www.carulla.com", "https://www.carulla.com/io"),
    VtexStore("jumbo", "Jumbo", "supermercado", "https://www.jumbocolombia.com", "https://www.jumbocolombia.com"),
    VtexStore("olimpica", "Olímpica", "supermercado", "https://www.olimpica.com", "https://www.olimpica.com"),
    VtexStore("d1", "D1", "supermercado", "https://www.d1.com.co", "https://www.d1.com.co"),
    AlgoliaStore("alkosto", "Alkosto", "tecnologia", "https://www.alkosto.com", "https://www.alkosto.com/"),
    AlgoliaStore("ktronix", "Ktronix", "tecnologia", "https://www.ktronix.com", "https://www.ktronix.com/"),
    FalabellaStore("falabella", "Falabella", "tecnologia", "https://www.falabella.com.co"),
    VtexStore("easy", "Easy", "hogar", "https://www.easy.com.co", "https://www.easy.com.co"),
]


def store_catalog() -> list[dict[str, str]]:
    return [{"id": store.id, "name": store.name, "kind": store.kind} for store in STORES]


def _absolute(site: str, link: str | None, link_text: str | None) -> str:
    if link and link.startswith("http"):
        return link
    if link and link.startswith("/"):
        return site.rstrip("/") + link
    if link_text:
        return f"{site.rstrip('/')}/{link_text}/p"
    return site


def _seller_price(seller: dict) -> tuple[float, float | None] | None:
    commercial = seller.get("commertialOffer") or {}
    try:
        price = float(commercial.get("Price") or 0)
    except (TypeError, ValueError):
        return None
    if price <= 0:
        return None
    available = commercial.get("IsAvailable")
    quantity = commercial.get("AvailableQuantity")
    if available is False:
        return None
    if quantity is not None and quantity <= 0 and available is not True:
        return None
    list_price = commercial.get("ListPrice")
    try:
        parsed_list = float(list_price) if list_price else None
    except (TypeError, ValueError):
        parsed_list = None
    if parsed_list and parsed_list <= price:
        parsed_list = None
    return price, parsed_list


def parse_vtex(payload: object, store: VtexStore, limit: int = LIMIT) -> list[Offer]:
    if not isinstance(payload, list):
        return []
    offers: list[Offer] = []
    for product in payload:
        if not isinstance(product, dict):
            continue
        product_name = str(product.get("productName") or "").strip()
        if not product_name:
            continue
        categories = [str(item) for item in product.get("categories") or []]
        brand = product.get("brand") or None
        chosen: tuple[float, float | None, dict, dict] | None = None
        for item in product.get("items") or []:
            if not isinstance(item, dict):
                continue
            for seller in item.get("sellers") or []:
                priced = _seller_price(seller)
                if priced is None:
                    continue
                price, list_price = priced
                if chosen is None or price < chosen[0]:
                    chosen = (price, list_price, item, seller.get("commertialOffer") or {})
        if chosen is None:
            continue
        price, list_price, item, commercial = chosen
        payment_label, payment_price = vtex_store_payment(store.id, price, commercial)
        image = None
        images = item.get("images") or []
        if images and isinstance(images[0], dict):
            image = images[0].get("imageUrl")
        offers.append(
            Offer(
                store_id=store.id,
                store_name=store.name,
                name=product_name,
                brand=str(brand) if brand else None,
                price=price,
                list_price=list_price,
                url=_absolute(store.site, product.get("link"), product.get("linkText")),
                image=image,
                ean=clean_ean(item.get("ean")),
                categories=categories,
                payment_label=payment_label,
                payment_price=payment_price,
            )
        )
        if len(offers) >= limit:
            break
    return offers


def parse_algolia_config(html: str) -> tuple[str, str, str]:
    app_ids = re.findall(r"app(?:lication)?Id[\"']?\s*[:=]\s*[\"']([A-Z0-9]{8,12})[\"']", html)
    keys = re.findall(r"apiKey[\"']?\s*[:=]\s*[\"']([A-Za-z0-9+/=]{40,})[\"']", html)
    indexes = re.findall(r"indexName[\"']?\s*[:=]\s*[\"']([A-Za-z0-9_]{6,})[\"']", html)
    indexes = [name for name in indexes if "index" in name.lower() or "prd" in name.lower()]
    if not app_ids or not keys or not indexes:
        raise LookupError("El buscador de la tienda no publicó su configuración")
    index = next((name for name in indexes if "PRD" in name), indexes[-1])
    return app_ids[0], keys[0], index


def parse_algolia(payload: object, store: AlgoliaStore, limit: int = LIMIT) -> list[Offer]:
    hits = payload.get("hits") if isinstance(payload, dict) else None
    if not isinstance(hits, list):
        return []
    offers: list[Offer] = []
    for hit in hits:
        if not isinstance(hit, dict):
            continue
        name = str(hit.get("name_text_es") or "").strip()
        price = hit.get("lowestprice_double") or hit.get("discountprice_double") or hit.get("pricevalue_cop_double")
        try:
            amount = float(price)
        except (TypeError, ValueError):
            continue
        if amount <= 0 or not name:
            continue
        in_stock = hit.get("instockflag_boolean")
        status = str(hit.get("stocklevelstatus_string") or "")
        if in_stock is False or status.lower() == "outofstock":
            continue
        brands = hit.get("brand_string_mv") or []
        brand = brands[0] if isinstance(brands, list) and brands else None
        categories = [str(item) for item in hit.get("categoryname_text_es_mv") or []]
        list_price = hit.get("pricevalue_cop_double")
        try:
            parsed_list = float(list_price) if list_price else None
        except (TypeError, ValueError):
            parsed_list = None
        if parsed_list and parsed_list <= amount:
            parsed_list = None
        payment_label, payment_price = algolia_store_payment(hit.get("paymentpromotion_text_mv") or [], amount)
        offers.append(
            Offer(
                store_id=store.id,
                store_name=store.name,
                name=name,
                brand=str(brand) if brand else None,
                price=amount,
                list_price=parsed_list,
                url=_absolute(store.site, hit.get("url_es_string"), None),
                image=hit.get("img-310wx310h_string"),
                ean=clean_ean(hit.get("code_string"), min_length=12),
                categories=categories,
                payment_label=payment_label,
                payment_price=payment_price,
            )
        )
        if len(offers) >= limit:
            break
    return offers


def _falabella_prices(prices: list) -> tuple[float, float | None, float | None] | None:
    current: float | None = None
    regular: float | None = None
    for entry in prices:
        if not isinstance(entry, dict):
            continue
        raw = entry.get("price") or []
        if not raw:
            continue
        amount = parse_cop(str(raw[0]))
        if amount is None:
            continue
        kind = str(entry.get("type") or "")
        crossed = bool(entry.get("crossed"))
        if crossed or kind == "normalPrice":
            if regular is None or amount > regular:
                regular = amount
            continue
        if kind == "cmrPrice":
            continue
        if current is None or amount < current:
            current = amount
    if current is None:
        return None
    if regular and regular <= current:
        regular = None
    return current, regular, falabella_cmr(prices)


def parse_falabella(html: str, store: FalabellaStore, limit: int = LIMIT) -> list[Offer]:
    marker = '<script id="__NEXT_DATA__"'
    start = html.find(marker)
    if start < 0:
        raise LookupError("Falabella no devolvió resultados legibles")
    start = html.find(">", start) + 1
    end = html.find("</script>", start)
    if end < 0:
        raise LookupError("Falabella no devolvió resultados legibles")
    data = json.loads(html[start:end])
    results = data.get("props", {}).get("pageProps", {}).get("results") or []
    offers: list[Offer] = []
    for product in results:
        if not isinstance(product, dict):
            continue
        priced = _falabella_prices(product.get("prices") or [])
        if priced is None:
            continue
        price, list_price, cmr_price = priced
        name = str(product.get("displayName") or "").strip()
        if not name:
            continue
        media = product.get("mediaUrls") or []
        brand = product.get("brand")
        offers.append(
            Offer(
                store_id=store.id,
                store_name=store.name,
                name=name,
                brand=str(brand) if brand else None,
                price=price,
                list_price=list_price,
                url=str(product.get("url") or store.site),
                image=media[0] if media else None,
                ean=None,
                categories=[],
                payment_label="Tarjeta CMR" if cmr_price else None,
                payment_price=cmr_price,
            )
        )
        if len(offers) >= limit:
            break
    return offers


def _short_error(store_name: str, exc: Exception) -> str:
    if isinstance(exc, httpx.TimeoutException):
        return f"{store_name} tardó demasiado"
    if isinstance(exc, httpx.HTTPStatusError):
        return f"{store_name} respondió {exc.response.status_code}"
    message = str(exc).strip() or exc.__class__.__name__
    return f"{store_name}: {message[:140]}"


async def _algolia_config(client: httpx.AsyncClient, home_url: str) -> tuple[str, str, str]:
    cached = _algolia_cache.get(home_url)
    now = time.time()
    if cached and now - cached[0] < _ALGOLIA_TTL:
        return cached[1]
    response = await client.get(home_url, headers={"Accept": "text/html"})
    response.raise_for_status()
    config = parse_algolia_config(response.text)
    _algolia_cache[home_url] = (now, config)
    return config


def vtex_segment(region_id: str) -> str:
    payload = {
        "campaigns": None,
        "channel": "1",
        "priceTables": None,
        "regionId": region_id,
        "utm_campaign": None,
        "utm_source": None,
        "utmi_campaign": None,
        "currencyCode": "COP",
        "currencySymbol": "$",
        "countryCode": "COL",
        "cultureInfo": "es-CO",
        "channelPrivacy": "public",
    }
    raw = json.dumps(payload, separators=(",", ":")).encode()
    return base64.b64encode(raw).decode()


async def _region_id(client: httpx.AsyncClient, store: VtexStore, city: City) -> str | None:
    key = (store.site, city.postal_code)
    cached = _region_cache.get(key)
    now = time.time()
    if cached and now - cached[0] < _REGION_TTL:
        return cached[1]
    response = await client.get(
        f"{store.site}/api/checkout/pub/regions",
        params={"country": "COL", "postalCode": city.postal_code},
        headers={"Accept": "application/json"},
    )
    response.raise_for_status()
    payload = response.json()
    region_id = None
    if isinstance(payload, list) and payload and isinstance(payload[0], dict):
        sellers = payload[0].get("sellers") or []
        candidate = str(payload[0].get("id") or "").strip()
        if sellers and candidate:
            region_id = candidate
    _region_cache[key] = (now, region_id)
    return region_id


async def _search_vtex(client: httpx.AsyncClient, store: VtexStore, query: str, city: City) -> list[Offer]:
    region_id = await _region_id(client, store, city)
    if not region_id:
        raise LookupError(f"no publica precios para {city.name}")
    url = f"{store.api_root}/api/catalog_system/pub/products/search/{quote(query)}"
    response = await client.get(
        url,
        params={"_from": 0, "_to": LIMIT - 1},
        headers={"Accept": "application/json", "Cookie": f"vtex_segment={vtex_segment(region_id)}"},
    )
    response.raise_for_status()
    return parse_vtex(response.json(), store)


async def _search_algolia(client: httpx.AsyncClient, store: AlgoliaStore, query: str) -> list[Offer]:
    app_id, api_key, index = await _algolia_config(client, store.home_url)
    url = f"https://{app_id.lower()}-dsn.algolia.net/1/indexes/{index}/query"
    response = await client.post(
        url,
        headers={
            "X-Algolia-Application-Id": app_id,
            "X-Algolia-API-Key": api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        json={
            "query": query,
            "hitsPerPage": LIMIT,
            "attributesToHighlight": [],
            "attributesToRetrieve": [
                "name_text_es",
                "brand_string_mv",
                "lowestprice_double",
                "discountprice_double",
                "pricevalue_cop_double",
                "url_es_string",
                "img-310wx310h_string",
                "code_string",
                "instockflag_boolean",
                "stocklevelstatus_string",
                "categoryname_text_es_mv",
                "paymentpromotion_text_mv",
            ],
        },
    )
    response.raise_for_status()
    return parse_algolia(response.json(), store)


async def _search_falabella(client: httpx.AsyncClient, store: FalabellaStore, query: str) -> list[Offer]:
    response = await client.get(
        f"{store.site}/falabella-co/search",
        params={"Ntt": query},
        headers={"Accept": "text/html"},
    )
    response.raise_for_status()
    return parse_falabella(response.text, store)



async def _run_store(
    client: httpx.AsyncClient,
    store: VtexStore | AlgoliaStore | FalabellaStore,
    query: str,
    city: City,
) -> StoreOutcome:
    try:
        if isinstance(store, VtexStore):
            offers = await _search_vtex(client, store, query, city)
        elif isinstance(store, AlgoliaStore):
            offers = await _search_algolia(client, store, query)
        else:
            offers = await _search_falabella(client, store, query)
        return StoreOutcome(store.id, store.name, store.kind, offers)
    except Exception as exc:
        logger.warning("Fallo buscando en %s", store.name, exc_info=exc)
        return StoreOutcome(store.id, store.name, store.kind, [], _short_error(store.name, exc))


async def search_stores(query: str, city: City) -> list[StoreOutcome]:
    timeout = httpx.Timeout(12.0, connect=5.0)
    async with httpx.AsyncClient(
        timeout=timeout,
        headers={"User-Agent": USER_AGENT, "Accept-Language": "es-CO,es;q=0.9"},
        follow_redirects=True,
    ) as client:
        outcomes = await asyncio.gather(*[_run_store(client, store, query, city) for store in STORES])
    return list(outcomes)
