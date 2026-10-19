import { f as createComponent, k as renderHead, l as renderScript, r as renderTemplate } from '../chunks/astro/server_Bi19r0ob.mjs';
import 'piccolore';
import 'clsx';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Perfil = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="es"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Mi Perfil · Mercado Lista</title><meta name="description" content="Gestiona tus listas de compras guardadas y compartidas en Mercado Lista."><meta name="robots" content="noindex, nofollow"><link rel="canonical" href="https://mercadolista.com/perfil"><meta property="og:title" content="Mi Perfil · Mercado Lista"><meta property="og:description" content="Gestiona tus listas de compras guardadas y compartidas en Mercado Lista."><meta property="og:url" content="https://mercadolista.com/perfil"><meta property="og:type" content="website"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,640&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet">${renderHead()}</head> <body> <header class="top"> <div class="top-bar"> <a href="/" class="eyebrow" style="text-decoration: none;">← Volver al comparador</a> </div> <h1>Mi Perfil</h1> <p class="lead">Administra tu cuenta y tus listas de compras guardadas en la nube.</p> </header> <main> <!-- Estado No Autenticado --> <section id="auth-gate" class="profile-card" hidden> <p style="margin: 0 0 1rem; font-size: 1.1rem; color: var(--muted);">
Inicia sesión para ver y administrar tus listas de compras guardadas.
</p> <button type="button" id="profile-login-btn" class="auth-btn" style="padding: 0.6rem 1.2rem; font-size: 0.95rem;"> <svg width="18" height="18" viewBox="0 0 24 24"> <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path> <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path> <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"></path> <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"></path> </svg>
Iniciar sesión con Google
</button> </section> <!-- Estado Autenticado --> <section id="user-profile" class="profile-card" hidden> <div class="profile-header"> <div class="profile-user-info"> <h2 id="user-display-name">Usuario</h2> <p id="user-email">correo@ejemplo.com</p> </div> <button type="button" id="profile-logout-btn" class="logout-btn" style="padding: 0.5rem 1rem; border: 1px solid var(--line);">
Cerrar sesión
</button> </div> </section> <!-- Listas Guardadas --> <section id="lists-section" hidden> <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;"> <h2 style="margin: 0; font-size: 1.4rem;">Mis Listas Guardadas</h2> <a href="/?tab=list" class="btn-primary">+ Nueva lista</a> </div> <p id="lists-status" class="status" role="status"></p> <div id="lists-grid" class="profile-lists-grid"></div> </section> </main> <footer> <p id="footnote">Comparador de precios · Tus datos están protegidos y sincronizados con Firebase.</p> </footer> ${renderScript($$result, "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/perfil.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/perfil.astro", void 0);

const $$file = "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/perfil.astro";
const $$url = "/perfil";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Perfil,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
