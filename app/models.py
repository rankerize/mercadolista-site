from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class Offer:
    store_id: str
    store_name: str
    name: str
    brand: str | None
    price: float
    list_price: float | None
    url: str
    image: str | None
    ean: str | None
    categories: list[str] = field(default_factory=list)
    payment_label: str | None = None
    payment_price: float | None = None

    @property
    def savings(self) -> float | None:
        if self.list_price and self.list_price > self.price:
            return self.list_price - self.price
        return None


@dataclass
class StoreOutcome:
    store_id: str
    store_name: str
    kind: str
    offers: list[Offer]
    error: str | None = None
