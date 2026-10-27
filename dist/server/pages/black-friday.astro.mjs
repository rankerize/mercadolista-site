import { e as createAstro, f as createComponent } from '../chunks/astro/server_zl8i4EZZ.mjs';
import 'piccolore';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://mercadolista.com");
const $$BlackFriday = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BlackFriday;
  return Astro2.redirect("/page/black-friday", 301);
}, "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/black-friday.astro", void 0);

const $$file = "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/black-friday.astro";
const $$url = "/black-friday";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$BlackFriday,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
