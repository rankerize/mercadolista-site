# Comparador de precios

Busca un producto y compara el precio publicado en tiendas de Colombia: Éxito, Carulla, Jumbo, Olímpica, Alkosto, Ktronix, Falabella y Easy. El resultado indica en cuál está el mejor precio de compra.

Cuando el mismo código de barras aparece en varias tiendas, la comparación es entre ese producto. Si no, muestra la oferta más barata parecida a la búsqueda.

Los precios son los de la tienda en línea en el momento de consultar. Pueden cambiar según la ciudad, la sede y las promociones.

## Cómo usarlo

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8765
```

Abre http://127.0.0.1:8765

## Cuentas y listas guardadas

Las cuentas (nombre y correo o teléfono) y sus listas se guardan en Postgres, que corre en Docker y solo escucha en `127.0.0.1`.

```bash
cp .env.example .env   # cambia la clave en las dos líneas
docker compose up -d
```

La app crea las tablas `usuarios`, `sesiones`, `listas` y `lista_productos` la primera vez que se usa una cuenta. Si la base de datos no está corriendo, el comparador sigue funcionando y solo la parte de cuentas avisa que no está disponible.
