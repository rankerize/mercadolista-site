import { u as userForToken, a as userLists, D as DatabaseUnavailable, s as saveList, C as Conflict } from '../../chunks/db_MlWT1bir.mjs';
import { f as findCity } from '../../chunks/cities_Bh7Qi1an.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const SESSION_COOKIE = "sesion";
function cleanListRows(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 15) {
    throw new Error("La lista debe tener entre 1 y 15 productos");
  }
  return items.map((r) => {
    const nombre = String(r.nombre || "").trim().replace(/\s+/g, " ");
    if (nombre.length < 2) throw new Error("Cada producto necesita un nombre");
    const marca = String(r.marca || "").trim().replace(/\s+/g, " ") || "TODAS";
    const formato = r.formato;
    if (!["gramos", "mililitros", "unidades"].includes(formato)) {
      throw new Error("Formato inválido");
    }
    const cantidad = Number(r.cantidad);
    if (isNaN(cantidad) || cantidad <= 0 || cantidad > 1e6) {
      throw new Error("Cantidad inválida");
    }
    return { nombre, marca, formato, cantidad };
  });
}
const GET = async ({ cookies }) => {
  const token = cookies.get(SESSION_COOKIE)?.value;
  try {
    const user = await userForToken(token);
    if (!user) {
      return new Response(JSON.stringify({ detail: "Entra o inscríbete para guardar listas" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const lists = await userLists(user.id);
    return new Response(JSON.stringify(lists), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    if (err instanceof DatabaseUnavailable) {
      return new Response(JSON.stringify({ detail: "Las cuentas no están disponibles: la base de datos no responde." }), {
        status: 503,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ detail: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
const POST = async ({ request, cookies }) => {
  const token = cookies.get(SESSION_COOKIE)?.value;
  try {
    const user = await userForToken(token);
    if (!user) {
      return new Response(JSON.stringify({ detail: "Entra o inscríbete para guardar listas" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const nombre = String(body?.nombre || "").trim().replace(/\s+/g, " ");
    if (!nombre) {
      return new Response(JSON.stringify({ detail: "Ponle un nombre a la lista" }), { status: 422, headers: { "Content-Type": "application/json" } });
    }
    const rows = cleanListRows(body.items);
    const city = findCity(body.ciudad).id;
    const saved = await saveList(user.id, nombre, city, rows);
    return new Response(JSON.stringify(saved), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    if (err instanceof DatabaseUnavailable) {
      return new Response(JSON.stringify({ detail: "Las cuentas no están disponibles: la base de datos no responde." }), {
        status: 503,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (err instanceof Conflict) {
      return new Response(JSON.stringify({ detail: err.message }), { status: 409, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ detail: err.message }), { status: 422, headers: { "Content-Type": "application/json" } });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
