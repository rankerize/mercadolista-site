import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_BuO5mQA8.mjs';
import { manifest } from './manifest_CNx_jsRl.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/buscar.astro.mjs');
const _page2 = () => import('./pages/api/ciudades.astro.mjs');
const _page3 = () => import('./pages/api/internacional.astro.mjs');
const _page4 = () => import('./pages/api/lista.astro.mjs');
const _page5 = () => import('./pages/api/listas/_id_.astro.mjs');
const _page6 = () => import('./pages/api/listas.astro.mjs');
const _page7 = () => import('./pages/api/sesion.astro.mjs');
const _page8 = () => import('./pages/api/tiendas.astro.mjs');
const _page9 = () => import('./pages/api/unidad.astro.mjs');
const _page10 = () => import('./pages/api/usuarios.astro.mjs');
const _page11 = () => import('./pages/api/yo.astro.mjs');
const _page12 = () => import('./pages/perfil.astro.mjs');
const _page13 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/api/buscar.ts", _page1],
    ["src/pages/api/ciudades.ts", _page2],
    ["src/pages/api/internacional.ts", _page3],
    ["src/pages/api/lista.ts", _page4],
    ["src/pages/api/listas/[id].ts", _page5],
    ["src/pages/api/listas.ts", _page6],
    ["src/pages/api/sesion.ts", _page7],
    ["src/pages/api/tiendas.ts", _page8],
    ["src/pages/api/unidad.ts", _page9],
    ["src/pages/api/usuarios.ts", _page10],
    ["src/pages/api/yo.ts", _page11],
    ["src/pages/perfil.astro", _page12],
    ["src/pages/index.astro", _page13]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "client": "file:///Users/cesarandresjimenezarci/Documents/Clientes/Comparador%20de%20precios/dist/client/",
    "server": "file:///Users/cesarandresjimenezarci/Documents/Clientes/Comparador%20de%20precios/dist/server/",
    "host": "127.0.0.1",
    "port": 8765,
    "assets": "_astro",
    "experimentalStaticHeaders": false
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
