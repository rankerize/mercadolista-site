from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class City:
    id: str
    name: str
    postal_code: str


# Municipality codes that these stores accept when resolving a delivery zone.
CITIES: tuple[City, ...] = (
    City("bogota", "Bogotá", "11001"),
    City("medellin", "Medellín", "05001"),
    City("cali", "Cali", "76001"),
    City("barranquilla", "Barranquilla", "08001"),
    City("cartagena", "Cartagena", "13001"),
    City("bucaramanga", "Bucaramanga", "68001"),
    City("pereira", "Pereira", "66001"),
    City("manizales", "Manizales", "17001"),
    City("cucuta", "Cúcuta", "54001"),
    City("ibague", "Ibagué", "73001"),
    City("santa-marta", "Santa Marta", "47001"),
    City("villavicencio", "Villavicencio", "50001"),
)

DEFAULT_CITY = CITIES[0]


def find_city(city_id: str | None) -> City:
    key = (city_id or "").strip().lower()
    for city in CITIES:
        if city.id == key:
            return city
    return DEFAULT_CITY


def city_catalog() -> list[dict[str, str]]:
    return [{"id": city.id, "name": city.name} for city in CITIES]
