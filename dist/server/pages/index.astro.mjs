import { f as createComponent, k as renderHead, l as renderScript, r as renderTemplate } from '../chunks/astro/server_Bi19r0ob.mjs';
import 'piccolore';
import 'clsx';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="es"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Mercado Lista · Comparador de precios en Colombia</title><meta name="description" content="Compara precios en tiempo real entre tiendas de Colombia (Éxito, Carulla, Jumbo, Olímpica, D1, Alkosto, Falabella) e internacionales (Amazon, eBay, AliExpress). Ahorra en tu mercado."><link rel="canonical" href="https://mercadolista.com/"><meta property="og:title" content="Mercado Lista · Comparador de precios en Colombia"><meta property="og:description" content="Compara precios en tiempo real entre supermercados y tecnología en Colombia. Encuentra el mejor precio por producto, por unidad o para tu lista completa."><meta property="og:url" content="https://mercadolista.com/"><meta property="og:type" content="website"><meta name="twitter:card" content="summary_large_image"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,640&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet">${renderHead()}</head> <body> <header class="top"> <div class="top-bar"> <p class="eyebrow">Rech · Datos</p> <div id="header-auth" class="header-auth"> <button type="button" id="header-login-btn" class="auth-btn"> <svg width="16" height="16" viewBox="0 0 24 24"> <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path> <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path> <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"></path> <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"></path> </svg> <span>Iniciar sesión</span> </button> <div id="header-user-info" class="header-user-info" hidden> <a href="/perfil" id="header-user-name" class="user-name-link" title="Ver mi perfil"></a> <button type="button" id="header-logout-btn" class="logout-btn">Salir</button> </div> </div> </div> <h1>¿Dónde conviene comprarlo?</h1> <p class="lead" id="lead">
Compara el precio publicado en tiendas de Colombia y te dice en cuál está el más bajo.
</p> </header> <main> <div class="tabs" role="tablist"> <button type="button" id="tab-local" class="tab is-active" data-mode="local" role="tab" aria-selected="true">
Colombia
</button> <button type="button" id="tab-unit" class="tab" data-mode="unit" role="tab" aria-selected="false">
Unidad
</button> <button type="button" id="tab-list" class="tab" data-mode="list" role="tab" aria-selected="false">
Lista
</button> <button type="button" id="tab-intl" class="tab" data-mode="intl" role="tab" aria-selected="false">
Internacional
</button> </div> <form id="search-form" class="search"> <div class="city-row" id="city-row"> <label for="city">Ciudad</label> <select id="city" name="ciudad"> <option value="bogota" selected>Bogotá</option> </select> </div> <div id="single-search"> <label for="query">Producto</label> <div class="search-row"> <input id="query" name="q" type="search" placeholder="Ej. leche entera colanta, arroz roa, televisor 55" autocomplete="off" required minlength="2" maxlength="80"> <button type="submit" id="submit">Comparar</button> </div> </div> <div id="list-editor" class="list-editor" hidden> <div id="account" class="account"> <div id="account-out"> <p class="account-title">Inicia sesión para guardar y sincronizar tus listas de mercado.</p> <div class="account-fields" style="display: flex; gap: 0.5rem; align-items: center; margin-top: 0.75rem;"> <button type="button" id="account-google-btn" style="display: inline-flex; align-items: center; gap: 0.5rem; background: #fff; color: #333; border: 1px solid #ccc; font-weight: 500; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;"> <svg width="18" height="18" viewBox="0 0 24 24"> <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path> <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path> <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"></path> <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"></path> </svg>
Iniciar sesión con Google
</button> </div> </div> <div id="account-in" hidden> <div class="account-head"> <p class="account-title" id="account-hello"></p> <button type="button" id="account-logout" class="ghost">Salir</button> </div> <div class="account-fields saved-lists"> <label class="list-field"> <span>Mis listas</span> <select id="saved-select"></select> </label> <label class="list-field"> <span>Nombre de la lista</span> <input id="saved-name" type="text" maxlength="60" placeholder="Mercado de la semana"> </label> <button type="button" id="saved-save">Guardar</button> <button type="button" id="saved-share" class="ghost" style="color: #0e6a45; font-weight: 500;" hidden>📲 Compartir</button> <button type="button" id="saved-delete" class="ghost" hidden>Borrar</button> </div> </div> <p id="account-status" class="account-status" role="status"></p> </div> <div id="list-rows" class="list-rows"></div> <div class="list-actions"> <button type="button" id="add-row" class="ghost">Agregar producto</button> <button type="submit" id="list-submit">Comparar lista</button> </div> </div> <div class="examples" id="examples"> <button type="button" data-query="leche entera colanta">Leche Colanta</button> <button type="button" data-query="arroz roa">Arroz Roa</button> <button type="button" data-query="aceite premier">Aceite Premier</button> <button type="button" data-query="televisor 55">Televisor 55"</button> </div> </form> <p id="status" class="status" role="status"></p> <section id="results" class="results" hidden></section> </main> <footer> <p id="footnote">
Precios de Bogotá cuando la tienda los publica para esa zona. Pueden cambiar según la sede y las promociones.
        Confirma el valor antes de pagar.
</p> </footer> ${renderScript($$result, "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/index.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/index.astro", void 0);

const $$file = "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
