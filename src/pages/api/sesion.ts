import type { APIRoute } from 'astro';
import { DatabaseUnavailable, login, logout } from '@/lib/db';

export const prerender = false;
const SESSION_COOKIE = 'sesion';
const SESSION_DAYS = 365;

export const POST: APIRoute = async ({ request, cookies }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ detail: 'JSON inválido' }), { status: 422, headers: { 'Content-Type': 'application/json' } });
  }

  const contacto = String(body?.contacto || '').trim();
  try {
    const found = await login(contacto);
    if (!found) {
      return new Response(JSON.stringify({ detail: 'No hay una cuenta con ese correo o teléfono. Inscríbete.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const [user, token] = found;
    cookies.set(SESSION_COOKIE, token, {
      path: '/',
      maxAge: SESSION_DAYS * 24 * 3600,
      httpOnly: true,
      sameSite: 'lax',
    });
    return new Response(JSON.stringify(user), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    if (err instanceof DatabaseUnavailable) {
      return new Response(JSON.stringify({ detail: 'Las cuentas no están disponibles: la base de datos no responde.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ detail: err.message }), { status: 422, headers: { 'Content-Type': 'application/json' } });
  }
};

export const DELETE: APIRoute = async ({ cookies }) => {
  const token = cookies.get(SESSION_COOKIE)?.value;
  try {
    await logout(token);
  } catch {
    // Ignore error if DB is down during logout
  }
  cookies.delete(SESSION_COOKIE, { path: '/' });
  return new Response(null, { status: 204 });
};
