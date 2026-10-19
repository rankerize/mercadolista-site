import { e as createAstro, f as createComponent, m as maybeRenderHead, h as addAttribute, r as renderTemplate, o as renderScript } from './astro/server_DcdaLVgT.mjs';
import 'piccolore';
import 'clsx';
/* empty css                          */

const CATEGORIES = [
  { id: "lacteos", nombre: "Lácteos y Huevos", icono: "🥛" },
  { id: "despensa", nombre: "Despensa y Granos", icono: "🌾" },
  { id: "carnes", nombre: "Carnes y Pollo", icono: "🥩" },
  { id: "frutas", nombre: "Frutas y Verduras", icono: "🍎" },
  { id: "aseo", nombre: "Aseo del Hogar", icono: "🧼" },
  { id: "cuidado", nombre: "Cuidado Personal", icono: "🧴" },
  { id: "cafe", nombre: "Café y Panadería", icono: "☕" },
  { id: "tecnologia", nombre: "Tecnología", icono: "📺" }
];
const CATALOG_ITEMS = [
  // Lácteos y Huevos
  { nombre: "Leche entera", categoria: "lacteos", icono: "🥛", formato: "mililitros", cantidad: 1e3, keywords: ["leche", "entera", "colanta", "alpina", "alqueria"] },
  { nombre: "Leche deslactosada", categoria: "lacteos", icono: "🥛", formato: "mililitros", cantidad: 1e3, keywords: ["leche", "deslactosada", "light", "colanta", "alqueria"] },
  { nombre: "Leche en polvo", categoria: "lacteos", icono: "🥛", formato: "gramos", cantidad: 800, keywords: ["leche", "polvo", "klim", "entera"] },
  { nombre: "Leche de almendras", categoria: "lacteos", icono: "🥛", formato: "mililitros", cantidad: 1e3, keywords: ["leche", "almendras", "vegetal", "silk"] },
  { nombre: "Huevos AA x30", categoria: "lacteos", icono: "🥚", formato: "unidades", cantidad: 30, keywords: ["huevos", "aa", "cubeta", "kikes", "rojo", "blanco"] },
  { nombre: "Huevos AAA x30", categoria: "lacteos", icono: "🥚", formato: "unidades", cantidad: 30, keywords: ["huevos", "aaa", "cubeta", "kikes", "extra"] },
  { nombre: "Huevos campesinos x30", categoria: "lacteos", icono: "🥚", formato: "unidades", cantidad: 30, keywords: ["huevos", "campesinos", "criollos", "gallina"] },
  { nombre: "Queso campesino", categoria: "lacteos", icono: "🧀", formato: "gramos", cantidad: 500, keywords: ["queso", "campesino", "colanta", "alpina"] },
  { nombre: "Queso mozzarella tajado", categoria: "lacteos", icono: "🧀", formato: "gramos", cantidad: 400, keywords: ["queso", "mozzarella", "tajado", "sandwich"] },
  { nombre: "Queso parmesano", categoria: "lacteos", icono: "🧀", formato: "gramos", cantidad: 250, keywords: ["queso", "parmesano", "pasta"] },
  { nombre: "Yogurt griego", categoria: "lacteos", icono: "🥣", formato: "gramos", cantidad: 1e3, keywords: ["yogurt", "yogur", "griego", "alpina", "pasco"] },
  { nombre: "Mantequilla con sal", categoria: "lacteos", icono: "🧈", formato: "gramos", cantidad: 250, keywords: ["mantequilla", "colanta", "alpina", "sal"] },
  { nombre: "Crema de leche", categoria: "lacteos", icono: "🥛", formato: "gramos", cantidad: 200, keywords: ["crema", "leche", "alqueria", "nestle"] },
  // Despensa y Granos
  { nombre: "Arroz blanco", categoria: "despensa", icono: "🌾", formato: "gramos", cantidad: 1e3, keywords: ["arroz", "roa", "diana", "blanco", "grano"] },
  { nombre: "Arroz integral", categoria: "despensa", icono: "🌾", formato: "gramos", cantidad: 1e3, keywords: ["arroz", "integral", "roa", "diana"] },
  { nombre: "Aceite vegetal", categoria: "despensa", icono: "🌻", formato: "mililitros", cantidad: 1e3, keywords: ["aceite", "vegetal", "premier", "girasol", "oleocali"] },
  { nombre: "Aceite de oliva extra virgen", categoria: "despensa", icono: "🫒", formato: "mililitros", cantidad: 500, keywords: ["aceite", "oliva", "virgen", "carbonell"] },
  { nombre: "Frijol bola roja", categoria: "despensa", icono: "🫘", formato: "gramos", cantidad: 1e3, keywords: ["frijol", "frijoles", "bola", "roja", "grano"] },
  { nombre: "Lentejas", categoria: "despensa", icono: "🍲", formato: "gramos", cantidad: 1e3, keywords: ["lentejas", "lenteja", "granos"] },
  { nombre: "Garbanzos", categoria: "despensa", icono: "🍲", formato: "gramos", cantidad: 500, keywords: ["garbanzo", "garbanzos", "grano"] },
  { nombre: "Azúcar blanca", categoria: "despensa", icono: "🍬", formato: "gramos", cantidad: 1e3, keywords: ["azucar", "blanca", "manuelita", "incauca"] },
  { nombre: "Panela pastilla", categoria: "despensa", icono: "🟫", formato: "gramos", cantidad: 1e3, keywords: ["panela", "pastilla", "aguapanela"] },
  { nombre: "Sal marina refinada", categoria: "despensa", icono: "🧂", formato: "gramos", cantidad: 1e3, keywords: ["sal", "refinada", "marina", "refisal"] },
  { nombre: "Harina de trigo", categoria: "despensa", icono: "🌾", formato: "gramos", cantidad: 1e3, keywords: ["harina", "trigo", "haz de oros"] },
  { nombre: "Harina de maíz blanco PAN", categoria: "despensa", icono: "🌽", formato: "gramos", cantidad: 1e3, keywords: ["harina", "pan", "maiz", "arepas", "promasa"] },
  { nombre: "Pasta espagueti", categoria: "despensa", icono: "🍝", formato: "gramos", cantidad: 500, keywords: ["pasta", "espagueti", "doria", "comarrico"] },
  { nombre: "Atún lomitos en agua", categoria: "despensa", icono: "🐟", formato: "gramos", cantidad: 170, keywords: ["atun", "lomitos", "agua", "van camps", "isabel"] },
  { nombre: "Atún lomitos en aceite", categoria: "despensa", icono: "🐟", formato: "gramos", cantidad: 170, keywords: ["atun", "lomitos", "aceite", "van camps"] },
  // Carnes y Pollo
  { nombre: "Pechuga de pollo", categoria: "carnes", icono: "🍗", formato: "gramos", cantidad: 1e3, keywords: ["pechuga", "pollo", "filete", "bucanero", "mac pollo"] },
  { nombre: "Carne molida especial de res", categoria: "carnes", icono: "🥩", formato: "gramos", cantidad: 500, keywords: ["carne", "molida", "res", "especial", "magra"] },
  { nombre: "Lomo fino de res", categoria: "carnes", icono: "🥩", formato: "gramos", cantidad: 1e3, keywords: ["lomo", "res", "carne", "churrasco"] },
  { nombre: "Costilla de cerdo", categoria: "carnes", icono: "🍖", formato: "gramos", cantidad: 1e3, keywords: ["costilla", "cerdo", "asado"] },
  { nombre: "Muslos de pollo", categoria: "carnes", icono: "🍗", formato: "gramos", cantidad: 1e3, keywords: ["muslos", "pollo", "piernas"] },
  { nombre: "Salmón filete fresco", categoria: "carnes", icono: "🍣", formato: "gramos", cantidad: 500, keywords: ["salmon", "pescado", "filete"] },
  // Frutas y Verduras
  { nombre: "Tomate chonto maduro", categoria: "frutas", icono: "🍅", formato: "gramos", cantidad: 1e3, keywords: ["tomate", "chonto", "guiso"] },
  { nombre: "Cebolla cabezona blanca", categoria: "frutas", icono: "🧅", formato: "gramos", cantidad: 1e3, keywords: ["cebolla", "cabezona", "blanca"] },
  { nombre: "Papa pastusa", categoria: "frutas", icono: "🥔", formato: "gramos", cantidad: 2e3, keywords: ["papa", "pastusa", "sabana", "criolla"] },
  { nombre: "Aguacate hass", categoria: "frutas", icono: "🥑", formato: "gramos", cantidad: 1e3, keywords: ["aguacate", "hass", "palta"] },
  { nombre: "Plátano verde", categoria: "frutas", icono: "🍌", formato: "unidades", cantidad: 4, keywords: ["platano", "verde", "patacon"] },
  { nombre: "Plátano maduro", categoria: "frutas", icono: "🍌", formato: "unidades", cantidad: 4, keywords: ["platano", "maduro"] },
  { nombre: "Banano criollo", categoria: "frutas", icono: "🍌", formato: "gramos", cantidad: 1e3, keywords: ["banano", "fruta"] },
  { nombre: "Manzana roja", categoria: "frutas", icono: "🍎", formato: "gramos", cantidad: 1e3, keywords: ["manzana", "roja", "verde"] },
  { nombre: "Limón común", categoria: "frutas", icono: "🍋", formato: "gramos", cantidad: 1e3, keywords: ["limon", "mandarino", "tahiti"] },
  { nombre: "Zanahoria", categoria: "frutas", icono: "🥕", formato: "gramos", cantidad: 1e3, keywords: ["zanahoria", "ensalada"] },
  // Aseo del Hogar
  { nombre: "Detergente líquido ropa", categoria: "aseo", icono: "🧼", formato: "mililitros", cantidad: 3e3, keywords: ["detergente", "liquido", "ropa", "ariel", "dersa"] },
  { nombre: "Detergente en polvo", categoria: "aseo", icono: "🧼", formato: "gramos", cantidad: 2e3, keywords: ["detergente", "polvo", "ariel", "fab"] },
  { nombre: "Suavizante para ropa", categoria: "aseo", icono: "🌸", formato: "mililitros", cantidad: 1e3, keywords: ["suavizante", "ropa", "downy", "soflan"] },
  { nombre: "Blanqueador Clorox", categoria: "aseo", icono: "🧴", formato: "mililitros", cantidad: 2e3, keywords: ["cloro", "blanqueador", "clorox", "desinfectante"] },
  { nombre: "Lavaplatos líquido axion", categoria: "aseo", icono: "🧽", formato: "mililitros", cantidad: 750, keywords: ["lavaplatos", "crema", "axion", "limon"] },
  { nombre: "Papel higiénico x12 rollos", categoria: "aseo", icono: "🧻", formato: "unidades", cantidad: 12, keywords: ["papel", "higienico", "familia", "scott", "suave"] },
  { nombre: "Toallas de cocina absorbentes", categoria: "aseo", icono: "🧻", formato: "unidades", cantidad: 3, keywords: ["toallas", "cocina", "servilletas", "familia"] },
  { nombre: "Limpia pisos desinfectante", categoria: "aseo", icono: "🧹", formato: "mililitros", cantidad: 1e3, keywords: ["limpiapisos", "pisos", "fabulo", "poett"] },
  // Cuidado Personal
  { nombre: "Champú head & shoulders", categoria: "cuidado", icono: "🧴", formato: "mililitros", cantidad: 400, keywords: ["champu", "shampoo", "pantene", "savital"] },
  { nombre: "Jabón de tocador x3", categoria: "cuidado", icono: "🧼", formato: "unidades", cantidad: 3, keywords: ["jabon", "barra", "dove", "palmolive", "protex"] },
  { nombre: "Crema dental Colgate triple acción", categoria: "cuidado", icono: "🪥", formato: "gramos", cantidad: 150, keywords: ["crema", "dental", "colgate", "fluor", "dientes"] },
  { nombre: "Desodorante antitranspirante", categoria: "cuidado", icono: "🧴", formato: "mililitros", cantidad: 150, keywords: ["desodorante", "rexona", "axe", "speed stick"] },
  { nombre: "Protector solar facial FPS 50", categoria: "cuidado", icono: "☀️", formato: "mililitros", cantidad: 50, keywords: ["bloqueador", "solar", "isdin", "nivea", "eucerin"] },
  // Café y Panadería
  { nombre: "Café molido Sello Rojo", categoria: "cafe", icono: "☕", formato: "gramos", cantidad: 500, keywords: ["cafe", "molido", "sello rojo", "aguila roja", "juan valdez"] },
  { nombre: "Café instantáneo Colcafé", categoria: "cafe", icono: "☕", formato: "gramos", cantidad: 170, keywords: ["cafe", "instantaneo", "colcafe", "nescafe"] },
  { nombre: "Pan tajado blanco Bimbo", categoria: "cafe", icono: "🍞", formato: "gramos", cantidad: 600, keywords: ["pan", "tajado", "blanco", "bimbo", "comapan"] },
  { nombre: "Pan integral tajado", categoria: "cafe", icono: "🍞", formato: "gramos", cantidad: 600, keywords: ["pan", "integral", "bimbo", "semillas"] },
  { nombre: "Chocolate de mesa Corona", categoria: "cafe", icono: "🍫", formato: "gramos", cantidad: 500, keywords: ["chocolate", "corona", "luker", "pastillas"] },
  { nombre: "Avena en hojuelas Quaker", categoria: "cafe", icono: "🥣", formato: "gramos", cantidad: 500, keywords: ["avena", "hojuelas", "quaker", "molida"] },
  { nombre: "Galletas Saltín Noel", categoria: "cafe", icono: "🍪", formato: "gramos", cantidad: 450, keywords: ["galletas", "saltin", "noel", "tacos"] },
  // Tecnología
  { nombre: "Televisor 55 pulgadas 4K", categoria: "tecnologia", icono: "📺", formato: "unidades", cantidad: 1, keywords: ["televisor", "tv", "smart", "samsung", "lg", "55"] },
  { nombre: "Televisor 43 pulgadas Smart", categoria: "tecnologia", icono: "📺", formato: "unidades", cantidad: 1, keywords: ["televisor", "tv", "43", "smart", "fhd"] },
  { nombre: "Freidora de aire air fryer", categoria: "tecnologia", icono: "🍟", formato: "unidades", cantidad: 1, keywords: ["freidora", "aire", "airfryer", "oster", "black decker"] },
  { nombre: "Portátil laptop 15 pulgadas", categoria: "tecnologia", icono: "💻", formato: "unidades", cantidad: 1, keywords: ["portatil", "laptop", "computador", "hp", "lenovo", "asus"] },
  { nombre: "Audífonos inalámbricos bluetooth", categoria: "tecnologia", icono: "🎧", formato: "unidades", cantidad: 1, keywords: ["audifonos", "inalambricos", "bluetooth", "tws"] },
  { nombre: "Celular smartphone 128GB", categoria: "tecnologia", icono: "📱", formato: "unidades", cantidad: 1, keywords: ["celular", "smartphone", "samsung", "xiaomi", "motorola"] },
  { nombre: "Licuadora con vaso de vidrio", categoria: "tecnologia", icono: "🥤", formato: "unidades", cantidad: 1, keywords: ["licuadora", "oster", "vaso", "vidrio"] }
];
function getItemsByCategory(categoriaId) {
  return CATALOG_ITEMS.filter((item) => item.categoria === categoriaId);
}

const $$Astro = createAstro("https://mercadolista.com");
const $$Nav = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Nav;
  const pathname = Astro2.url.pathname;
  return renderTemplate`${maybeRenderHead()}<nav class="ml-nav" aria-label="Navegación principal" data-astro-cid-dmqpwcec> <div class="ml-nav__inner" data-astro-cid-dmqpwcec> <a href="/" class="ml-nav__brand" data-astro-cid-dmqpwcec> <img src="/logo.png" alt="Mercado Lista" width="26" height="26" style="border-radius: 6px; vertical-align: middle; margin-right: 0.45rem; display: inline-block;" data-astro-cid-dmqpwcec> <span data-astro-cid-dmqpwcec>Mercado Lista</span> </a> <ul class="ml-nav__desktop" role="list" data-astro-cid-dmqpwcec> ${CATEGORIES.map((c) => renderTemplate`<li data-astro-cid-dmqpwcec> <a${addAttribute(`/categoria/${c.id}`, "href")}${addAttribute(["ml-nav__link", { "ml-nav__link--on": pathname.startsWith(`/categoria/${c.id}`) }], "class:list")} data-astro-cid-dmqpwcec> <span aria-hidden="true" data-astro-cid-dmqpwcec>${c.icono}</span> <span data-astro-cid-dmqpwcec>${c.nombre.split(" ")[0]}</span> </a> </li>`)} </ul> <button class="ml-nav__toggle" id="ml-nav-toggle" aria-label="Abrir menú" aria-expanded="false" aria-controls="ml-nav-mobile" data-astro-cid-dmqpwcec> <span class="ml-nav__bar" data-astro-cid-dmqpwcec></span> <span class="ml-nav__bar" data-astro-cid-dmqpwcec></span> <span class="ml-nav__bar" data-astro-cid-dmqpwcec></span> </button> </div> <div class="ml-nav__mobile" id="ml-nav-mobile" hidden data-astro-cid-dmqpwcec> <ul role="list" data-astro-cid-dmqpwcec> ${CATEGORIES.map((c) => renderTemplate`<li data-astro-cid-dmqpwcec> <a${addAttribute(`/categoria/${c.id}`, "href")}${addAttribute(["ml-nav__mob-link", { "ml-nav__mob-link--on": pathname.startsWith(`/categoria/${c.id}`) }], "class:list")} data-astro-cid-dmqpwcec> <span class="ml-nav__mob-ico" aria-hidden="true" data-astro-cid-dmqpwcec>${c.icono}</span> <span data-astro-cid-dmqpwcec>${c.nombre}</span> </a> </li>`)} </ul> </div> </nav> ${renderScript($$result, "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/components/Nav.astro?astro&type=script&index=0&lang.ts")} `;
}, "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/components/Nav.astro", void 0);

export { $$Nav as $, CATEGORIES as C, CATALOG_ITEMS as a, getItemsByCategory as g };
