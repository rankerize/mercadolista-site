import { u as userForToken, D as DatabaseUnavailable } from '../../chunks/db_MlWT1bir.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const SESSION_COOKIE = "sesion";
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
    return new Response(JSON.stringify(user), { status: 200, headers: { "Content-Type": "application/json" } });
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

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
