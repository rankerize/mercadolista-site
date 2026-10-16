from __future__ import annotations

import asyncio
import hashlib
import logging
import os
import re
import secrets
from pathlib import Path
from typing import Any, Optional

import asyncpg

log = logging.getLogger("comparador.db")

ROOT = Path(__file__).resolve().parent.parent
MAX_LISTS_PER_USER = 30

SCHEMA = """
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL CHECK (char_length(nombre) BETWEEN 2 AND 60),
    correo TEXT UNIQUE,
    telefono TEXT UNIQUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (correo IS NOT NULL OR telefono IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS sesiones (
    token_hash TEXT PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS listas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL CHECK (char_length(nombre) BETWEEN 1 AND 60),
    ciudad TEXT NOT NULL DEFAULT 'bogota',
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (usuario_id, nombre)
);

CREATE TABLE IF NOT EXISTS lista_productos (
    id BIGSERIAL PRIMARY KEY,
    lista_id BIGINT NOT NULL REFERENCES listas(id) ON DELETE CASCADE,
    posicion SMALLINT NOT NULL,
    nombre TEXT NOT NULL,
    marca TEXT NOT NULL DEFAULT 'TODAS',
    formato TEXT NOT NULL CHECK (formato IN ('gramos', 'mililitros', 'unidades')),
    cantidad DOUBLE PRECISION NOT NULL CHECK (cantidad > 0),
    UNIQUE (lista_id, posicion)
);

CREATE INDEX IF NOT EXISTS listas_usuario_idx ON listas (usuario_id);
CREATE INDEX IF NOT EXISTS sesiones_usuario_idx ON sesiones (usuario_id);
"""

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

_pool: Optional[asyncpg.Pool] = None
# Python 3.9 binds asyncio.Lock to the loop current at creation, so it is created inside the server loop.
_pool_lock: Optional[asyncio.Lock] = None


class DatabaseUnavailable(RuntimeError):
    pass


class Conflict(ValueError):
    pass


def _read_env_file() -> dict[str, str]:
    path = ROOT / ".env"
    if not path.exists():
        return {}
    values = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip()
    return values


def database_url() -> Optional[str]:
    return os.environ.get("DATABASE_URL") or _read_env_file().get("DATABASE_URL")


async def get_pool() -> asyncpg.Pool:
    global _pool, _pool_lock
    if _pool is not None:
        return _pool
    if _pool_lock is None:
        _pool_lock = asyncio.Lock()
    async with _pool_lock:
        if _pool is not None:
            return _pool
        url = database_url()
        if not url:
            raise DatabaseUnavailable("Falta DATABASE_URL")
        try:
            pool = await asyncpg.create_pool(url, min_size=1, max_size=5, timeout=5)
            async with pool.acquire() as conn:
                await conn.execute(SCHEMA)
        except (OSError, asyncpg.PostgresError, asyncio.TimeoutError) as error:
            log.warning("Base de datos no disponible: %s", error)
            raise DatabaseUnavailable(str(error)) from error
        _pool = pool
        return _pool


async def close_pool() -> None:
    global _pool, _pool_lock
    if _pool is not None:
        await _pool.close()
        _pool = None
    _pool_lock = None


def parse_contact(raw: str) -> tuple[str, str]:
    """Returns ("correo", value) or ("telefono", digits); raises ValueError."""
    value = raw.strip()
    if "@" in value:
        email = value.lower()
        if not _EMAIL_RE.match(email) or len(email) > 120:
            raise ValueError("Ese correo no parece válido")
        return "correo", email
    digits = re.sub(r"\D", "", value)
    if len(digits) == 12 and digits.startswith("57"):
        digits = digits[2:]
    if not 7 <= len(digits) <= 15:
        raise ValueError("Escribe un correo o un teléfono de 7 a 15 dígitos")
    return "telefono", digits


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _user(row: asyncpg.Record) -> dict[str, Any]:
    return {"id": row["id"], "nombre": row["nombre"], "correo": row["correo"], "telefono": row["telefono"]}


async def _new_session(conn: asyncpg.Connection, user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    await conn.execute("INSERT INTO sesiones (token_hash, usuario_id) VALUES ($1, $2)", _hash_token(token), user_id)
    return token


async def register(name: str, contact: str) -> tuple[dict[str, Any], str]:
    kind, value = parse_contact(contact)
    pool = await get_pool()
    async with pool.acquire() as conn, conn.transaction():
        try:
            row = await conn.fetchrow(
                f"INSERT INTO usuarios (nombre, {kind}) VALUES ($1, $2) RETURNING *",
                " ".join(name.split()),
                value,
            )
        except asyncpg.UniqueViolationError as error:
            label = "ese correo" if kind == "correo" else "ese teléfono"
            raise Conflict(f"Ya hay una cuenta con {label}. Usa Entrar.") from error
        return _user(row), await _new_session(conn, row["id"])


async def login(contact: str) -> Optional[tuple[dict[str, Any], str]]:
    kind, value = parse_contact(contact)
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(f"SELECT * FROM usuarios WHERE {kind} = $1", value)
        if row is None:
            return None
        return _user(row), await _new_session(conn, row["id"])


async def user_for_token(token: Optional[str]) -> Optional[dict[str, Any]]:
    if not token:
        return None
    pool = await get_pool()
    row = await pool.fetchrow(
        "SELECT u.* FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id WHERE s.token_hash = $1",
        _hash_token(token),
    )
    return _user(row) if row else None


async def logout(token: Optional[str]) -> None:
    if not token:
        return
    pool = await get_pool()
    await pool.execute("DELETE FROM sesiones WHERE token_hash = $1", _hash_token(token))


def _list(row: asyncpg.Record, items: list[asyncpg.Record]) -> dict[str, Any]:
    return {
        "id": row["id"],
        "nombre": row["nombre"],
        "ciudad": row["ciudad"],
        "actualizado_en": row["actualizado_en"].isoformat(),
        "items": [
            {"nombre": item["nombre"], "marca": item["marca"], "formato": item["formato"], "cantidad": item["cantidad"]}
            for item in items
        ],
    }


async def user_lists(user_id: int) -> list[dict[str, Any]]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        lists = await conn.fetch(
            "SELECT * FROM listas WHERE usuario_id = $1 ORDER BY actualizado_en DESC", user_id
        )
        items = await conn.fetch(
            "SELECT p.* FROM lista_productos p JOIN listas l ON l.id = p.lista_id "
            "WHERE l.usuario_id = $1 ORDER BY p.lista_id, p.posicion",
            user_id,
        )
    by_list: dict[int, list[asyncpg.Record]] = {}
    for item in items:
        by_list.setdefault(item["lista_id"], []).append(item)
    return [_list(row, by_list.get(row["id"], [])) for row in lists]


async def _write_items(conn: asyncpg.Connection, list_id: int, items: list[dict[str, Any]]) -> None:
    await conn.execute("DELETE FROM lista_productos WHERE lista_id = $1", list_id)
    await conn.executemany(
        "INSERT INTO lista_productos (lista_id, posicion, nombre, marca, formato, cantidad) "
        "VALUES ($1, $2, $3, $4, $5, $6)",
        [
            (list_id, index, item["nombre"], item["marca"], item["formato"], item["cantidad"])
            for index, item in enumerate(items)
        ],
    )


async def save_list(
    user_id: int, name: str, city: str, items: list[dict[str, Any]], list_id: Optional[int] = None
) -> Optional[dict[str, Any]]:
    """Creates the list, or replaces it when list_id is given. None if list_id is not the user's."""
    pool = await get_pool()
    clean_name = " ".join(name.split())
    async with pool.acquire() as conn, conn.transaction():
        try:
            if list_id is None:
                count = await conn.fetchval("SELECT count(*) FROM listas WHERE usuario_id = $1", user_id)
                if count >= MAX_LISTS_PER_USER:
                    raise Conflict(f"Puedes guardar hasta {MAX_LISTS_PER_USER} listas")
                row = await conn.fetchrow(
                    "INSERT INTO listas (usuario_id, nombre, ciudad) VALUES ($1, $2, $3) RETURNING *",
                    user_id, clean_name, city,
                )
            else:
                row = await conn.fetchrow(
                    "UPDATE listas SET nombre = $3, ciudad = $4, actualizado_en = now() "
                    "WHERE id = $1 AND usuario_id = $2 RETURNING *",
                    list_id, user_id, clean_name, city,
                )
                if row is None:
                    return None
        except asyncpg.UniqueViolationError as error:
            raise Conflict(f"Ya tienes una lista llamada {clean_name}") from error
        await _write_items(conn, row["id"], items)
        saved = await conn.fetch("SELECT * FROM lista_productos WHERE lista_id = $1 ORDER BY posicion", row["id"])
        return _list(row, saved)


async def delete_list(user_id: int, list_id: int) -> bool:
    pool = await get_pool()
    result = await pool.execute("DELETE FROM listas WHERE id = $1 AND usuario_id = $2", list_id, user_id)
    return result.endswith(" 1")
