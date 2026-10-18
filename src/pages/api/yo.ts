import type { APIRoute } from 'astro';
import { DatabaseUnavailable, userForToken } from '@/lib/db';

export const prerender = false;
const SESSION_COOKIE = 'sesion';

export const GET: APIRoute = async ({ cookies }) => {
  const token = cookies.get(SESSION_COOKIE)?.value;
  try {
    const user = await userForToken(token);
    if (!user) {
      return new Response(JSON.stringify({ detail: 'Entra o inscríbete para guardar listas' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(user), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    if (err instanceof DatabaseUnavailable) {
      return new Response(JSON.stringify({ detail: 'Las cuentas no están disponibles: la base de datos no responde.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ detail: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
