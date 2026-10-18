import { r as register, D as DatabaseUnavailable, C as Conflict } from '../../chunks/db_MlWT1bir.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const SESSION_COOKIE = "sesion";
const SESSION_DAYS = 365;
const POST = async ({ request, cookies }) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ detail: "JSON inválido" }), { status: 422, headers: { "Content-Type": "application/json" } });
  }
  const nombre = String(body?.nombre || "").trim();
  const contacto = String(body?.contacto || "").trim();
  if (nombre.length < 2) {
    return new Response(JSON.stringify({ detail: "Escribe tu nombre" }), { status: 422, headers: { "Content-Type": "application/json" } });
  }
  try {
    const [user, token] = await register(nombre, contacto);
    cookies.set(SESSION_COOKIE, token, {
      path: "/",
      maxAge: SESSION_DAYS * 24 * 3600,
      httpOnly: true,
      sameSite: "lax"
    });
    return new Response(JSON.stringify(user), { status: 201, headers: { "Content-Type": "application/json" } });
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
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
