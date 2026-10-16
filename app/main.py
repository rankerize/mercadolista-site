from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path
from typing import List, Literal, Optional

from fastapi import Cookie, FastAPI, HTTPException, Query, Request, Response
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from app import db
from app.cities import city_catalog, find_city
from app.international import build_international_report, search_international
from app.providers import search_stores, store_catalog
from app.ranking import build_report
from app.shopping import make_item, search_list
from app.units import build_unit_report

STATIC = Path(__file__).resolve().parent.parent / "static"
SESSION_COOKIE = "sesion"
SESSION_DAYS = 365


@asynccontextmanager
async def lifespan(_app: FastAPI):
    yield
    await db.close_pool()


app = FastAPI(title="Comparador de precios", version="1.0.0", lifespan=lifespan)
app.mount("/static", StaticFiles(directory=STATIC), name="static")


@app.exception_handler(db.DatabaseUnavailable)
async def database_unavailable(_request: Request, _error: db.DatabaseUnavailable) -> JSONResponse:
    return JSONResponse(
        status_code=503,
        content={"detail": "Las cuentas no están disponibles: la base de datos no responde."},
    )


@app.middleware("http")
async def no_store_pages(request, call_next):
    response = await call_next(request)
    path = request.url.path
    if path == "/" or path.startswith("/static/"):
        response.headers["Cache-Control"] = "no-store"
    return response


@app.get("/")
def home() -> FileResponse:
    return FileResponse(STATIC / "index.html")


@app.get("/api/tiendas")
def tiendas() -> list[dict[str, str]]:
    return store_catalog()


@app.get("/api/ciudades")
def ciudades() -> list[dict[str, str]]:
    return city_catalog()


@app.get("/api/buscar")
async def buscar(
    q: str = Query(min_length=2, max_length=80),
    ciudad: str = Query(default="bogota", max_length=40),
) -> dict:
    query = " ".join(q.split())
    if len(query) < 2:
        raise HTTPException(status_code=422, detail="Escribe al menos 2 caracteres")
    city = find_city(ciudad)
    outcomes = await search_stores(query, city)
    report = build_report(query, outcomes)
    report["city"] = {"id": city.id, "name": city.name}
    return report


@app.get("/api/unidad")
async def unidad(
    q: str = Query(min_length=2, max_length=80),
    ciudad: str = Query(default="bogota", max_length=40),
) -> dict:
    query = " ".join(q.split())
    if len(query) < 2:
        raise HTTPException(status_code=422, detail="Escribe al menos 2 caracteres")
    city = find_city(ciudad)
    outcomes = await search_stores(query, city)
    report = build_unit_report(query, outcomes)
    report["city"] = {"id": city.id, "name": city.name}
    return report


class ListItemIn(BaseModel):
    nombre: str = Field(min_length=2, max_length=60)
    marca: str = Field(default="TODAS", max_length=40)
    formato: Literal["gramos", "mililitros", "unidades"]
    cantidad: float = Field(gt=0, le=1_000_000)


class ListRequest(BaseModel):
    ciudad: str = Field(default="bogota", max_length=40)
    items: List[ListItemIn] = Field(min_length=1, max_length=15)


@app.post("/api/lista")
async def lista(request: ListRequest) -> dict:
    items = [make_item(row.nombre, row.marca, row.formato, row.cantidad) for row in request.items]
    if any(len(item.name) < 2 for item in items):
        raise HTTPException(status_code=422, detail="Cada producto necesita un nombre")
    return await search_list(items, find_city(request.ciudad))


class RegisterIn(BaseModel):
    nombre: str = Field(min_length=2, max_length=60)
    contacto: str = Field(min_length=5, max_length=120)


class LoginIn(BaseModel):
    contacto: str = Field(min_length=5, max_length=120)


class SavedListIn(BaseModel):
    nombre: str = Field(min_length=1, max_length=60)
    ciudad: str = Field(default="bogota", max_length=40)
    items: List[ListItemIn] = Field(min_length=1, max_length=15)


def _start_session(response: Response, token: str) -> None:
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=SESSION_DAYS * 24 * 3600,
        httponly=True,
        samesite="lax",
    )


async def _current_user(token: Optional[str]) -> dict:
    user = await db.user_for_token(token)
    if user is None:
        raise HTTPException(status_code=401, detail="Entra o inscríbete para guardar listas")
    return user


def _list_rows(request: SavedListIn) -> list[dict]:
    rows = [
        {
            "nombre": " ".join(row.nombre.split()),
            "marca": " ".join(row.marca.split()) or "TODAS",
            "formato": row.formato,
            "cantidad": row.cantidad,
        }
        for row in request.items
    ]
    if any(len(row["nombre"]) < 2 for row in rows):
        raise HTTPException(status_code=422, detail="Cada producto necesita un nombre")
    if not " ".join(request.nombre.split()):
        raise HTTPException(status_code=422, detail="Ponle un nombre a la lista")
    return rows


@app.post("/api/usuarios", status_code=201)
async def inscribir(request: RegisterIn, response: Response) -> dict:
    if len(" ".join(request.nombre.split())) < 2:
        raise HTTPException(status_code=422, detail="Escribe tu nombre")
    try:
        user, token = await db.register(request.nombre, request.contacto)
    except db.Conflict as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    _start_session(response, token)
    return user


@app.post("/api/sesion")
async def entrar(request: LoginIn, response: Response) -> dict:
    try:
        found = await db.login(request.contacto)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    if found is None:
        raise HTTPException(status_code=404, detail="No hay una cuenta con ese correo o teléfono. Inscríbete.")
    user, token = found
    _start_session(response, token)
    return user


@app.delete("/api/sesion", status_code=204)
async def salir(sesion: Optional[str] = Cookie(default=None)) -> Response:
    await db.logout(sesion)
    response = Response(status_code=204)
    response.delete_cookie(SESSION_COOKIE)
    return response


@app.get("/api/yo")
async def yo(sesion: Optional[str] = Cookie(default=None)) -> dict:
    return await _current_user(sesion)


@app.get("/api/listas")
async def mis_listas(sesion: Optional[str] = Cookie(default=None)) -> list[dict]:
    user = await _current_user(sesion)
    return await db.user_lists(user["id"])


@app.post("/api/listas", status_code=201)
async def guardar_lista(request: SavedListIn, sesion: Optional[str] = Cookie(default=None)) -> dict:
    user = await _current_user(sesion)
    try:
        return await db.save_list(user["id"], request.nombre, find_city(request.ciudad).id, _list_rows(request))
    except db.Conflict as error:
        raise HTTPException(status_code=409, detail=str(error)) from error


@app.put("/api/listas/{list_id}")
async def actualizar_lista(
    list_id: int, request: SavedListIn, sesion: Optional[str] = Cookie(default=None)
) -> dict:
    user = await _current_user(sesion)
    try:
        saved = await db.save_list(
            user["id"], request.nombre, find_city(request.ciudad).id, _list_rows(request), list_id
        )
    except db.Conflict as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    if saved is None:
        raise HTTPException(status_code=404, detail="No encontré esa lista")
    return saved


@app.delete("/api/listas/{list_id}", status_code=204)
async def borrar_lista(list_id: int, sesion: Optional[str] = Cookie(default=None)) -> Response:
    user = await _current_user(sesion)
    if not await db.delete_list(user["id"], list_id):
        raise HTTPException(status_code=404, detail="No encontré esa lista")
    return Response(status_code=204)


@app.get("/api/internacional")
async def internacional(q: str = Query(min_length=2, max_length=80)) -> dict:
    query = " ".join(q.split())
    if len(query) < 2:
        raise HTTPException(status_code=422, detail="Escribe al menos 2 caracteres")
    outcomes = await search_international(query)
    return build_international_report(query, outcomes)
