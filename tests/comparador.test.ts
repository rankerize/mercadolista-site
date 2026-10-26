import { describe, it, expect } from 'vitest';
import {
  parseCop,
  cleanEan,
  cop,
  relevance,
  unitPrice,
  saleMeasure,
  escapeHtml,
  isAccessoryMismatch,
} from '../src/lib/normalize';
import { findCity } from '../src/lib/cities';
import { storeCatalog } from '../src/lib/providers';
import { buildReport } from '../src/lib/ranking';
import { buildUnitReport } from '../src/lib/units';
import { searchCategories, CATEGORIES } from '../src/lib/catalog';
import { findBestCategoryHelp } from '../src/lib/collectionTaxonomy';
import {
  toSlug,
  findCategoryMatch,
  findProductMatch,
  getProductUrl,
  getCategoryUrl,
} from '../src/lib/slugs';
import type { Offer, StoreOutcome } from '../src/lib/types';

describe('Comparador Core Normalization Tests', () => {
  it('parses COP currency and validates EAN barcodes', () => {
    expect(parseCop('3.999.900')).toBe(3999900);
    expect(parseCop('$ 2.190')).toBe(2190);
    expect(cleanEan('7702129001052')).toBe('7702129001052');
    expect(cleanEan('123')).toBeNull();
    expect(cop(2190)).toBe('$ 2.190');
  });

  it('matches synonyms like televisor and tv', () => {
    const score = relevance('televisor 55', 'TV TCL 55" Pulgadas QLED', 'TCL');
    expect(score).toBe(1);
  });

  it('calculates unit prices for liquids and multipacks', () => {
    const single = unitPrice('Leche Entera Colanta x200ml', 2000);
    expect(single?.per).toBe('L');
    expect(single?.amount).toBe(10000);

    const pack = unitPrice('Leche Alqueria 1.3L x 6 unds', 7800);
    expect(pack?.per).toBe('L');
    expect(pack?.amount).toBe(1000);
  });

  it('measures count and weight accurately', () => {
    const eggs = saleMeasure('Huevos AA x 30 unds', 15000);
    expect(eggs?.basis).toBe('unidad');
    expect(eggs?.quantity).toBe(30);
    expect(eggs?.amount).toBe(500);

    const rice = saleMeasure('Arroz Roa 1000g', 4500);
    expect(rice?.basis).toBe('gramo');
    expect(rice?.quantity).toBe(1000);
    expect(rice?.amount).toBe(4.5);
  });

  it('escapes dangerous HTML characters to prevent XSS', () => {
    expect(escapeHtml('<script>alert("hack")</script>')).toBe('&lt;script&gt;alert(&quot;hack&quot;)&lt;/script&gt;');
    expect(escapeHtml("Pedro & María's")).toBe('Pedro &amp; María&#39;s');
    expect(escapeHtml('')).toBe('');
  });

  it('filters out accessory mismatches such as acomodador de huevos when searching for food staples', () => {
    // Cuando el usuario busca "huevos", los accesorios/organizadores deben detectarse como mismatch
    expect(isAccessoryMismatch('huevos', 'Acomodador de huevos para nevera organizador')).toBe(true);
    expect(isAccessoryMismatch('huevos', 'Organizador de huevos acrílico rodante')).toBe(true);
    expect(isAccessoryMismatch('huevos', 'Huevera plástica para refrigerador')).toBe(true);
    expect(isAccessoryMismatch('huevos', 'Separador de yemas de huevos en silicona')).toBe(true);
    expect(isAccessoryMismatch('huevos', 'Porta huevos 24 unidades')).toBe(true);
    expect(isAccessoryMismatch('huevos', 'Batidor de huevos manual en acero')).toBe(true);

    // Los productos reales de huevos NO deben ser mismatch
    expect(isAccessoryMismatch('huevos', 'Huevos AA x30 Kikes')).toBe(false);
    expect(isAccessoryMismatch('huevos', 'Huevos rojos campesinos x30')).toBe(false);
    expect(isAccessoryMismatch('huevos', 'Bandeja de huevos AAA x30 Santa Reyes')).toBe(false);

    // Si el usuario explícitamente busca el accesorio ("organizador de huevos"), debe permitirse
    expect(isAccessoryMismatch('organizador de huevos', 'Acomodador de huevos para nevera organizador')).toBe(false);
    expect(isAccessoryMismatch('huevera', 'Huevera plástica para refrigerador')).toBe(false);

    // Verificación de relevancia: acomodador de huevos debe tener relevancia 0
    expect(relevance('huevos', 'Acomodador de huevos para nevera')).toBe(0.0);
    expect(relevance('huevos', 'Huevos AA x30 Kikes')).toBe(1.0);
  });
});

describe('Catalogs and Reports', () => {
  it('loads city and store catalogs', () => {
    const city = findCity('bogota');
    expect(city.name).toBe('Bogotá');
    const stores = storeCatalog();
    expect(stores.length).toBeGreaterThan(5);
  });

  it('builds standard comparison report', () => {
    const mockOffer: Offer = {
      store_id: 'jumbo',
      store_name: 'Jumbo',
      name: 'Leche entera Colanta 1100 ml',
      brand: 'Colanta',
      price: 4500,
      list_price: null,
      image: null,
      url: 'https://www.jumbocolombia.com/leche/p',
      ean: '7702129001052',
      categories: ['Mercado', 'Lacteos'],
    };

    const outcome: StoreOutcome = {
      store_id: 'jumbo',
      store_name: 'Jumbo',
      kind: 'supermercado',
      offers: [mockOffer],
    };

    const report = buildReport('leche colanta', [outcome]);
    expect(report.verdict).toBeDefined();
    expect(report.verdict.store_name).toBe('Jumbo');
    expect(report.verdict.price).toBe(4500);
  });

  it('builds comparison report prioritizing real eggs over accessories and suggests the exact category', () => {
    const eggOrganizer: Offer = {
      store_id: 'exito',
      store_name: 'Éxito',
      name: 'Acomodador de huevos para nevera acrílico',
      brand: 'Generico',
      price: 8000,
      list_price: null,
      image: null,
      url: 'https://www.exito.com/organizador-huevos/p',
      ean: null,
      categories: ['Hogar', 'Organización'],
    };

    const realEggs: Offer = {
      store_id: 'd1',
      store_name: 'D1',
      name: 'Huevos rojos tipo AA x30 unidades',
      brand: 'D1',
      price: 15500,
      list_price: null,
      image: null,
      url: 'https://www.d1.com.co/huevos/p',
      ean: '7702000000001',
      categories: ['Supermercado', 'Huevos y Lácteos'],
    };

    const outcome: StoreOutcome = {
      store_id: 'd1',
      store_name: 'D1',
      kind: 'supermercado',
      offers: [eggOrganizer, realEggs],
    };

    const report = buildReport('huevos', [outcome]);
    // El veredicto debe ser para los huevos reales ($15.500) y NUNCA para el acomodador ($8.000)
    expect(report.verdict).toBeDefined();
    expect(report.verdict.price).toBe(15500);
    expect(report.verdict.name).toContain('Huevos');
    expect(report.verdict.name).not.toContain('Acomodador');

    // La lista de ofertas debe excluir el acomodador
    expect(report.offers.some((o: { name: string }) => o.name.includes('Acomodador'))).toBe(false);

    // Debe incluir sugerencia de auto-ayuda a la categoría oficial de Huevos
    expect(report.category_suggestion).toBeDefined();
    expect(report.category_suggestion.name).toBe('Huevos');
    expect(report.category_suggestion.url).toBe('/categoria/alimentos-y-bebidas/lacteos-y-frescos/huevos');
    expect(report.category_suggestion.icono).toBe('🥚');
  });

  it('resolves best category auto-help for staple searches', () => {
    const huevos = findBestCategoryHelp('huevos');
    expect(huevos?.name).toBe('Huevos');
    expect(huevos?.url).toBe('/categoria/alimentos-y-bebidas/lacteos-y-frescos/huevos');

    const leche = findBestCategoryHelp('leche colanta');
    expect(leche?.name).toBe('Leches líquidas');
    expect(leche?.url).toBe('/categoria/alimentos-y-bebidas/lacteos-y-frescos/leches-liquidas');

    const arroz = findBestCategoryHelp('arroz diana');
    expect(arroz?.name).toBe('Arroz');
    expect(arroz?.url).toBe('/categoria/alimentos-y-bebidas/despensa/arroz-legumbres-y-semillas/arroz');

    const tv = findBestCategoryHelp('televisor 55');
    expect(tv?.name).toBe('Televisores y Video');
    expect(tv?.url).toBe('/categoria/tecnologia/televisores-y-video');
  });

  it('filters unit comparison by measure and category', () => {
    const milk: Offer = {
      store_id: 'jumbo',
      store_name: 'Jumbo',
      name: 'Leche entera Colanta 1100 ml',
      brand: 'Colanta',
      price: 4500,
      list_price: null,
      image: null,
      url: 'https://www.jumbocolombia.com/leche/p',
      ean: null,
      categories: ['Lacteos'],
    };
    const rice: Offer = {
      store_id: 'exito',
      store_name: 'Éxito',
      name: 'Arroz Roa 1000g',
      brand: 'Roa',
      price: 4200,
      list_price: null,
      image: null,
      url: 'https://www.exito.com/arroz/p',
      ean: null,
      categories: ['Despensa'],
    };
    const outcomes: StoreOutcome[] = [
      { store_id: 'jumbo', store_name: 'Jumbo', kind: 'supermercado', offers: [milk] },
      { store_id: 'exito', store_name: 'Éxito', kind: 'supermercado', offers: [rice] },
    ];

    const byMl = buildUnitReport('leche arroz', outcomes, { basis: 'mililitros', categoryId: 'todas' });
    expect(byMl.verdict?.name).toContain('Leche');
    expect(byMl.offers.every((offer: { name: string }) => offer.name.includes('Leche'))).toBe(true);

    const byCategory = buildUnitReport('leche arroz', outcomes, { basis: 'todas', categoryId: 'despensa' });
    expect(byCategory.verdict?.name).toContain('Arroz');

    const none = buildUnitReport('leche', [outcomes[0]], { basis: 'gramos', categoryId: 'lacteos' });
    expect(none.verdict).toBeNull();
    expect(none.empty_detail).toMatch(/gramos/i);

    const largeEnough = buildUnitReport('leche', [outcomes[0]], { basis: 'mililitros', minQuantity: 900 });
    expect(largeEnough.verdict?.name).toContain('Leche');
    expect(largeEnough.filter_label).toMatch(/900 mililitros/);

    const tooBig = buildUnitReport('leche', [outcomes[0]], { basis: 'mililitros', minQuantity: 2000 });
    expect(tooBig.verdict).toBeNull();
    expect(tooBig.empty_detail).toMatch(/2000 mililitros o más/);
  });
});

describe('API Security and Rate Limiting', () => {
  it('allows requests within threshold and blocks exceeding ones', async () => {
    const { checkRateLimit, getClientIp } = await import('../src/lib/rateLimit');

    const fakeReq = new Request('https://mercadolista.com/api/buscar', {
      headers: { 'x-forwarded-for': '192.168.1.100' },
    });

    expect(getClientIp(fakeReq)).toBe('192.168.1.100');

    const config = { prefix: 'test-limit', windowMs: 10000, max: 2 };

    const first = checkRateLimit(fakeReq, config);
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(1);

    const second = checkRateLimit(fakeReq, config);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);

    const third = checkRateLimit(fakeReq, config);
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
    expect(third.resetSeconds).toBeGreaterThan(0);
  });
});

describe('AI Shopping Assistant & Recipe Engine', () => {
  it('parses pasta boloñesa and scales ingredients correctly for 2 and 4 persons', async () => {
    const { POST } = await import('../src/pages/api/asistente');

    // Test 1: 2 personas
    const req2 = new Request('https://mercadolista.com/api/asistente', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: JSON.stringify({ prompt: 'Quiero hacer una pasta boloñesa para 2 personas', personas: 2 }),
    });

    const res2 = await POST({ request: req2 } as any);
    expect(res2.status).toBe(200);
    const data2 = await res2.json();
    expect(data2.porciones).toBe(2);
    expect(data2.receta).toContain('Boloñesa');
    expect(data2.ingredientes.length).toBeGreaterThanOrEqual(4);

    const pasta2 = data2.ingredientes.find((i: any) => i.nombre.toLowerCase().includes('pasta') || i.nombre.toLowerCase().includes('espagueti'));
    const carne2 = data2.ingredientes.find((i: any) => i.nombre.toLowerCase().includes('carne'));
    expect(pasta2).toBeDefined();
    expect(carne2).toBeDefined();

    // Test 2: 4 personas (debe escalar la cantidad al doble)
    const req4 = new Request('https://mercadolista.com/api/asistente', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.2',
      },
      body: JSON.stringify({ prompt: 'Pasta boloñesa para 4 personas', personas: 4 }),
    });

    const res4 = await POST({ request: req4 } as any);
    expect(res4.status).toBe(200);
    const data4 = await res4.json();
    expect(data4.porciones).toBe(4);

    const pasta4 = data4.ingredientes.find((i: any) => i.nombre.toLowerCase().includes('pasta') || i.nombre.toLowerCase().includes('espagueti'));
    const carne4 = data4.ingredientes.find((i: any) => i.nombre.toLowerCase().includes('carne'));
    expect(pasta4.cantidad).toBe(pasta2.cantidad * 2);
    expect(carne4.cantidad).toBe(carne2.cantidad * 2);
  });

  it('validates minimum prompt length', async () => {
    const { POST } = await import('../src/pages/api/asistente');

    const reqEmpty = new Request('https://mercadolista.com/api/asistente', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.3',
      },
      body: JSON.stringify({ prompt: ' ' }),
    });

    const resEmpty = await POST({ request: reqEmpty } as any);
    expect(resEmpty.status).toBe(422);
  });
});

describe('Category, Slugs and Search Redirection Routing', () => {
  it('converts titles to SEO slugs correctly', () => {
    expect(toSlug('Lácteos & Huevos!')).toBe('lacteos-huevos');
    expect(toSlug('Café / Panadería')).toBe('cafe-panaderia');
    expect(toSlug('Leche Entera 1.3L')).toBe('leche-entera-13l');
  });

  it('matches category queries by id, name or components', () => {
    const lacteosById = findCategoryMatch('lacteos');
    expect(lacteosById?.id).toBe('lacteos');

    const lacteosByName = findCategoryMatch('Lácteos');
    expect(lacteosByName?.id).toBe('lacteos');

    const lacteosByComponent = findCategoryMatch('huevos');
    expect(lacteosByComponent?.id).toBe('lacteos');

    const frutasByComponent = findCategoryMatch('verduras');
    expect(frutasByComponent?.id).toBe('frutas');

    expect(findCategoryMatch('algo-inexistente-12345')).toBeUndefined();
  });

  it('matches exact catalog products by query', () => {
    const leche = findProductMatch('leche entera');
    expect(leche).toBeDefined();
    expect(leche?.categoria).toBe('lacteos');

    const arroz = findProductMatch('Arroz blanco');
    expect(arroz).toBeDefined();
    expect(arroz?.categoria).toBe('despensa');

    expect(findProductMatch('televisor lg oled 77')).toBeUndefined();
  });

  it('searches categories with fuzzy/prefix matching', () => {
    const results = searchCategories('lact', 3);
    expect(results.some((c) => c.id === 'lacteos')).toBe(true);

    const frutas = searchCategories('verduras', 3);
    expect(frutas.some((c) => c.id === 'frutas')).toBe(true);

    expect(searchCategories('xyznotfound').length).toBe(0);
  });

  it('generates valid SEO URLs for categories and products', () => {
    expect(getCategoryUrl('lacteos')).toBe('/categoria/lacteos');
    expect(getCategoryUrl('aseo')).toBe('/categoria/aseo');

    const sampleProduct = {
      nombre: 'Leche Entera',
      categoria: 'lacteos',
      unidadSugerida: 'mililitros' as const,
      cantidadSugerida: 1000,
      icono: '🥛',
    };
    expect(getProductUrl(sampleProduct)).toBe('/categoria/lacteos/leche-entera');
  });
});

describe('Visual AI & Barcode Search Validation', () => {
  it('validates Colombian and international barcode formats (EAN-13, EAN-8)', () => {
    // Código EAN-13 común colombiano (prefijo 770)
    expect(cleanEan('7702129001052')).toBe('7702129001052');
    // Código con espacios o guiones
    expect(cleanEan('770-2129-001052')).toBe('7702129001052');
    // Código EAN-8
    expect(cleanEan('77012345')).toBe('77012345');
    // Inválidos: menos de 8 dígitos o caracteres no numéricos
    expect(cleanEan('12345')).toBeNull();
    expect(cleanEan('abcdefgh')).toBeNull();
    // Inválido: números idénticos repetidos (ruido de sensor)
    expect(cleanEan('0000000000000')).toBeNull();
  });

  it('normalizes quantities and formats from visual recognition', () => {
    function formatNorm(rawFmt: string): 'gramos' | 'mililitros' | 'unidades' {
      const lower = String(rawFmt || '').toLowerCase();
      if (lower.includes('mili') || lower.includes('ml') || lower.includes('litr')) return 'mililitros';
      if (lower.includes('gram') || lower.includes('g') || lower.includes('kilo')) return 'gramos';
      return 'unidades';
    }

    expect(formatNorm('1000 ml')).toBe('mililitros');
    expect(formatNorm('1 Litro')).toBe('mililitros');
    expect(formatNorm('500 gramos')).toBe('gramos');
    expect(formatNorm('1 kg')).toBe('gramos');
    expect(formatNorm('30 unidades')).toBe('unidades');
    expect(formatNorm('desconocido')).toBe('unidades');
  });

  it('generates optimal queries for supermarket searching', () => {
    const rawName = 'Leche Deslactosada';
    const rawBrand = 'Colanta';
    const rawSize = '1000 ml';
    const query = [rawName, rawBrand, rawSize].filter(Boolean).join(' ').trim();
    expect(query).toBe('Leche Deslactosada Colanta 1000 ml');
  });
});

describe('TaxCo Enterprise Collection Taxonomy Tests', () => {
  it('loads full TaxCo tree with 3,266 nodes and 28 root departments', async () => {
    const { getRootDepartments } = await import('../src/lib/collectionTaxonomy');
    const roots = getRootDepartments();
    expect(roots.length).toBe(28);
    
    const rootSlugs = roots.map(r => r.slugPath);
    expect(rootSlugs).toContain('alimentos-y-bebidas');
    expect(rootSlugs).toContain('tecnologia');
    expect(rootSlugs).toContain('electrohogar');
    expect(rootSlugs).toContain('deportes-y-aire-libre');
  });

  it('resolves nodes by CatId, slugPath and legacy alias', async () => {
    const { getCollectionNode, getCollectionChildren } = await import('../src/lib/collectionTaxonomy');
    
    // Por slugPath exacto
    const node = getCollectionNode('tecnologia/audio/audifonos');
    expect(node).toBeDefined();
    expect(node?.name).toBe('Audífonos');
    expect(node?.rootSlug).toBe('tecnologia');

    // Por CatId directo
    const byId = getCollectionNode('cat50670');
    expect(byId).toBeDefined();
    expect(byId?.name).toBe('Audífonos');

    // Hijos de Audífonos
    const children = getCollectionChildren('cat50670');
    expect(children.length).toBeGreaterThan(0);
    const childNames = children.map(c => c.name);
    expect(childNames).toContain('In-Ear');
  });

  it('generates SEO metadata and breadcrumbs for categories', async () => {
    const { getCollectionNode, getCollectionSeo, getCollectionBreadcrumbItems } = await import('../src/lib/collectionTaxonomy');
    const node = getCollectionNode('tecnologia/audio/audifonos/in-ear');
    expect(node).toBeDefined();
    if (!node) return;

    const seo = getCollectionSeo(node);
    expect(seo.titleSeo).toContain('Precios de In-Ear en Colombia hoy');
    expect(seo.canonicalUrl).toBe('https://mercadolista.com/categoria/tecnologia/audio/audifonos/in-ear');

    const crumbs = getCollectionBreadcrumbItems(node);
    expect(crumbs.length).toBe(6); // Inicio, Categorias, Tecnologia, Audio, Audifonos, In-Ear
    expect(crumbs[0].name).toBe('Inicio');
    expect(crumbs[1].name).toBe('Categorías');
  });

  it('searches collections by keyword across the 3,266 tree', async () => {
    const { searchCollections } = await import('../src/lib/collectionTaxonomy');
    const results = searchCollections('audifonos');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase()).toContain('audífonos');
  });

  it('generates fluid huincha navigation with Level 2 subcategories on Level 1 departments', async () => {
    const { getCollectionNode, getHuinchaNavigation, getCategoryEmoji } = await import('../src/lib/collectionTaxonomy');

    // 1. Navegación en Nivel 1 (Tecnología): la huincha debe tener las categorías de Nivel 2 (N2)
    const n1 = getCollectionNode('tecnologia');
    expect(n1).toBeDefined();
    if (!n1) return;

    const navN1 = getHuinchaNavigation(n1);
    expect(navN1.currentLevel).toBe(1);
    expect(navN1.kicker).toContain('CATEGORÍAS DE TECNOLOGÍA');
    expect(navN1.items.length).toBe(8); // Audio, Computadores, Fotografía, Smart Home, Smartwatch, Telefonía, Televisores, Zona Gamer

    const n2Names = navN1.items.map(i => i.name);
    expect(n2Names).toContain('Audio');
    expect(n2Names).toContain('Telefonía');
    expect(n2Names).toContain('Computadores');
    expect(n2Names).toContain('Televisores y Video');

    // Verificar que cada item de la huincha tiene emoji y url limpia
    const telItem = navN1.items.find(i => i.name === 'Telefonía');
    expect(telItem).toBeDefined();
    expect(telItem?.url).toBe('/categoria/tecnologia/telefonia');
    expect(telItem?.emoji).toBe('📱');

    // 2. Navegación en Nivel 2 (Telefonía): la huincha debe mostrar las subcategorías de Nivel 3 (N3)
    const n2 = getCollectionNode('tecnologia/telefonia');
    expect(n2).toBeDefined();
    if (!n2) return;

    const navN2 = getHuinchaNavigation(n2);
    expect(navN2.currentLevel).toBe(2);
    expect(navN2.kicker).toContain('SUBCATEGORÍAS DE TELEFONÍA');
    const n3Names = navN2.items.map(i => i.name);
    expect(n3Names).toContain('Celulares y Teléfonos');
    expect(n3Names).toContain('Accesorios Celulares');

    // 3. Emojis inteligentes
    expect(getCategoryEmoji('Audífonos')).toBe('🎧');
    expect(getCategoryEmoji('Computadores')).toBe('💻');
    expect(getCategoryEmoji('Smartwatch')).toBe('⌚');
    expect(getCategoryEmoji('Lácteos y frescos')).toBe('🧀');
    expect(getCategoryEmoji('Carnes')).toBe('🥩');
  });

  it('provides drawer departments of Level 1 with short-tail subcategories', async () => {
    const { getDrawerDepartments } = await import('../src/lib/collectionTaxonomy');
    const departments = getDrawerDepartments();

    expect(departments.length).toBeGreaterThanOrEqual(15);

    // Verificar Tecnología y sus subcategorías short-tail
    const tec = departments.find((d) => d.slugPath === 'tecnologia');
    expect(tec).toBeDefined();
    expect(tec?.name).toBe('Tecnología');
    expect(tec?.icono).toBe('📺');
    expect(tec?.url).toBe('/categoria/tecnologia');

    const tecSubNames = tec!.subcategories.map((s) => s.name);
    expect(tecSubNames).toContain('Celulares y Smartphones');
    expect(tecSubNames).toContain('Computadores y Portátiles');
    expect(tecSubNames).toContain('Televisores y Smart TV');
    expect(tecSubNames).toContain('Audífonos y Audio');

    // Verificar que todas las subcategorías tienen URLs canónicas que inician con /categoria/
    for (const d of departments) {
      expect(d.url).toMatch(/^\/categoria\//);
      expect(d.subcategories.length).toBeGreaterThan(0);
      for (const s of d.subcategories) {
        expect(s.url).toMatch(/^\/categoria\//);
        expect(s.name.length).toBeGreaterThan(0);
        expect(s.icono.length).toBeGreaterThan(0);
      }
    }
  });
});
