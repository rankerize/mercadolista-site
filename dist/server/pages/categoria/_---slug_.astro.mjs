import { e as createAstro, f as createComponent, r as renderTemplate, n as renderScript, k as renderComponent, h as addAttribute, o as Fragment, l as renderHead, u as unescapeHTML } from '../../chunks/astro/server_zl8i4EZZ.mjs';
import 'piccolore';
/* empty css                                        */
import { C as CATEGORIES, $ as $$Nav } from '../../chunks/Nav_C7Siogsq.mjs';
import { s as searchStores } from '../../chunks/index_qWqYRXjv.mjs';
import { b as buildReport } from '../../chunks/ranking_5o1QqFy4.mjs';
import { f as findCity } from '../../chunks/cities_DyPidRWt.mjs';
import { c as cop } from '../../chunks/normalize_BklFQcMY.mjs';
import { $ as $$AddToListModal } from '../../chunks/AddToListModal_BrWp5P3E.mjs';
import { $ as $$GoogleAnalytics } from '../../chunks/GoogleAnalytics_CyJJegFW.mjs';
/* empty css                                     */
export { renderers } from '../../renderers.mjs';

const RAW = {
  // ── L2: Lácteos ──────────────────────────────────────────────────────────
  "lacteos/leche": ["Leche", "Precio Leche en Colombia hoy · Mercado Lista", "🥛 Precio Leche en Colombia hoy", "¿Dónde comprar leche más barata? Compara Colanta, Alpina, Alquería en D1, Éxito, Jumbo.", "leche", "Alto"],
  "lacteos/huevos": ["Huevos", "Precio Huevos en Colombia hoy · Mercado Lista", "🥚 Precio Huevos en Colombia hoy", "¿Dónde está más barata la cubeta de huevos? Compara en D1, Éxito, Jumbo y Carulla.", "huevos cubeta", "Alto"],
  "lacteos/quesos": ["Quesos", "Precio Queso en Colombia hoy · Mercado Lista", "🧀 Precio Queso en Colombia hoy", "¿Dónde comprar queso más barato? Compara Colanta, Alpina en D1, Éxito, Jumbo.", "queso", "Medio"],
  "lacteos/yogurt": ["Yogurt", "Precio Yogurt en Colombia hoy · Mercado Lista", "🥣 Precio Yogurt en Colombia hoy", "¿Dónde está más barato el yogurt? Compara Alpina, Pasco en D1, Éxito, Jumbo y Carulla.", "yogurt", "Medio"],
  "lacteos/mantequilla": ["Mantequilla", "Precio Mantequilla en Colombia hoy · Mercado Lista", "🧈 Precio Mantequilla en Colombia hoy", "¿Dónde está más barata la mantequilla Colanta o Alpina? Compara en D1, Éxito, Jumbo.", "mantequilla", "Medio"],
  "lacteos/crema-de-leche": ["Crema de Leche", "Precio Crema de Leche en Colombia hoy", "🥛 Precio Crema de Leche en Colombia hoy", "Compara crema de leche Alquería, Nestlé en D1, Éxito, Jumbo y Carulla.", "crema de leche", "Bajo"],
  // L3: Leche
  "lacteos/leche/entera": ["Leche Entera", "Precio Leche Entera en Colombia hoy", "🥛 Precio Leche Entera en Colombia hoy", "¿Dónde comprar leche entera más barata? Compara Colanta, Alpina, Alquería en D1, Éxito, Jumbo.", "leche entera", "Alto"],
  "lacteos/leche/deslactosada": ["Leche Deslactosada", "Precio Leche Deslactosada en Colombia hoy", "🥛 Precio Leche Deslactosada en Colombia hoy", "Compara leche deslactosada Colanta, Alpina en D1, Éxito, Jumbo y Carulla.", "leche deslactosada", "Medio"],
  "lacteos/leche/en-polvo": ["Leche en Polvo", "Precio Leche en Polvo en Colombia hoy", "🥛 Precio Leche en Polvo en Colombia hoy", "¿Dónde está más barata la leche en polvo Klim en Colombia? Compara en D1, Éxito, Jumbo.", "leche en polvo", "Medio"],
  "lacteos/leche/vegetal": ["Leche Vegetal", "Precio Leche Vegetal en Colombia hoy", "🥛 Precio Leche Vegetal y de Almendras Colombia hoy", "¿Dónde está más barata la leche de almendras en Colombia? Compara en Éxito, Jumbo.", "leche vegetal almendras", "Medio"],
  // L3: Huevos
  "lacteos/huevos/aa": ["Huevos AA", "Precio Huevos AA en Colombia hoy", "🥚 Precio Huevos AA en Colombia hoy", "¿Dónde está más barata la cubeta de huevos AA? Compara en D1, Éxito, Jumbo y Carulla.", "huevos aa cubeta", "Medio"],
  "lacteos/huevos/aaa": ["Huevos AAA", "Precio Huevos AAA en Colombia hoy", "🥚 Precio Huevos AAA en Colombia hoy", "¿Dónde está más barata la cubeta de huevos AAA? Compara en D1, Éxito, Jumbo y Carulla.", "huevos aaa cubeta", "Medio"],
  "lacteos/huevos/campesinos": ["Huevos Campesinos", "Precio Huevos Campesinos en Colombia hoy", "🥚 Precio Huevos Campesinos en Colombia hoy", "¿Dónde están más baratos los huevos campesinos criollos? Compara en Éxito, Jumbo.", "huevos campesinos criollos", "Bajo"],
  // L3: Quesos
  "lacteos/quesos/campesino": ["Queso Campesino", "Precio Queso Campesino en Colombia hoy", "🧀 Precio Queso Campesino en Colombia hoy", "¿Dónde está más barato el queso campesino? Compara Colanta, Alpina en D1, Éxito.", "queso campesino", "Medio"],
  "lacteos/quesos/mozzarella": ["Queso Mozzarella", "Precio Queso Mozzarella en Colombia hoy", "🧀 Precio Queso Mozzarella en Colombia hoy", "¿Dónde está más barato el queso mozzarella tajado? Compara en D1, Éxito, Jumbo.", "queso mozzarella tajado", "Medio"],
  "lacteos/quesos/parmesano": ["Queso Parmesano", "Precio Queso Parmesano en Colombia hoy", "🧀 Precio Queso Parmesano en Colombia hoy", "¿Dónde está más barato el queso parmesano en Colombia? Compara en Éxito, Jumbo.", "queso parmesano", "Bajo"],
  // L4: Leche Entera por marca
  "lacteos/leche/entera/colanta": ["Leche Entera Colanta", "Precio Leche Entera Colanta en Colombia hoy", "🥛 Precio Leche Entera Colanta en Colombia hoy", "¿Dónde está más barata la leche entera Colanta? Compara en D1, Éxito, Jumbo y Carulla.", "leche entera colanta", "Medio"],
  "lacteos/leche/entera/alpina": ["Leche Entera Alpina", "Precio Leche Entera Alpina en Colombia hoy", "🥛 Precio Leche Entera Alpina en Colombia hoy", "¿Dónde está más barata la leche entera Alpina en Colombia? Compara en D1, Éxito, Jumbo.", "leche entera alpina", "Medio"],
  "lacteos/leche/entera/alqueria": ["Leche Entera Alquería", "Precio Leche Entera Alquería en Colombia hoy", "🥛 Precio Leche Entera Alquería en Colombia hoy", "¿Dónde está más barata la leche Alquería entera? Compara en D1, Éxito, Jumbo y Carulla.", "leche entera alqueria", "Medio"],
  // L4: Leche en Polvo por marca
  "lacteos/leche/en-polvo/klim": ["Leche en Polvo Klim", "Precio Leche en Polvo Klim en Colombia hoy", "🥛 Precio Leche en Polvo Klim en Colombia hoy", "¿Dónde está más barata la leche en polvo Klim en Colombia? Compara en D1, Éxito, Jumbo.", "leche polvo klim", "Medio"],
  // L5: Presentaciones
  "lacteos/leche/entera/colanta/1-litro": ["Leche Colanta Entera 1L", "Precio Leche Entera Colanta 1 Litro Colombia", "🥛 Precio Leche Entera Colanta 1 Litro en Colombia", "¿Cuánto cuesta la leche Colanta entera de 1 litro en Colombia? Compara en D1, Éxito, Jumbo.", "leche entera colanta 1 litro", "Medio"],
  "lacteos/leche/entera/alpina/1-litro": ["Leche Alpina Entera 1L", "Precio Leche Entera Alpina 1 Litro Colombia", "🥛 Precio Leche Entera Alpina 1 Litro en Colombia", "¿Cuánto cuesta la leche Alpina entera de 1 litro en Colombia? Compara en D1, Éxito, Jumbo.", "leche entera alpina 1 litro", "Medio"],
  "lacteos/leche/en-polvo/klim/400g": ["Leche Klim 400g", "Precio Leche Klim 400g en Colombia hoy", "🥛 Precio Leche Klim 400g en Colombia hoy", "¿Cuánto cuesta la leche Klim en polvo 400g en Colombia? Compara en D1, Éxito, Jumbo.", "leche klim 400g", "Medio"],
  // ── L2: Despensa ─────────────────────────────────────────────────────────
  "despensa/arroz": ["Arroz", "Precio Arroz en Colombia hoy · Mercado Lista", "🌾 Precio Arroz en Colombia hoy", "¿Dónde está más barato el arroz en Colombia? Compara Diana, Roa y más en D1, Éxito, Jumbo.", "arroz", "Alto"],
  "despensa/aceites": ["Aceites", "Precio Aceite en Colombia hoy · Mercado Lista", "🌻 Precio Aceite en Colombia hoy", "¿Dónde está más barato el aceite en Colombia? Compara vegetal y oliva en D1, Éxito, Jumbo.", "aceite", "Alto"],
  "despensa/leguminosas": ["Leguminosas", "Precio Frijol y Leguminosas Colombia hoy", "🫘 Precio Frijol y Leguminosas en Colombia hoy", "¿Dónde comprar frijol, lentejas y garbanzos más baratos? Compara en D1, Éxito, Jumbo.", "frijol lentejas", "Medio"],
  "despensa/azucar": ["Azúcar", "Precio Azúcar en Colombia hoy · Mercado Lista", "🍬 Precio Azúcar en Colombia hoy", "¿Dónde está más barata el azúcar Manuelita o Incauca? Compara en D1, Éxito, Jumbo.", "azucar", "Alto"],
  "despensa/panela": ["Panela", "Precio Panela en Colombia hoy · Mercado Lista", "🟫 Precio Panela en Colombia hoy", "¿Dónde está más barata la panela pastilla en Colombia? Compara en D1, Éxito, Jumbo.", "panela", "Medio"],
  "despensa/sal": ["Sal", "Precio Sal en Colombia hoy · Mercado Lista", "🧂 Precio Sal en Colombia hoy", "¿Dónde está más barata la sal Refisal en Colombia? Compara en D1, Éxito, Jumbo.", "sal marina", "Bajo"],
  "despensa/harinas": ["Harinas", "Precio Harinas en Colombia hoy · Mercado Lista", "🌽 Precio Harinas en Colombia hoy", "¿Dónde comprar harina de trigo o maíz PAN más barata? Compara en D1, Éxito, Jumbo.", "harina", "Medio"],
  "despensa/pasta": ["Pasta", "Precio Pasta en Colombia hoy · Mercado Lista", "🍝 Precio Pasta en Colombia hoy", "¿Dónde está más barata la pasta Doria o Comarrico? Compara en D1, Éxito, Jumbo.", "pasta espagueti", "Medio"],
  "despensa/atun": ["Atún", "Precio Atún en Colombia hoy · Mercado Lista", "🐟 Precio Atún en Colombia hoy", "¿Dónde está más barato el atún Van Camps o Isabel? Compara en D1, Éxito, Jumbo.", "atun lomitos", "Medio"],
  // L3: Arroz
  "despensa/arroz/blanco": ["Arroz Blanco", "Precio Arroz Blanco en Colombia hoy", "🌾 Precio Arroz Blanco en Colombia hoy", "¿Dónde está más barato el arroz blanco Diana o Roa? Compara en D1, Éxito, Jumbo.", "arroz blanco", "Alto"],
  "despensa/arroz/integral": ["Arroz Integral", "Precio Arroz Integral en Colombia hoy", "🌾 Precio Arroz Integral en Colombia hoy", "¿Dónde está más barato el arroz integral en Colombia? Compara en D1, Éxito, Jumbo.", "arroz integral", "Medio"],
  // L3: Aceites
  "despensa/aceites/vegetal": ["Aceite Vegetal", "Precio Aceite Vegetal en Colombia hoy", "🌻 Precio Aceite Vegetal en Colombia hoy", "¿Dónde está más barato el aceite vegetal Premier en Colombia? Compara en D1, Éxito, Jumbo.", "aceite vegetal", "Alto"],
  "despensa/aceites/oliva": ["Aceite de Oliva", "Precio Aceite de Oliva en Colombia hoy", "🫒 Precio Aceite de Oliva en Colombia hoy", "¿Dónde está más barato el aceite de oliva Carbonell en Colombia? Compara en Éxito, Jumbo.", "aceite de oliva", "Medio"],
  // L3: Leguminosas
  "despensa/leguminosas/frijol": ["Frijol", "Precio Frijol en Colombia hoy · Mercado Lista", "🫘 Precio Frijol en Colombia hoy", "¿Dónde está más barato el frijol bola roja en Colombia? Compara en D1, Éxito, Jumbo.", "frijol bola roja", "Medio"],
  "despensa/leguminosas/lentejas": ["Lentejas", "Precio Lentejas en Colombia hoy · Mercado Lista", "🍲 Precio Lentejas en Colombia hoy", "¿Dónde están más baratas las lentejas en Colombia? Compara en D1, Éxito, Jumbo.", "lentejas", "Bajo"],
  "despensa/leguminosas/garbanzos": ["Garbanzos", "Precio Garbanzos en Colombia hoy · Mercado Lista", "🍲 Precio Garbanzos en Colombia hoy", "¿Dónde están más baratos los garbanzos en Colombia? Compara en D1, Éxito, Jumbo.", "garbanzos", "Bajo"],
  // L3: Harinas
  "despensa/harinas/trigo": ["Harina de Trigo", "Precio Harina de Trigo en Colombia hoy", "🌾 Precio Harina de Trigo en Colombia hoy", "¿Dónde está más barata la harina de trigo Haz de Oros? Compara en D1, Éxito, Jumbo.", "harina de trigo", "Medio"],
  "despensa/harinas/maiz": ["Harina de Maíz PAN", "Precio Harina de Maíz PAN en Colombia hoy", "🌽 Precio Harina de Maíz PAN en Colombia hoy", "¿Dónde está más barata la harina PAN para arepas? Compara en D1, Éxito, Jumbo.", "harina maiz arepas pan", "Medio"],
  // L3: Atún
  "despensa/atun/en-agua": ["Atún en Agua", "Precio Atún en Agua en Colombia hoy", "🐟 Precio Atún en Agua en Colombia hoy", "¿Dónde está más barato el atún en agua Van Camps o Isabel? Compara en D1, Éxito, Jumbo.", "atun lomitos agua", "Medio"],
  "despensa/atun/en-aceite": ["Atún en Aceite", "Precio Atún en Aceite en Colombia hoy", "🐟 Precio Atún en Aceite en Colombia hoy", "¿Dónde está más barato el atún en aceite Van Camps? Compara en D1, Éxito, Jumbo.", "atun lomitos aceite", "Bajo"],
  // L4: Arroz por marca
  "despensa/arroz/blanco/diana": ["Arroz Diana", "Precio Arroz Diana en Colombia hoy", "🌾 Precio Arroz Diana en Colombia hoy", "¿Dónde está más barato el arroz Diana en Colombia? Compara en D1, Éxito, Jumbo.", "arroz diana", "Alto"],
  "despensa/arroz/blanco/roa": ["Arroz Roa", "Precio Arroz Roa en Colombia hoy · Mercado Lista", "🌾 Precio Arroz Roa en Colombia hoy", "¿Dónde está más barato el arroz Roa en Colombia? Compara en D1, Éxito, Jumbo.", "arroz roa", "Medio"],
  // L4: Aceites por marca
  "despensa/aceites/vegetal/premier": ["Aceite Premier", "Precio Aceite Premier en Colombia hoy", "🌻 Precio Aceite Premier en Colombia hoy", "¿Dónde está más barato el aceite Premier en Colombia? Compara en D1, Éxito, Jumbo.", "aceite premier", "Alto"],
  "despensa/aceites/oliva/carbonell": ["Aceite Carbonell", "Precio Aceite de Oliva Carbonell Colombia", "🫒 Precio Aceite de Oliva Carbonell en Colombia", "¿Dónde está más barato el aceite Carbonell en Colombia? Compara en Éxito, Jumbo.", "aceite oliva carbonell", "Medio"],
  // L5: Presentaciones arroz
  "despensa/arroz/blanco/diana/1kg": ["Arroz Diana 1kg", "Precio Arroz Diana 1kg en Colombia hoy", "🌾 Precio Arroz Diana 1kg en Colombia hoy", "¿Cuánto cuesta el arroz Diana de 1 kilo en Colombia? Compara en D1, Éxito, Jumbo.", "arroz diana 1kg", "Medio"],
  "despensa/arroz/blanco/diana/5kg": ["Arroz Diana 5kg", "Precio Arroz Diana 5kg en Colombia hoy", "🌾 Precio Arroz Diana 5kg en Colombia hoy", "¿Cuánto cuesta el arroz Diana de 5 kilos en Colombia? Compara en D1, Éxito, Jumbo.", "arroz diana 5kg", "Medio"],
  // L5: Presentaciones aceite
  "despensa/aceites/vegetal/premier/1-litro": ["Aceite Premier 1L", "Precio Aceite Premier 1 Litro Colombia hoy", "🌻 Precio Aceite Premier 1 Litro en Colombia", "¿Cuánto cuesta el aceite Premier de 1 litro en Colombia? Compara en D1, Éxito, Jumbo.", "aceite premier 1 litro", "Medio"],
  "despensa/aceites/vegetal/premier/3-litros": ["Aceite Premier 3L", "Precio Aceite Premier 3 Litros Colombia hoy", "🌻 Precio Aceite Premier 3 Litros en Colombia", "¿Cuánto cuesta el aceite Premier de 3 litros en Colombia? Compara en D1, Éxito, Jumbo.", "aceite premier 3 litros", "Medio"],
  // ── L2: Carnes ───────────────────────────────────────────────────────────
  "carnes/pollo": ["Pollo", "Precio Pollo en Colombia hoy · Mercado Lista", "🍗 Precio Pollo en Colombia hoy", "¿Dónde está más barato el pollo en Colombia? Compara pechuga y muslos en Éxito, Jumbo.", "pollo", "Alto"],
  "carnes/res": ["Carne de Res", "Precio Carne de Res en Colombia hoy", "🥩 Precio Carne de Res en Colombia hoy", "¿Dónde está más barata la carne de res en Colombia? Compara en Éxito, Jumbo y Carulla.", "carne res", "Alto"],
  "carnes/cerdo": ["Cerdo", "Precio Carne de Cerdo en Colombia hoy", "🍖 Precio Carne de Cerdo en Colombia hoy", "¿Dónde está más barata la costilla de cerdo en Colombia? Compara en Éxito, Jumbo.", "cerdo costilla", "Medio"],
  "carnes/pescado": ["Pescado", "Precio Pescado en Colombia hoy · Mercado Lista", "🍣 Precio Pescado en Colombia hoy", "¿Dónde está más barato el salmón y pescado fresco en Colombia? Compara en Éxito, Jumbo.", "salmon pescado", "Medio"],
  // L3: Pollo
  "carnes/pollo/pechuga": ["Pechuga de Pollo", "Precio Pechuga de Pollo en Colombia hoy", "🍗 Precio Pechuga de Pollo en Colombia hoy", "¿Dónde está más barata la pechuga de pollo en Colombia? Compara en Éxito, Jumbo.", "pechuga de pollo", "Alto"],
  "carnes/pollo/muslos": ["Muslos de Pollo", "Precio Muslos de Pollo en Colombia hoy", "🍗 Precio Muslos de Pollo en Colombia hoy", "¿Dónde están más baratos los muslos de pollo en Colombia? Compara en Éxito, Jumbo.", "muslos pollo piernas", "Medio"],
  // L3: Res
  "carnes/res/carne-molida": ["Carne Molida", "Precio Carne Molida en Colombia hoy", "🥩 Precio Carne Molida de Res en Colombia hoy", "¿Dónde está más barata la carne molida especial de res? Compara en Éxito, Jumbo.", "carne molida res", "Alto"],
  "carnes/res/lomo": ["Lomo de Res", "Precio Lomo de Res en Colombia hoy", "🥩 Precio Lomo Fino de Res en Colombia hoy", "¿Dónde está más barato el lomo fino de res en Colombia? Compara en Éxito, Jumbo.", "lomo fino res", "Medio"],
  // ── L2: Frutas ───────────────────────────────────────────────────────────
  "frutas/tomate": ["Tomate", "Precio Tomate en Colombia hoy · Mercado Lista", "🍅 Precio Tomate en Colombia hoy", "¿Cuánto vale el kilo de tomate chonto en Colombia hoy? Compara en Éxito, Jumbo.", "tomate", "Alto"],
  "frutas/cebolla": ["Cebolla", "Precio Cebolla en Colombia hoy · Mercado Lista", "🧅 Precio Cebolla en Colombia hoy", "¿Cuánto vale el kilo de cebolla cabezona en Colombia? Compara en Éxito, Jumbo.", "cebolla", "Medio"],
  "frutas/papa": ["Papa", "Precio Papa en Colombia hoy · Mercado Lista", "🥔 Precio Papa en Colombia hoy", "¿Dónde está más barata la papa pastusa en Colombia? Compara en Éxito, Jumbo, D1.", "papa", "Alto"],
  "frutas/aguacate": ["Aguacate", "Precio Aguacate en Colombia hoy · Mercado Lista", "🥑 Precio Aguacate en Colombia hoy", "¿Cuánto vale el kilo de aguacate Hass en Colombia hoy? Compara en Éxito, Jumbo.", "aguacate", "Alto"],
  "frutas/platano": ["Plátano", "Precio Plátano en Colombia hoy · Mercado Lista", "🍌 Precio Plátano en Colombia hoy", "¿Cuánto vale el plátano verde y maduro en Colombia hoy? Compara en Éxito, Jumbo.", "platano", "Alto"],
  "frutas/banano": ["Banano", "Precio Banano en Colombia hoy · Mercado Lista", "🍌 Precio Banano en Colombia hoy", "¿Cuánto vale el kilo de banano criollo en Colombia hoy? Compara en Éxito, Jumbo.", "banano", "Medio"],
  "frutas/manzana": ["Manzana", "Precio Manzana en Colombia hoy · Mercado Lista", "🍎 Precio Manzana en Colombia hoy", "¿Cuánto vale el kilo de manzana roja en Colombia hoy? Compara en Éxito, Jumbo.", "manzana", "Medio"],
  "frutas/limon": ["Limón", "Precio Limón en Colombia hoy · Mercado Lista", "🍋 Precio Limón en Colombia hoy", "¿Cuánto vale el kilo de limón en Colombia hoy? Compara en Éxito, Jumbo, D1.", "limon", "Medio"],
  "frutas/zanahoria": ["Zanahoria", "Precio Zanahoria en Colombia hoy · Mercado Lista", "🥕 Precio Zanahoria en Colombia hoy", "¿Cuánto vale el kilo de zanahoria en Colombia hoy? Compara en Éxito, Jumbo, D1.", "zanahoria", "Bajo"],
  // L3: Plátano
  "frutas/platano/verde": ["Plátano Verde", "Precio Plátano Verde en Colombia hoy", "🍌 Precio Plátano Verde en Colombia hoy", "¿Cuánto vale el plátano verde para patacón en Colombia? Compara en Éxito, Jumbo.", "platano verde patacon", "Medio"],
  "frutas/platano/maduro": ["Plátano Maduro", "Precio Plátano Maduro en Colombia hoy", "🍌 Precio Plátano Maduro en Colombia hoy", "¿Cuánto vale el plátano maduro en Colombia hoy? Compara en Éxito, Jumbo, D1.", "platano maduro", "Medio"],
  // ── L2: Aseo ─────────────────────────────────────────────────────────────
  "aseo/detergentes": ["Detergentes", "Precio Detergente en Colombia hoy · Mercado Lista", "🧼 Precio Detergente en Colombia hoy", "¿Dónde está más barato el detergente Ariel o Fab en Colombia? Compara en D1, Éxito, Jumbo.", "detergente", "Alto"],
  "aseo/suavizante": ["Suavizante de Ropa", "Precio Suavizante de Ropa Colombia hoy", "🌸 Precio Suavizante de Ropa en Colombia hoy", "¿Dónde está más barato el Downy o Soflan? Compara en D1, Éxito, Jumbo y Carulla.", "suavizante ropa", "Medio"],
  "aseo/blanqueador": ["Blanqueador", "Precio Blanqueador en Colombia hoy · Mercado Lista", "🧴 Precio Blanqueador en Colombia hoy", "¿Dónde está más barato el Clorox y blanqueador en Colombia? Compara en D1, Éxito, Jumbo.", "blanqueador cloro", "Medio"],
  "aseo/lavaplatos": ["Lavaplatos", "Precio Lavaplatos en Colombia hoy · Mercado Lista", "🧽 Precio Lavaplatos en Colombia hoy", "¿Dónde está más barato el Axion lavaplatos en Colombia? Compara en D1, Éxito, Jumbo.", "lavaplatos axion", "Medio"],
  "aseo/papel-higienico": ["Papel Higiénico", "Precio Papel Higiénico en Colombia hoy", "🧻 Precio Papel Higiénico en Colombia hoy", "¿Dónde está más barato el papel Familia o Scott en Colombia? Compara en D1, Éxito, Jumbo.", "papel higienico", "Alto"],
  "aseo/limpiapisos": ["Limpiapisos", "Precio Limpiapisos en Colombia hoy · Mercado Lista", "🧹 Precio Limpiapisos en Colombia hoy", "¿Dónde está más barato el Fabuloso o Poett en Colombia? Compara en D1, Éxito, Jumbo.", "limpiapisos", "Medio"],
  // L3: Detergentes
  "aseo/detergentes/liquido": ["Detergente Líquido", "Precio Detergente Líquido en Colombia hoy", "🧼 Precio Detergente Líquido Ropa en Colombia hoy", "¿Dónde está más barato el detergente líquido Ariel en Colombia? Compara en D1, Éxito, Jumbo.", "detergente liquido ropa", "Medio"],
  "aseo/detergentes/polvo": ["Detergente en Polvo", "Precio Detergente en Polvo en Colombia hoy", "🧼 Precio Detergente en Polvo en Colombia hoy", "¿Dónde está más barato el detergente en polvo Ariel o Fab? Compara en D1, Éxito, Jumbo.", "detergente polvo ropa", "Medio"],
  // ── L2: Cuidado ──────────────────────────────────────────────────────────
  "cuidado/champu": ["Champú", "Precio Champú en Colombia hoy · Mercado Lista", "🧴 Precio Champú en Colombia hoy", "¿Dónde está más barato el champú en Colombia? Compara Head Shoulders y Pantene en D1, Éxito.", "champu shampoo", "Medio"],
  "cuidado/jabon": ["Jabón de Baño", "Precio Jabón de Baño en Colombia hoy", "🧼 Precio Jabón de Baño en Colombia hoy", "¿Dónde está más barato el jabón Dove o Palmolive en Colombia? Compara en D1, Éxito, Jumbo.", "jabon barra", "Medio"],
  "cuidado/crema-dental": ["Crema Dental", "Precio Crema Dental en Colombia hoy · Mercado Lista", "🪥 Precio Crema Dental en Colombia hoy", "¿Dónde está más barato el Colgate en Colombia? Compara en D1, Éxito, Jumbo y Carulla.", "crema dental", "Medio"],
  "cuidado/desodorante": ["Desodorante", "Precio Desodorante en Colombia hoy · Mercado Lista", "🧴 Precio Desodorante en Colombia hoy", "¿Dónde está más barato el Rexona o Axe en Colombia? Compara en D1, Éxito, Jumbo.", "desodorante", "Medio"],
  // ── L2: Café ─────────────────────────────────────────────────────────────
  "cafe/cafe-tipo": ["Café", "Precio Café en Colombia hoy · Mercado Lista", "☕ Precio Café en Colombia hoy", "¿Dónde está más barato el café en Colombia? Compara Sello Rojo, Águila Roja, Juan Valdez.", "cafe", "Alto"],
  "cafe/pan-tajado": ["Pan Tajado", "Precio Pan Tajado en Colombia hoy · Mercado Lista", "🍞 Precio Pan Tajado en Colombia hoy", "¿Dónde está más barato el pan tajado Bimbo en Colombia? Compara en D1, Éxito, Jumbo.", "pan tajado", "Alto"],
  "cafe/chocolate": ["Chocolate", "Precio Chocolate de Mesa en Colombia hoy", "🍫 Precio Chocolate de Mesa en Colombia hoy", "¿Dónde está más barato el chocolate Corona o Luker? Compara en D1, Éxito, Jumbo.", "chocolate mesa", "Medio"],
  "cafe/avena": ["Avena", "Precio Avena en Colombia hoy · Mercado Lista", "🥣 Precio Avena en Colombia hoy", "¿Dónde está más barata la avena Quaker en Colombia? Compara en D1, Éxito, Jumbo.", "avena hojuelas", "Medio"],
  "cafe/galletas": ["Galletas", "Precio Galletas en Colombia hoy · Mercado Lista", "🍪 Precio Galletas en Colombia hoy", "¿Dónde están más baratas las galletas Saltín Noel en Colombia? Compara en D1, Éxito, Jumbo.", "galletas", "Medio"],
  // L3: Café
  "cafe/cafe-tipo/molido": ["Café Molido", "Precio Café Molido en Colombia hoy", "☕ Precio Café Molido en Colombia hoy", "¿Dónde está más barato el café molido Sello Rojo o Águila Roja? Compara en D1, Éxito.", "cafe molido", "Alto"],
  "cafe/cafe-tipo/instantaneo": ["Café Instantáneo", "Precio Café Instantáneo en Colombia hoy", "☕ Precio Café Instantáneo en Colombia hoy", "¿Dónde está más barato el Colcafé o Nescafé en Colombia? Compara en D1, Éxito, Jumbo.", "cafe instantaneo", "Medio"],
  // L3: Pan
  "cafe/pan-tajado/blanco": ["Pan Tajado Blanco", "Precio Pan Tajado Blanco en Colombia hoy", "🍞 Precio Pan Tajado Blanco en Colombia hoy", "¿Dónde está más barato el pan Bimbo o Comapan en Colombia? Compara en D1, Éxito, Jumbo.", "pan tajado blanco", "Medio"],
  "cafe/pan-tajado/integral": ["Pan Tajado Integral", "Precio Pan Integral Tajado en Colombia hoy", "🍞 Precio Pan Integral Tajado en Colombia hoy", "¿Dónde está más barato el pan integral Bimbo en Colombia? Compara en D1, Éxito, Jumbo.", "pan tajado integral", "Medio"],
  // ── L2: Tecnología ───────────────────────────────────────────────────────
  "tecnologia/televisores": ["Televisores", "Precio Televisores en Colombia hoy · Mercado Lista", "📺 Precio Televisores en Colombia hoy", "¿Dónde comprar televisor más barato en Colombia? Compara Samsung, LG en Éxito, Alkosto.", "televisor", "Alto"],
  "tecnologia/celulares": ["Celulares", "Precio Celulares en Colombia hoy · Mercado Lista", "📱 Precio Celulares en Colombia hoy", "¿Dónde comprar celular más barato en Colombia? Compara Samsung, Xiaomi, Motorola en Éxito.", "celular smartphone", "Alto"],
  "tecnologia/laptops": ["Laptops y Portátiles", "Precio Laptops en Colombia hoy · Mercado Lista", "💻 Precio Laptops y Portátiles en Colombia hoy", "Compara precios de portátiles HP, Lenovo y Asus en Éxito, Alkosto y Falabella.", "portatil laptop", "Alto"],
  "tecnologia/freidoras-de-aire": ["Freidoras de Aire", "Precio Freidora de Aire en Colombia hoy", "🍟 Precio Freidora de Aire en Colombia hoy", "¿Dónde está más barata la freidora de aire en Colombia? Compara en Éxito, Alkosto.", "freidora aire", "Alto"],
  "tecnologia/audifonos": ["Audífonos", "Precio Audífonos en Colombia hoy · Mercado Lista", "🎧 Precio Audífonos en Colombia hoy", "Compara precio de audífonos inalámbricos bluetooth en Éxito, Alkosto y Falabella.", "audifonos", "Alto"],
  "tecnologia/licuadoras": ["Licuadoras", "Precio Licuadoras en Colombia hoy · Mercado Lista", "🥤 Precio Licuadoras en Colombia hoy", "¿Dónde está más barata la licuadora en Colombia? Compara Oster y más en Éxito, Alkosto.", "licuadora", "Medio"],
  // L3: Televisores
  "tecnologia/televisores/smart-tv": ["Smart TV", "Precio Smart TV en Colombia hoy · Comparar", "📺 Precio Smart TV en Colombia hoy", "¿Dónde comprar Smart TV más barato en Colombia? Compara Samsung, LG, TCL en Éxito, Alkosto.", "televisor smart tv", "Alto"],
  "tecnologia/televisores/4k": ["Televisor 4K", "Precio Televisor 4K en Colombia hoy · Comparar", "📺 Precio Televisor 4K en Colombia hoy", "¿Dónde comprar televisor 4K más barato en Colombia? Compara Samsung, LG en Éxito, Alkosto.", "televisor 4k uhd", "Alto"],
  // L3: Celulares
  "tecnologia/celulares/samsung": ["Samsung", "Precio Celular Samsung en Colombia hoy", "📱 Precio Celular Samsung en Colombia hoy", "¿Dónde comprar Samsung más barato en Colombia? Compara Galaxy A y S en Éxito, Alkosto.", "celular samsung", "Alto"],
  "tecnologia/celulares/xiaomi": ["Xiaomi", "Precio Celular Xiaomi en Colombia hoy", "📱 Precio Celular Xiaomi en Colombia hoy", "¿Dónde comprar Xiaomi más barato en Colombia? Compara Redmi Note y Poco en Éxito, Alkosto.", "celular xiaomi", "Alto"],
  "tecnologia/celulares/motorola": ["Motorola", "Precio Celular Motorola en Colombia hoy", "📱 Precio Celular Motorola en Colombia hoy", "¿Dónde comprar Motorola más barato en Colombia? Compara Moto G y Edge en Éxito, Alkosto.", "celular motorola", "Medio"],
  // L3: Laptops
  "tecnologia/laptops/hp": ["HP", "Precio Portátil HP en Colombia hoy", "💻 Precio Portátil HP en Colombia hoy", "¿Dónde comprar portátil HP más barato en Colombia? Compara en Éxito, Alkosto y Falabella.", "portatil hp", "Alto"],
  "tecnologia/laptops/lenovo": ["Lenovo", "Precio Portátil Lenovo en Colombia hoy", "💻 Precio Portátil Lenovo en Colombia hoy", "¿Dónde comprar portátil Lenovo más barato en Colombia? Compara en Éxito, Alkosto.", "portatil lenovo", "Medio"],
  "tecnologia/laptops/asus": ["Asus", "Precio Portátil Asus en Colombia hoy", "💻 Precio Portátil Asus en Colombia hoy", "¿Dónde comprar portátil Asus más barato en Colombia? Compara en Éxito, Alkosto.", "portatil asus", "Medio"],
  // L3: Audífonos
  "tecnologia/audifonos/bluetooth": ["Bluetooth", "Precio Audífonos Bluetooth en Colombia hoy", "🎧 Precio Audífonos Bluetooth en Colombia hoy", "¿Dónde comprar audífonos bluetooth más baratos en Colombia? Compara en Éxito, Alkosto.", "audifonos bluetooth", "Alto"],
  "tecnologia/audifonos/inalambricos": ["Inalámbricos", "Precio Audífonos Inalámbricos en Colombia", "🎧 Precio Audífonos Inalámbricos en Colombia hoy", "¿Dónde comprar audífonos inalámbricos más baratos? Compara en Éxito, Alkosto y Falabella.", "audifonos inalambricos", "Alto"],
  // L3: Freidoras
  "tecnologia/freidoras-de-aire/oster": ["Oster", "Precio Air Fryer Oster en Colombia hoy", "🍟 Precio Freidora de Aire Oster en Colombia hoy", "¿Dónde está más barata la freidora Oster en Colombia? Compara en Éxito, Alkosto y Falabella.", "freidora aire oster", "Medio"],
  // L4: Smart TV por marca
  "tecnologia/televisores/smart-tv/samsung": ["Samsung", "Precio Smart TV Samsung en Colombia hoy", "📺 Precio Smart TV Samsung en Colombia hoy", "¿Dónde comprar Smart TV Samsung más barato? Compara Crystal y QLED en Éxito, Alkosto.", "televisor samsung smart tv", "Alto"],
  "tecnologia/televisores/smart-tv/lg": ["LG", "Precio Smart TV LG en Colombia hoy", "📺 Precio Smart TV LG en Colombia hoy", "¿Dónde comprar Smart TV LG más barato en Colombia? Compara OLED y NanoCell en Éxito.", "televisor lg smart tv", "Medio"],
  "tecnologia/televisores/smart-tv/tcl": ["TCL", "Precio Smart TV TCL en Colombia hoy", "📺 Precio Smart TV TCL en Colombia hoy", "¿Dónde comprar Smart TV TCL más barato en Colombia? Compara en Éxito, Alkosto y Falabella.", "televisor tcl smart tv", "Medio"],
  // L4: Celulares Samsung por línea
  "tecnologia/celulares/samsung/galaxy-a": ["Galaxy A", "Precio Samsung Galaxy A en Colombia hoy", "📱 Precio Samsung Galaxy A en Colombia hoy", "¿Dónde comprar Samsung Galaxy A más barato? Compara A15, A35, A55 en Éxito, Alkosto.", "samsung galaxy a", "Alto"],
  "tecnologia/celulares/samsung/galaxy-s": ["Galaxy S", "Precio Samsung Galaxy S en Colombia hoy", "📱 Precio Samsung Galaxy S Colombia hoy", "¿Dónde comprar Samsung Galaxy S más barato? Compara S24 y S25 en Éxito, Alkosto.", "samsung galaxy s", "Medio"],
  // L4: Xiaomi por línea
  "tecnologia/celulares/xiaomi/redmi-note": ["Redmi Note", "Precio Xiaomi Redmi Note en Colombia hoy", "📱 Precio Xiaomi Redmi Note en Colombia hoy", "¿Dónde comprar Xiaomi Redmi Note más barato? Compara en Éxito, Alkosto y Falabella.", "xiaomi redmi note", "Medio"],
  // L5: Samsung Smart TV por pulgadas
  "tecnologia/televisores/smart-tv/samsung/55-pulgadas": ["55 Pulgadas", "Precio Samsung Smart TV 55 Pulgadas Colombia", "📺 Precio Samsung Smart TV 55 Pulgadas en Colombia", "¿Cuánto cuesta el Samsung Smart TV de 55 pulgadas en Colombia hoy? Compara en Éxito, Alkosto.", "televisor samsung 55 pulgadas", "Alto"],
  "tecnologia/televisores/smart-tv/samsung/65-pulgadas": ["65 Pulgadas", "Precio Samsung Smart TV 65 Pulgadas Colombia", "📺 Precio Samsung Smart TV 65 Pulgadas en Colombia", "¿Cuánto cuesta el Samsung Smart TV de 65 pulgadas en Colombia hoy? Compara en Éxito, Alkosto.", "televisor samsung 65 pulgadas", "Medio"],
  // L5: Celulares por modelo
  "tecnologia/celulares/samsung/galaxy-a/a55": ["A55", "Precio Samsung Galaxy A55 en Colombia hoy", "📱 Precio Samsung Galaxy A55 en Colombia hoy", "¿Cuánto cuesta el Samsung Galaxy A55 en Colombia hoy? Compara en Éxito, Alkosto y Falabella.", "samsung galaxy a55", "Medio"],
  "tecnologia/celulares/samsung/galaxy-s/s25": ["S25", "Precio Samsung Galaxy S25 en Colombia hoy", "📱 Precio Samsung Galaxy S25 en Colombia hoy", "¿Cuánto cuesta el Samsung Galaxy S25 en Colombia hoy? Compara en Éxito, Alkosto y Falabella.", "samsung galaxy s25", "Alto"]
};
const TAX = Object.fromEntries(
  Object.entries(RAW).map(([k, v]) => [k, {
    nombre: v[0],
    titleSeo: v[1],
    h1: v[2],
    metaDesc: v[3],
    query: v[4],
    vol: v[5]
  }])
);
function getTaxNode(path) {
  return TAX[path];
}
function getTaxChildren(path) {
  const prefix = path + "/";
  return Object.entries(TAX).filter(([k]) => k.startsWith(prefix) && !k.slice(prefix.length).includes("/")).map(([k, node]) => ({ path: k, node }));
}
function getBreadcrumb(segments, base = "https://mercadolista.com") {
  const crumbs = [
    { name: "Inicio", item: base },
    { name: "Categorías", item: `${base}/categoria` }
  ];
  for (let i = 1; i <= segments.length; i++) {
    const subPath = segments.slice(0, i).join("/");
    const fullUrl = `${base}/categoria/${subPath}`;
    if (i === 1) {
      const cat = CATEGORIES.find((c) => c.id === segments[0]);
      if (cat) crumbs.push({ name: cat.nombre, item: fullUrl });
    } else {
      const node = TAX[subPath];
      if (node) crumbs.push({ name: node.nombre, item: fullUrl });
    }
  }
  return crumbs;
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a, _b;
const $$Astro = createAstro("https://mercadolista.com");
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const { slug } = Astro2.params;
  const segments = (slug ?? "").split("/").filter(Boolean);
  if (segments.length < 2) {
    return Astro2.redirect("/categoria", 302);
  }
  const catId = segments[0];
  const taxPath = segments.join("/");
  const cat = CATEGORIES.find((c) => c.id === catId);
  if (!cat) return Astro2.redirect("/categoria", 302);
  const node = getTaxNode(taxPath);
  if (!node) return Astro2.redirect(`/categoria/${catId}`, 302);
  const children = getTaxChildren(taxPath);
  const isLeaf = children.length === 0;
  const BASE = "https://mercadolista.com";
  const canonicalUrl = `${BASE}/categoria/${taxPath}`;
  const city = findCity("bogota");
  let report = null;
  let errorMsg = null;
  if (isLeaf || segments.length >= 3) {
    try {
      const outcomes = await searchStores(node.query, city);
      report = buildReport(node.query, outcomes);
    } catch {
      errorMsg = "No pudimos consultar los precios en este momento. Intenta de nuevo en unos segundos.";
    }
  }
  const verdict = report?.verdict ?? null;
  const offers = report?.offers ?? [];
  const topOffers = offers.slice(0, 8);
  const crumbData = getBreadcrumb(segments, BASE);
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbData.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.item
    }))
  };
  const schemaOffers = topOffers.map((o) => ({
    "@type": "Offer",
    price: o.price.toFixed(0),
    priceCurrency: "COP",
    availability: "https://schema.org/InStock",
    seller: { "@type": "Organization", name: o.store_name },
    url: o.url
  }));
  const productSchema = isLeaf ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: node.nombre,
    description: node.metaDesc,
    ...verdict?.image ? { image: verdict.image } : {},
    offers: schemaOffers.length > 0 ? schemaOffers : void 0
  } : null;
  return renderTemplate(_b || (_b = __template(['<html lang="es" data-astro-cid-nhjqudez> <head>', '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>', '</title><meta name="description"', '><link rel="canonical"', '><meta property="og:title"', '><meta property="og:description"', '><meta property="og:url"', '><meta property="og:type" content="website">', '<meta name="theme-color" content="#0e6a45"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="manifest" href="/manifest.webmanifest"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,640&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet"><script type="application/ld+json">', "<\/script>", "", "</head> <body data-astro-cid-nhjqudez> ", ' <header class="top" data-astro-cid-nhjqudez> <h1 data-astro-cid-nhjqudez>', '</h1> <h2 class="page-subtitle" data-astro-cid-nhjqudez>', '</h2> <p class="lead" data-astro-cid-nhjqudez> ', ' </p> </header> <main class="tax-page" data-astro-cid-nhjqudez> <!-- Breadcrumb --> <nav class="breadcrumb" aria-label="Navegaci\xF3n" data-astro-cid-nhjqudez> ', " </nav> ", "  ", "  ", "  ", " ", ' <div class="cta-home" data-astro-cid-nhjqudez> <p data-astro-cid-nhjqudez>\xBFQuieres comparar otro producto o armar tu lista del mercado?</p> <a href="/" class="btn-home" data-astro-cid-nhjqudez>Ir al comparador \u2192</a> </div> </main> ', ' <footer class="site-footer" data-astro-cid-nhjqudez> <p data-astro-cid-nhjqudez>\xA9 ', " Mercado Lista \xB7 Precios consultados en tiempo real en Bogot\xE1</p> </footer> ", "  </body> </html>"])), renderComponent($$result, "GoogleAnalytics", $$GoogleAnalytics, { "data-astro-cid-nhjqudez": true }), node.titleSeo, addAttribute(node.metaDesc, "content"), addAttribute(canonicalUrl, "href"), addAttribute(node.titleSeo, "content"), addAttribute(verdict ? `${verdict.headline} \xB7 ${cop(verdict.price)} en ${verdict.store_name}` : node.metaDesc, "content"), addAttribute(canonicalUrl, "content"), verdict?.image && renderTemplate`<meta property="og:image"${addAttribute(verdict.image, "content")}>`, unescapeHTML(JSON.stringify(breadcrumbSchema)), productSchema && renderTemplate(_a || (_a = __template(['<script type="application/ld+json">', "<\/script>"])), unescapeHTML(JSON.stringify(productSchema))), renderHead(), renderComponent($$result, "Nav", $$Nav, { "data-astro-cid-nhjqudez": true }), node.nombre, node.h1, isLeaf ? `Comparaci\xF3n en tiempo real \xB7 ${city.name}` : `${children.length} subcategor\xEDas \xB7 ${cat.nombre}`, crumbData.map((c, i) => renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "data-astro-cid-nhjqudez": true }, { "default": async ($$result2) => renderTemplate`${i > 0 && renderTemplate`<span aria-hidden="true" data-astro-cid-nhjqudez>›</span>`}${i < crumbData.length - 1 ? renderTemplate`<a${addAttribute(c.item.replace(BASE, ""), "href")} data-astro-cid-nhjqudez>${c.name}</a>` : renderTemplate`<span aria-current="page" data-astro-cid-nhjqudez>${c.name}</span>`}` })}`), errorMsg && renderTemplate`<div class="error-banner" role="alert" data-astro-cid-nhjqudez>${errorMsg}</div>`, !isLeaf && children.length > 0 && renderTemplate`<section class="children-section"${addAttribute(`Subcategor\xEDas de ${node.nombre}`, "aria-label")} data-astro-cid-nhjqudez> <ul class="children-grid" role="list" data-astro-cid-nhjqudez> ${children.map(({ path, node: child }) => renderTemplate`<li data-astro-cid-nhjqudez> <a${addAttribute(`/categoria/${path}`, "href")} class="child-card" data-astro-cid-nhjqudez> <span class="child-nombre" data-astro-cid-nhjqudez>${child.nombre}</span> <span class="child-cta" data-astro-cid-nhjqudez>Ver precios →</span> </a> </li>`)} </ul> </section>`, verdict && renderTemplate`<section class="verdict-box" aria-label="Veredicto" data-astro-cid-nhjqudez> <div class="verdict-winner" data-astro-cid-nhjqudez> ${verdict.image && renderTemplate`<img${addAttribute(verdict.image, "src")}${addAttribute(verdict.name, "alt")} class="verdict-img" width="80" height="80" loading="eager" data-astro-cid-nhjqudez>`} <div class="verdict-text" data-astro-cid-nhjqudez> <p class="verdict-headline" data-astro-cid-nhjqudez>${verdict.headline}</p> <p class="verdict-price" data-astro-cid-nhjqudez> <strong data-astro-cid-nhjqudez>${cop(verdict.price)}</strong> <span class="verdict-store" data-astro-cid-nhjqudez>en ${verdict.store_name}</span> </p> ${verdict.detail && renderTemplate`<p class="verdict-detail" data-astro-cid-nhjqudez>${verdict.detail}</p>`} ${verdict.payment_note && renderTemplate`<p class="verdict-payment" data-astro-cid-nhjqudez>💳 ${verdict.payment_note}</p>`} </div> </div> <div class="verdict-actions" data-astro-cid-nhjqudez> <a${addAttribute(verdict.url, "href")} target="_blank" rel="noopener noreferrer" class="btn-buy" data-astro-cid-nhjqudez>
Ver en ${verdict.store_name} →
</a> <button type="button" class="btn-add-list"${addAttribute(verdict.name, "data-name")}${addAttribute(verdict.store_name, "data-store")}${addAttribute(verdict.price, "data-price")}${addAttribute(verdict.image ?? "", "data-image")} data-astro-cid-nhjqudez>
➕ Agregar a lista
</button> </div> </section>`, topOffers.length > 0 && renderTemplate`<section class="offers-section" aria-label="Precios por tienda" data-astro-cid-nhjqudez> <h2 data-astro-cid-nhjqudez>Precios por tienda</h2> <ul class="offers-list" role="list" data-astro-cid-nhjqudez> ${topOffers.map((o, i) => renderTemplate`<li${addAttribute(`offer-row ${i === 0 ? "offer-row--winner" : ""}`, "class")} data-astro-cid-nhjqudez> <div class="offer-row-left" data-astro-cid-nhjqudez> ${o.image && renderTemplate`<img${addAttribute(o.image, "src")}${addAttribute(o.name, "alt")} class="offer-thumb" width="48" height="48" loading="lazy" data-astro-cid-nhjqudez>`} <div class="offer-row-info" data-astro-cid-nhjqudez> <span class="offer-store" data-astro-cid-nhjqudez>${o.store_name}</span> <span class="offer-name" data-astro-cid-nhjqudez>${o.name}</span> ${o.unit_price && renderTemplate`<span class="offer-unit" data-astro-cid-nhjqudez>${cop(o.unit_price)} / ${o.unit_label}</span>`} </div> </div> <div class="offer-row-right" data-astro-cid-nhjqudez> <span class="offer-price" data-astro-cid-nhjqudez>${cop(o.price)}</span> ${o.list_price && o.list_price > o.price && renderTemplate`<span class="offer-list-price" data-astro-cid-nhjqudez>${cop(o.list_price)}</span>`} <a${addAttribute(o.url, "href")} target="_blank" rel="noopener noreferrer" class="offer-link" data-astro-cid-nhjqudez>Ver →</a> <button type="button" class="btn-add-list-sm"${addAttribute(o.name, "data-name")}${addAttribute(o.store_name, "data-store")}${addAttribute(o.price, "data-price")}${addAttribute(o.image ?? "", "data-image")} data-astro-cid-nhjqudez>➕</button> </div> </li>`)} </ul> </section>`, topOffers.length === 0 && !errorMsg && isLeaf && renderTemplate`<div class="no-results" data-astro-cid-nhjqudez> <p data-astro-cid-nhjqudez>No encontramos resultados para <strong data-astro-cid-nhjqudez>${node.nombre}</strong> en este momento.</p> <a${addAttribute(`/categoria/${catId}`, "href")} class="btn-home" data-astro-cid-nhjqudez>Ver más en ${cat.nombre} →</a> </div>`, renderComponent($$result, "AddToListModal", $$AddToListModal, { "data-astro-cid-nhjqudez": true }), (/* @__PURE__ */ new Date()).getFullYear(), renderScript($$result, "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/categoria/[...slug].astro?astro&type=script&index=0&lang.ts"));
}, "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/categoria/[...slug].astro", void 0);

const $$file = "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/pages/categoria/[...slug].astro";
const $$url = "/categoria/[...slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
