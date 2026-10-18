import { l as logout, b as login, D as DatabaseUnavailable } from '../../chunks/db_MlWT1bir.mjs';
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
  const contacto = String(body?.contacto || "").trim();
  try {
    const found = await login(contacto);
    if (!found) {
      return new Response(JSON.stringify({ detail: "No hay una cuenta con ese correo o teléfono. Inscríbete." }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const [user, token] = found;
    cookies.set(SESSION_COOKIE, token, {
      path: "/",
      maxAge: SESSION_DAYS * 24 * 3600,
      httpOnly: true,
      sameSite: "lax"
    });
    return new Response(JSON.stringify(user), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    if (err instanceof DatabaseUnavailable) {
      return new Response(JSON.stringify({ detail: "Las cuentas no están disponibles: la base de datos no responde." }), {
        status: 503,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ detail: err.message }), { status: 422, headers: { "Content-Type": "application/json" } });
  }
};
const DELETE = async ({ cookies }) => {
  const token = cookies.get(SESSION_COOKIE)?.value;
  try {
    await logout(token);
  } catch {
  }
  cookies.delete(SESSION_COOKIE, { path: "/" });
  return new Response(null, { status: 204 });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
