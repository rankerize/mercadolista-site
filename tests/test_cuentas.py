import asyncio
import uuid

import asyncpg
import pytest
from fastapi.testclient import TestClient

from app import db
from app.main import app


def test_contact_accepts_email_and_colombian_phone():
    assert db.parse_contact("  Ana@Correo.COM ") == ("correo", "ana@correo.com")
    assert db.parse_contact("+57 300 123 4567") == ("telefono", "3001234567")
    assert db.parse_contact("300-123-4567") == ("telefono", "3001234567")


@pytest.mark.parametrize("raw", ["ana@correo", "123", "ana @correo.com"])
def test_contact_rejects_invalid_values(raw):
    with pytest.raises(ValueError):
        db.parse_contact(raw)


def _database_ready() -> bool:
    url = db.database_url()
    if not url:
        return False

    async def ping() -> None:
        conn = await asyncpg.connect(url, timeout=3)
        await conn.close()

    try:
        asyncio.run(ping())
    except Exception:
        return False
    return True


@pytest.mark.skipif(not _database_ready(), reason="Postgres no está corriendo")
def test_user_registers_saves_and_isolates_lists():
    email = f"prueba-{uuid.uuid4().hex[:10]}@ejemplo.com"
    other_email = f"otra-{uuid.uuid4().hex[:10]}@ejemplo.com"
    items = [
        {"nombre": "Arroz", "marca": "Diana", "formato": "gramos", "cantidad": 1000},
        {"nombre": "Huevos", "marca": "TODAS", "formato": "unidades", "cantidad": 30},
    ]
    with TestClient(app) as client:
        try:
            created = client.post("/api/usuarios", json={"nombre": "Ana Prueba", "contacto": email})
            assert created.status_code == 201
            assert created.json()["correo"] == email
            ana_session = client.cookies.get("sesion")
            duplicate = client.post("/api/usuarios", json={"nombre": "Otra", "contacto": email.upper()})
            assert duplicate.status_code == 409

            saved = client.post("/api/listas", json={"nombre": "Mercado", "ciudad": "medellin", "items": items})
            assert saved.status_code == 201
            list_id = saved.json()["id"]
            assert [row["nombre"] for row in saved.json()["items"]] == ["Arroz", "Huevos"]
            assert client.post("/api/listas", json={"nombre": "Mercado", "items": items}).status_code == 409

            updated = client.put(
                f"/api/listas/{list_id}",
                json={"nombre": "Mercado semana", "ciudad": "cali", "items": items[:1]},
            )
            assert updated.json()["ciudad"] == "cali"
            assert len(updated.json()["items"]) == 1

            client.cookies.clear()
            assert client.post("/api/usuarios", json={"nombre": "Otra", "contacto": other_email}).status_code == 201
            assert client.get("/api/listas").json() == []
            assert client.delete(f"/api/listas/{list_id}").status_code == 404

            client.cookies.clear()
            client.cookies.set("sesion", ana_session)
            assert client.delete("/api/sesion").status_code == 204
            assert client.get("/api/listas").status_code == 401
            again = client.post("/api/sesion", json={"contacto": email})
            assert again.status_code == 200
            assert [row["nombre"] for row in client.get("/api/listas").json()] == ["Mercado semana"]
            assert client.delete(f"/api/listas/{list_id}").status_code == 204
        finally:
            async def cleanup() -> None:
                conn = await asyncpg.connect(db.database_url())
                await conn.execute("DELETE FROM usuarios WHERE correo = ANY($1::text[])", [email, other_email])
                await conn.close()

            asyncio.run(cleanup())
