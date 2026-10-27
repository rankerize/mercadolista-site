import { f as createComponent, r as renderTemplate } from './astro/server_zl8i4EZZ.mjs';
import 'piccolore';
import 'clsx';

var __freeze$1 = Object.freeze;
var __defProp$1 = Object.defineProperty;
var __template$1 = (cooked, raw) => __freeze$1(__defProp$1(cooked, "raw", { value: __freeze$1(cooked.slice()) }));
var _a$1;
const $$GoogleAnalytics = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a$1 || (_a$1 = __template$1([`<!-- Google tag (gtag.js) --><script async src="https://www.googletagmanager.com/gtag/js?id=G-0NCRY4N4W3"><\/script> <script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-0NCRY4N4W3');
<\/script>`])));
}, "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/components/GoogleAnalytics.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$GoogleAdSense = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template(['<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4690263255376670" crossorigin="anonymous"><\/script>'])));
}, "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/components/GoogleAdSense.astro", void 0);

export { $$GoogleAnalytics as $, $$GoogleAdSense as a };
