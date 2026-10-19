import 'piccolore';
import { o as decodeKey } from './chunks/astro/server_DncXONAL.mjs';
import 'clsx';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_ByWafkDi.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/cesarandresjimenezarci/Documents/Clientes/Comparador%20de%20precios/","cacheDir":"file:///Users/cesarandresjimenezarci/Documents/Clientes/Comparador%20de%20precios/node_modules/.astro/","outDir":"file:///Users/cesarandresjimenezarci/Documents/Clientes/Comparador%20de%20precios/dist/","srcDir":"file:///Users/cesarandresjimenezarci/Documents/Clientes/Comparador%20de%20precios/src/","publicDir":"file:///Users/cesarandresjimenezarci/Documents/Clientes/Comparador%20de%20precios/public/","buildClientDir":"file:///Users/cesarandresjimenezarci/Documents/Clientes/Comparador%20de%20precios/dist/client/","buildServerDir":"file:///Users/cesarandresjimenezarci/Documents/Clientes/Comparador%20de%20precios/dist/server/","adapterName":"@astrojs/node","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/node.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/buscar","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/buscar\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"buscar","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/buscar.ts","pathname":"/api/buscar","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/ciudades","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/ciudades\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"ciudades","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/ciudades.ts","pathname":"/api/ciudades","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/internacional","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/internacional\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"internacional","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/internacional.ts","pathname":"/api/internacional","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/lista","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/lista\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"lista","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/lista.ts","pathname":"/api/lista","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/tiendas","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/tiendas\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"tiendas","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/tiendas.ts","pathname":"/api/tiendas","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/unidad","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/unidad\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"unidad","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/unidad.ts","pathname":"/api/unidad","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.CG85_UKY.css"}],"routeData":{"route":"/perfil","isIndex":false,"type":"page","pattern":"^\\/perfil\\/?$","segments":[[{"content":"perfil","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/perfil.astro","pathname":"/perfil","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.CG85_UKY.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"site":"https://mercadolista.com","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/perfil.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astro-page:src/pages/api/buscar@_@ts":"pages/api/buscar.astro.mjs","\u0000@astro-page:src/pages/api/ciudades@_@ts":"pages/api/ciudades.astro.mjs","\u0000@astro-page:src/pages/api/internacional@_@ts":"pages/api/internacional.astro.mjs","\u0000@astro-page:src/pages/api/lista@_@ts":"pages/api/lista.astro.mjs","\u0000@astro-page:src/pages/api/tiendas@_@ts":"pages/api/tiendas.astro.mjs","\u0000@astro-page:src/pages/api/unidad@_@ts":"pages/api/unidad.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astro-page:src/pages/perfil@_@astro":"pages/perfil.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/node@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_CasSzL28.mjs","/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_pXjz8XuK.mjs","/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/node_modules/unstorage/drivers/fs-lite.mjs":"chunks/fs-lite_tZiMb17R.mjs","/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/index.astro?astro&type=script&index=0&lang.ts":"_astro/index.astro_astro_type_script_index_0_lang.CaLhL8Zj.js","/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/perfil.astro?astro&type=script&index=0&lang.ts":"_astro/perfil.astro_astro_type_script_index_0_lang.yKLyezTS.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/index.CG85_UKY.css","/apple-touch-icon.png","/favicon-16x16.png","/favicon-32x32.png","/favicon.ico","/favicon.svg","/icon-192.png","/icon-512.png","/llms.txt","/manifest.webmanifest","/robots.txt","/sitemap.xml","/_astro/index.astro_astro_type_script_index_0_lang.CaLhL8Zj.js","/_astro/perfil.astro_astro_type_script_index_0_lang.yKLyezTS.js","/_astro/shareModal.BdgUYYCS.js"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"actionBodySizeLimit":1048576,"serverIslandNameMap":[],"key":"/UJjQh1jOpXrxH2rkmwNRToTscnrmR875lOQNpeggwk=","sessionConfig":{"driver":"fs-lite","options":{"base":"/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/node_modules/.astro/sessions"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import('./chunks/fs-lite_tZiMb17R.mjs');

export { manifest };
