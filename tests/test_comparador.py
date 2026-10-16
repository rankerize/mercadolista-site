from app.international import (
    IntlOffer,
    IntlOutcome,
    amazon_shipping,
    build_international_report,
    parse_amazon,
    parse_aliexpress,
    parse_ebay,
    parse_market_amount,
)
from app.models import Offer, StoreOutcome
from app.normalize import clean_ean, cop, parse_cop, relevance, sale_measure, unit_price
from app.units import build_unit_report
from app.payments import algolia_store_payment, falabella_cmr, vtex_store_payment
from app.cities import find_city
from app.providers import VtexStore, parse_algolia_config, parse_vtex, store_catalog, vtex_segment
from app.ranking import build_report
from app.shopping import _merge_outcomes, build_list_report, make_item


def offer(**kwargs) -> Offer:
    data = {
        "store_id": "jumbo",
        "store_name": "Jumbo",
        "name": "Leche entera Colanta 1100 ml",
        "brand": "Colanta",
        "price": 4500,
        "list_price": None,
        "url": "https://www.jumbocolombia.com/leche/p",
        "image": None,
        "ean": "7702129001052",
        "categories": ["Mercado", "Lacteos"],
    }
    data.update(kwargs)
    return Offer(**data)


def test_parse_cop_and_ean():
    assert parse_cop("3.999.900") == 3999900
    assert parse_cop("$ 2.190") == 2190
    assert clean_ean("7702129001052") == "7702129001052"
    assert clean_ean("123") is None
    assert cop(2190) == "$ 2.190"


def test_televisor_matches_tv_name():
    score = relevance("televisor 55", 'TV TCL 55" Pulgadas QLED', "TCL")
    assert score == 1


def test_unit_price_for_milliliters_and_pack():
    single = unit_price("Leche Entera Colanta x200ml", 2000)
    assert single["per"] == "L"
    assert single["amount"] == 10000
    pack = unit_price("Leche Alqueria 1.3L x 6 unds", 7800)
    assert pack["per"] == "L"
    assert pack["amount"] == 1000


def test_sale_measure_counts_units_and_grams():
    eggs = sale_measure("Canasta de 30 huevos", 15000)
    assert eggs["per"] == "unidad"
    assert eggs["amount"] == 500
    pack = sale_measure("Leche entera x 6 unidades", 18000)
    assert pack["amount"] == 3000
    rice = sale_measure("Arroz Roa 500 g", 2500)
    assert rice["per"] == "gramo"
    assert rice["amount"] == 5
    kilo = sale_measure("Arroz Roa 1 kg", 4000)
    assert kilo["amount"] == 4
    assert sale_measure("Arroz x 500 g", 2500)["per"] == "gramo"
    assert sale_measure("Arroz Estándar Albar 500 Grs", 1650)["amount"] == 3.3
    bulk = sale_measure("Diana ARROZ X 5.000 G.", 18990)
    assert bulk["basis"] == "gramo"
    assert bulk["quantity"] == 5000
    pack = sale_measure("Diana Arroz 25 UN. X 500 G.", 47990)
    assert pack["basis"] == "unidad"
    assert pack["quantity"] == 25


def test_unit_report_prefers_cheaper_piece_over_cheaper_pack():
    outcomes = [
        StoreOutcome(
            "jumbo",
            "Jumbo",
            "supermercado",
            [offer(name="Huevos AA x 30 und", price=15000, url="https://www.jumbocolombia.com/huevos-30", ean=None)],
        ),
        StoreOutcome(
            "exito",
            "Éxito",
            "supermercado",
            [offer(store_id="exito", store_name="Éxito", name="Huevos AA x 12 und", price=7200, url="https://www.exito.com/huevos-12", ean=None)],
        ),
    ]
    report = build_unit_report("huevos", outcomes)
    assert report["verdict"]["store_name"] == "Jumbo"
    assert report["verdict"]["unit_price"] == 500
    assert report["offers"][0]["unit_price"] == 500
    assert report["offers"][1]["unit_price"] == 600


def test_unit_report_keeps_the_cheapest_gram_even_without_category():
    outcomes = [
        StoreOutcome(
            "olimpica",
            "Olímpica",
            "supermercado",
            [offer(store_id="olimpica", store_name="Olímpica", name="Arroz Mi Arroz 454 g", price=1300, url="https://www.olimpica.com/arroz-454", ean=None, categories=["Abarrotes"])],
        ),
        StoreOutcome(
            "carulla",
            "Carulla",
            "supermercado",
            [offer(store_id="carulla", store_name="Carulla", name="Arroz blanco 2500 g", price=8150, url="https://www.carulla.com/arroz-2500", ean=None, categories=["Arroz"])],
        ),
    ]
    report = build_unit_report("arroz", outcomes)
    assert report["verdict"]["store_name"] == "Olímpica"
    assert report["verdict"]["unit_price"] == round(1300 / 454, 4)
    assert report["offers"][0]["store_name"] == "Olímpica"


def test_unit_report_uses_cheaper_card_price():
    outcomes = [
        StoreOutcome(
            "jumbo",
            "Jumbo",
            "supermercado",
            [
                offer(
                    name="Huevos AA x 30 und",
                    price=18000,
                    payment_label="Tarjeta Cencosud",
                    payment_price=13500,
                    url="https://www.jumbocolombia.com/huevos-30",
                    ean=None,
                )
            ],
        ),
        StoreOutcome(
            "exito",
            "Éxito",
            "supermercado",
            [
                offer(
                    store_id="exito",
                    store_name="Éxito",
                    name="Huevos AA x 30 und",
                    price=15000,
                    url="https://www.exito.com/huevos-30",
                    ean=None,
                )
            ],
        ),
    ]
    report = build_unit_report("huevos", outcomes)
    assert report["verdict"]["store_name"] == "Jumbo"
    assert report["verdict"]["unit_price"] == 450
    assert report["verdict"]["from_card"] is True
    assert [row["unit_price"] for row in report["offers"]] == [450, 500]
    assert "Tarjeta Cencosud" in report["verdict"]["detail"]


def test_same_barcode_picks_cheapest_store():
    outcomes = [
        StoreOutcome(
            "exito",
            "Éxito",
            "supermercado",
            [offer(store_id="exito", store_name="Éxito", price=5200, url="https://www.exito.com/leche/p")],
        ),
        StoreOutcome(
            "jumbo",
            "Jumbo",
            "supermercado",
            [offer(price=4500)],
        ),
        StoreOutcome(
            "olimpica",
            "Olímpica",
            "supermercado",
            [
                offer(
                    store_id="olimpica",
                    store_name="Olímpica",
                    price=6100,
                    url="https://www.olimpica.com/leche/p",
                    name="Juguete cocina arroz",
                    ean="9990001112228",
                    categories=["Juguetes"],
                )
            ],
        ),
    ]
    report = build_report("leche colanta", outcomes)
    assert report["verdict"]["store_name"] == "Jumbo"
    assert report["verdict"]["price"] == 4500
    assert report["verdict"]["same_product"] is True
    assert "Jumbo cobra $ 4.500" in report["verdict"]["detail"]
    assert [item["store_name"] for item in report["same_product"]["offers"]] == ["Jumbo", "Éxito"]


def test_tied_price_mentions_every_store():
    outcomes = [
        StoreOutcome(
            "exito",
            "Éxito",
            "supermercado",
            [offer(store_id="exito", store_name="Éxito", price=16720, url="https://www.exito.com/arroz/p")],
        ),
        StoreOutcome(
            "carulla",
            "Carulla",
            "supermercado",
            [offer(store_id="carulla", store_name="Carulla", price=16720, url="https://www.carulla.com/arroz/p")],
        ),
    ]
    report = build_report("leche colanta", outcomes)
    assert report["verdict"]["headline"] == "El mejor precio está en Éxito y Carulla"
    assert "por debajo" not in report["verdict"]["detail"]


def test_category_beats_cheaper_unrelated_product():
    outcomes = [
        StoreOutcome(
            "exito",
            "Éxito",
            "supermercado",
            [
                offer(
                    store_id="exito",
                    store_name="Éxito",
                    name="Minichefs modelo arroz",
                    brand="Multitech",
                    price=15000,
                    url="https://www.exito.com/juguete/p",
                    ean=None,
                    categories=["Juguetes", "Cocina de juguete"],
                ),
                offer(
                    store_id="exito",
                    store_name="Éxito",
                    name="Arroz Roa blanco 500 g",
                    brand="Roa",
                    price=3200,
                    url="https://www.exito.com/arroz/p",
                    ean="7701234567890",
                    categories=["Mercado", "Despensa", "Arroz"],
                ),
            ],
        )
    ]
    report = build_report("arroz", outcomes)
    assert report["verdict"]["name"] == "Arroz Roa blanco 500 g"
    assert report["verdict"]["same_product"] is False


def test_vtex_parser_uses_available_seller_price():
    store = VtexStore("jumbo", "Jumbo", "supermercado", "https://www.jumbocolombia.com", "https://www.jumbocolombia.com")
    payload = [
        {
            "productName": "Arroz Roa 500 g",
            "brand": "Roa",
            "link": "https://www.jumbocolombia.com/arroz-roa/p",
            "categories": ["/Mercado/Arroz/"],
            "items": [
                {
                    "ean": "7701234567890",
                    "images": [{"imageUrl": "https://img.example/arroz.jpg"}],
                    "sellers": [
                        {"commertialOffer": {"Price": 0, "ListPrice": 4000, "IsAvailable": False, "AvailableQuantity": 0}},
                        {"commertialOffer": {"Price": 3500, "ListPrice": 4000, "IsAvailable": True, "AvailableQuantity": 4}},
                    ],
                }
            ],
        }
    ]
    parsed = parse_vtex(payload, store)
    assert len(parsed) == 1
    assert parsed[0].price == 3500
    assert parsed[0].list_price == 4000
    assert parsed[0].ean == "7701234567890"
    assert parsed[0].payment_label is None


def test_jumbo_cencosud_teaser_lowers_the_card_price():
    label, card_price = vtex_store_payment(
        "jumbo",
        100000,
        {
            "Installments": [
                {
                    "NumberOfInstallments": 1,
                    "PaymentSystemName": "Tarjeta Cencosud",
                    "TotalValuePlusInterestRate": 100000,
                },
                {
                    "NumberOfInstallments": 1,
                    "PaymentSystemName": "Visa",
                    "TotalValuePlusInterestRate": 90000,
                },
            ],
            "Teasers": [
                {
                    "<Name>k__BackingField": "T. INT COD 10 CODENS A",
                    "<Effects>k__BackingField": {
                        "<Parameters>k__BackingField": [
                            {"<Name>k__BackingField": "PercentualDiscount", "<Value>k__BackingField": "10"}
                        ]
                    },
                },
                {
                    "<Name>k__BackingField": "T. INT TMC 10 ELECTRO",
                    "<Effects>k__BackingField": {
                        "<Parameters>k__BackingField": [
                            {"<Name>k__BackingField": "PercentualDiscount", "<Value>k__BackingField": "10"}
                        ]
                    },
                },
            ],
        },
    )
    assert label == "Tarjeta Cencosud"
    assert card_price == 90000


def test_exito_card_keeps_the_same_price_when_there_is_no_discount():
    label, card_price = vtex_store_payment(
        "exito",
        5400,
        {
            "Installments": [
                {
                    "NumberOfInstallments": 1,
                    "PaymentSystemName": "Tarjeta Éxito y Carulla",
                    "TotalValuePlusInterestRate": 5400,
                }
            ],
            "Teasers": [],
        },
    )
    assert label == "Tarjeta Éxito"
    assert card_price == 5400


def test_alkosto_and_falabella_card_prices():
    label, amount = algolia_store_payment(
        ["tarjeta_alkosto:$1.449.900:/medias/tarjeta-alkosto.png"],
        1599900,
    )
    assert label == "Tarjeta Alkosto"
    assert amount == 1449900
    assert falabella_cmr([
        {"type": "cmrPrice", "price": ["1.499.900"]},
        {"type": "internetPrice", "price": ["1.699.900"]},
    ]) == 1499900


def test_card_price_can_beat_another_stores_normal_price():
    outcomes = [
        StoreOutcome(
            "jumbo",
            "Jumbo",
            "supermercado",
            [offer(price=4500, payment_label="Tarjeta Cencosud", payment_price=4000)],
        ),
        StoreOutcome(
            "exito",
            "Éxito",
            "supermercado",
            [offer(
                store_id="exito",
                store_name="Éxito",
                price=4200,
                url="https://www.exito.com/leche/p",
                payment_label="Tarjeta Éxito y Carulla",
                payment_price=4200,
            )],
        ),
    ]
    report = build_report("leche colanta", outcomes)
    assert report["verdict"]["store_name"] == "Éxito"
    assert "Tarjeta Cencosud en Jumbo queda en $ 4.000" in report["verdict"]["payment_note"]
    assert "por debajo del precio normal de Éxito" in report["verdict"]["payment_note"]


def test_headphone_words_count_as_the_same_product():
    assert relevance("audifonos bluetooth", "Samsung Galaxy Buds Bluetooth 5.4") == 1


def test_market_amount_and_amazon_shipping():
    assert parse_market_amount("COP\xa0608,537.97") == 608537.97
    assert parse_market_amount("730,284") == 730284
    ships, cost, _note = amazon_shipping("Entrega GRATIS el jue, 22 de oct a Colombia", 100000)
    assert ships is True and cost == 0
    ships, cost, _note = amazon_shipping("Entrega por COP 34,560.37 el jue, 22 de oct", 100000)
    assert ships is True and cost == 34560.37
    ships, cost, note = amazon_shipping(
        "Entrega GRATIS el jue, 22 de oct a Colombia en US$35 (COP 112,105) de artículos elegibles",
        50000,
    )
    assert ships is True and cost is None
    assert "112.105" in note


def test_international_report_prefers_known_shipping_total():
    amazon = IntlOffer(
        "amazon",
        "Amazon",
        "Audífonos Bluetooth Sony",
        price=120000,
        url="https://www.amazon.com/dp/B000TEST01",
        shipping_cost=10000,
        ships_to_colombia=True,
    )
    ali = IntlOffer(
        "aliexpress",
        "AliExpress",
        "Audífonos Bluetooth genéricos",
        price=30000,
        url="https://es.aliexpress.com/item/1.html",
        ships_to_colombia=True,
        shipping_note="Precio del producto para Colombia. El flete no viene en el listado.",
    )
    report = build_international_report(
        "audífonos bluetooth",
        [
            IntlOutcome("amazon", "Amazon", [amazon]),
            IntlOutcome("aliexpress", "AliExpress", [ali]),
        ],
    )
    assert report["verdict"]["store_name"] == "Amazon"
    assert report["verdict"]["total"] == 130000
    assert "sin el flete" in report["verdict"]["detail"]


def test_parse_amazon_and_aliexpress_snippets():
    amazon_html = """
    <div role="listitem" data-asin="B000TEST01" data-component-type="s-search-result">
      <h2><span>Audífonos Bluetooth Sony</span></h2>
      <span class="a-offscreen">COP 120,000.00</span>
      <img class="s-image" src="https://images.example/a.jpg">
      Entrega GRATIS el jue, 22 de oct a Colombia
    </div>
    """
    parsed = parse_amazon(amazon_html)
    assert parsed[0].price == 120000
    assert parsed[0].shipping_cost == 0
    assert parsed[0].url.endswith("/dp/B000TEST01")

    ali_html = """
    "itemList":{"content":[{"productId":"99","title":{"displayTitle":"Audífonos Bluetooth HTC"},
    "prices":{"salePrice":{"minPrice":31080,"currencyCode":"COP"}},
    "image":{"imgUrl":"//ae-pic.example/a.jpg"}}]}
    """
    ali = parse_aliexpress(ali_html)
    assert ali[0].price == 31080
    assert ali[0].ships_to_colombia is True
    assert ali[0].shipping_cost is None
    assert ali[0].url == "https://es.aliexpress.com/item/99.html"


def test_parse_ebay_colombia_shipping():
    html = """
    <li class="s-card s-card--horizontal">
      <a href=https://www.ebay.com/itm/332818233766?hash=item>
      <img class=s-card__image src=https://i.ebayimg.com/images/g/abc/s-l140.jpg>
      <div class=s-card__title><span class="su-styled-text primary default">Wireless Bluetooth Earbuds</span></div>
      <span class="su-styled-text primary bold large-1 s-card__price">COP $5 526.45</span>
      <span class="su-styled-text secondary large">+COP $6 689.91 por el envío</span>
    </li>
    <li class="s-card s-card--horizontal">
      <a href=https://www.ebay.com/itm/123456>
      <div class=s-card__title><span>Shop on eBay</span></div>
      <span class="s-card__price">$20.00</span>
    </li>
    <li class="s-card s-card--horizontal">
      <a href=https://www.ebay.com/itm/222222222222>
      <div class=s-card__title><span class="su-styled-text primary default">Auriculares Bluetooth</span></div>
      <span class="s-card__price">COP $1 180 263.00</span>
      <span>Envío internacional gratis</span>
    </li>
    """
    parsed = parse_ebay(html)
    assert [offer.price for offer in parsed] == [5526.45, 1180263]
    assert parsed[0].shipping_cost == 6689.91
    assert parsed[0].ships_to_colombia is True
    assert parsed[0].url == "https://www.ebay.com/itm/332818233766"
    assert parsed[1].shipping_cost == 0
    assert relevance("audifonos bluetooth", parsed[0].name) == 1


def test_multipack_names_count_the_whole_content():
    assert sale_measure("Arroz Diana 2 x 1000 g", 8000)["quantity"] == 2000
    assert sale_measure("Leche Colanta 6 x 1100 ml", 26400)["quantity"] == 6600
    assert sale_measure("Arroz Diana 1.000 g", 4200)["quantity"] == 1000


def test_list_only_takes_the_exact_size_and_filters_brand():
    item = make_item("arroz", "Diana", "gramos", 1000)
    outcomes = [
        StoreOutcome(
            "olimpica",
            "Olímpica",
            "supermercado",
            [
                offer(store_id="olimpica", store_name="Olímpica", name="Arroz Diana 500 G", brand="Diana", price=1300, url="https://o/diana-500", ean=None),
                offer(store_id="olimpica", store_name="Olímpica", name="Arroz Diana 2 x 1000 g", brand="Diana", price=7000, url="https://o/diana-2x1", ean=None),
                offer(store_id="olimpica", store_name="Olímpica", name="Arroz Diana 2 Kg", brand="Diana", price=6900, url="https://o/diana-2kg", ean=None),
                offer(store_id="olimpica", store_name="Olímpica", name="Arroz Mi Arroz 1 Kg", brand="Mi Arroz", price=2000, url="https://o/mi-1kg", ean=None),
                offer(store_id="olimpica", store_name="Olímpica", name="Arroz Diana 1 Kg", brand="Diana", price=4300, url="https://o/diana-1kg", ean=None),
            ],
        ),
        StoreOutcome(
            "d1",
            "D1",
            "supermercado",
            [offer(store_id="d1", store_name="D1", name="Arroz Diana 1000 G", brand="DIANA", price=4200, url="https://d1/diana-1kg", ean=None)],
        ),
    ]
    report = build_list_report([item], [outcomes], find_city("bogota"))
    row = report["items"][0]
    names = [row["winner"]["name"]] + [option["name"] for option in row["options"]]
    assert names == ["Arroz Diana 1000 G", "Arroz Diana 1 Kg"]
    assert row["winner"]["total"] == 4200
    assert report["total"] == 4200
    assert report["best_single_store"]["store_id"] == "d1"
    olimpica = next(store for store in report["single_store"] if store["store_id"] == "olimpica")
    assert olimpica["total"] == 4300


def test_list_searches_with_the_size_and_merges_both_searches():
    assert make_item("aceite", "TODAS", "mililitros", 1000).sized_query == "aceite 1000 ml"
    assert make_item("arroz", "Diana", "gramos", 500).sized_query == "arroz Diana 500 g"
    assert make_item("huevos", "", "unidades", 30).sized_query == "huevos 30"
    same = offer(store_id="d1", store_name="D1", name="Arroz Diana 1000 G", price=4200, url="https://d1/a", ean=None)
    extra = offer(store_id="d1", store_name="D1", name="Arroz Roa 1000 G", price=4500, url="https://d1/b", ean=None)
    merged = _merge_outcomes(
        [StoreOutcome("d1", "D1", "supermercado", [same]), StoreOutcome("jumbo", "Jumbo", "supermercado", [], "falló")],
        [StoreOutcome("d1", "D1", "supermercado", [same, extra]), StoreOutcome("jumbo", "Jumbo", "supermercado", [extra])],
    )
    assert [len(outcome.offers) for outcome in merged] == [2, 1]
    assert merged[1].error is None


def test_list_total_adds_one_pack_per_item():
    rice = make_item("arroz", "TODAS", "gramos", 1000)
    oil = make_item("aceite", "TODAS", "mililitros", 900)
    store = StoreOutcome(
        "d1",
        "D1",
        "supermercado",
        [
            offer(store_id="d1", store_name="D1", name="Arroz Diana 1000 G", brand="Diana", price=4200, url="https://d1/a", ean=None),
            offer(store_id="d1", store_name="D1", name="Arroz Roa 1000 G", brand="Roa", price=4500, url="https://d1/b", ean=None),
            offer(store_id="d1", store_name="D1", name="Aceite Imatá 900 Ml", brand="Imatá", price=6950, url="https://d1/c", ean=None),
            offer(store_id="d1", store_name="D1", name="Aceite Premier 900 Ml", brand="Premier", price=9900, url="https://d1/d", ean=None),
        ],
    )
    report = build_list_report([rice, oil], [[store], [store]], find_city("bogota"))
    assert report["total"] == 4200 + 6950
    assert report["best_single_store"]["total"] == 4200 + 6950
    assert [len(row["options"]) for row in report["items"]] == [1, 1]


def test_list_uses_card_price_and_reports_missing_items():
    eggs = make_item("huevos", "TODAS", "unidades", 30)
    oil = make_item("aceite", "", "mililitros", 1000)
    outcomes = [
        StoreOutcome(
            "jumbo",
            "Jumbo",
            "supermercado",
            [
                offer(
                    name="Huevos AA x 30 und",
                    price=18000,
                    url="https://j/huevos",
                    ean=None,
                    payment_label="Tarjeta Cencosud",
                    payment_price=13500,
                )
            ],
        )
    ]
    report = build_list_report([eggs, oil], [outcomes, []], find_city("bogota"))
    winner = report["items"][0]["winner"]
    assert winner["total"] == 13500
    assert winner["from_card"] is True
    assert report["missing"] == ["aceite"]
    assert report["found"] == 1
    assert eggs.brand is None and oil.brand is None


def test_catalog_includes_d1_and_not_ara():
    names = {store["id"]: store["name"] for store in store_catalog()}
    assert names["d1"] == "D1"
    assert "ara" not in names


def test_unknown_city_uses_bogota():
    assert find_city(None).id == "bogota"
    assert find_city("medellin").name == "Medellín"
    assert find_city("no-existe").postal_code == "11001"


def test_vtex_segment_keeps_the_region():
    import base64
    import json

    token = vtex_segment("zona-bogota")
    data = json.loads(base64.b64decode(token))
    assert data["regionId"] == "zona-bogota"
    assert data["countryCode"] == "COL"


def test_algolia_config_parser():
    html = """
    applicationId : 'QX5IPS1B1Q',
    apiKey : 'ODNiNzFhOTg5MWEyNWYxZGIyMmMyODFjYjNkMWU3NjVhNjUzYzgzZWUwMjkwODI3NmM4MDliNTY4OTEzODc5NCZmaWx0ZXJz',
    indexName : 'alkostoIndexAlgoliaPRD',
    """
    app_id, _key, index = parse_algolia_config(html)
    assert app_id == "QX5IPS1B1Q"
    assert index == "alkostoIndexAlgoliaPRD"
