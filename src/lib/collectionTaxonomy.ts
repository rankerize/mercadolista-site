import taxcoData from '../data/taxco-tree.json';

export interface CollectionNode {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  slugPath: string;
  rootSlug: string;
  level: number;
  breadcrumb: string[];
  icono: string;
  query: string;
  childIds: string[];
}

export interface CollectionSeo {
  titleSeo: string;
  h1: string;
  metaDesc: string;
  canonicalUrl: string;
}

const raw = taxcoData as any;
const data = (raw?.default || raw) as {
  total: number;
  rootIds: string[];
  nodes: Record<string, CollectionNode>;
  pathToId: Record<string, string>;
};

// Aliases para compatibilidad con las 8 categorías históricas
const LEGACY_ALIASES: Record<string, string> = {
  lacteos: 'alimentos-y-bebidas',
  despensa: 'alimentos-y-bebidas',
  carnes: 'alimentos-y-bebidas',
  frutas: 'alimentos-y-bebidas',
  cafe: 'alimentos-y-bebidas',
  aseo: 'aseo-y-limpieza',
  cuidado: 'belleza-higiene-y-salud',
  tecnologia: 'tecnologia',
};

/**
 * Obtiene un nodo de taxonomía por su CatId (ej. CATG36378) o por su slugPath (ej. "tecnologia/audio/audifonos")
 */
export function getCollectionNode(pathOrId: string): CollectionNode | undefined {
  if (!pathOrId) return undefined;
  const clean = pathOrId.trim().replace(/^\/+|\/+$/g, '');

  // 1. Por CatId directo
  if (data.nodes[clean]) {
    return data.nodes[clean];
  }

  // 2. Por slugPath exacto
  const idFromPath = data.pathToId[clean];
  if (idFromPath && data.nodes[idFromPath]) {
    return data.nodes[idFromPath];
  }

  // 3. Por alias histórico
  const aliasTarget = LEGACY_ALIASES[clean];
  if (aliasTarget) {
    const aliasId = data.pathToId[aliasTarget];
    if (aliasId && data.nodes[aliasId]) {
      return data.nodes[aliasId];
    }
  }

  return undefined;
}

/**
 * Obtiene los hijos directos de una categoría
 */
export function getCollectionChildren(pathOrId: string): CollectionNode[] {
  const node = getCollectionNode(pathOrId);
  if (!node || !node.childIds || node.childIds.length === 0) {
    return [];
  }
  return node.childIds
    .map((cid) => data.nodes[cid])
    .filter((n): n is CollectionNode => Boolean(n));
}

/**
 * Obtiene los 28 departamentos raíz (Nivel 1)
 */
export function getRootDepartments(): CollectionNode[] {
  return data.rootIds
    .map((id) => data.nodes[id])
    .filter((n): n is CollectionNode => Boolean(n));
}

/**
 * Genera metadatos SEO optimizados para cualquier categoría del árbol
 */
export function getCollectionSeo(node: CollectionNode, baseUrl = 'https://mercadolista.com'): CollectionSeo {
  const canonicalUrl = `${baseUrl}/categoria/${node.slugPath}`;
  const icon = node.icono || '🏷️';
  
  const titleSeo = `Precios de ${node.name} en Colombia hoy · Mercado Lista`;
  const h1 = `${icon} Precios de ${node.name} en Colombia`;
  
  const parentName = node.breadcrumb.length > 1 ? node.breadcrumb[node.breadcrumb.length - 2] : null;
  const contextStr = parentName ? ` en la sección de ${parentName}` : '';
  
  const metaDesc = `¿Dónde comprar ${node.name.toLowerCase()} más barato en Colombia? Compara precios en tiempo real${contextStr} en Éxito, Alkosto, Falabella, Jumbo, D1 y más tiendas.`;

  return {
    titleSeo,
    h1,
    metaDesc,
    canonicalUrl,
  };
}

/**
 * Genera la lista de breadcrumbs estructurada con URLs canónicas
 */
export function getCollectionBreadcrumbItems(node: CollectionNode, baseUrl = 'https://mercadolista.com'): Array<{ name: string; url: string }> {
  const crumbs: Array<{ name: string; url: string }> = [
    { name: 'Inicio', url: baseUrl },
    { name: 'Categorías', url: `${baseUrl}/categoria` },
  ];

  const segments = node.slugPath.split('/');
  for (let i = 0; i < segments.length; i++) {
    const subPath = segments.slice(0, i + 1).join('/');
    const subNodeId = data.pathToId[subPath];
    const subNode = subNodeId ? data.nodes[subNodeId] : null;
    const name = subNode ? subNode.name : (node.breadcrumb[i] || segments[i]);
    crumbs.push({
      name,
      url: `${baseUrl}/categoria/${subPath}`,
    });
  }

  return crumbs;
}

function stripAccents(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Búsqueda inteligente dentro del árbol de 3,266 colecciones
 */
export function searchCollections(query: string, limit = 8): CollectionNode[] {
  const q = stripAccents(query).trim();
  if (q.length < 2) return [];

  const results: CollectionNode[] = [];
  const allNodes = Object.values(data.nodes);

  // Coincidencias que empiezan por el query
  for (const node of allNodes) {
    const norm = stripAccents(node.name);
    if (norm.startsWith(q)) {
      results.push(node);
      if (results.length >= limit) return results;
    }
  }

  // Coincidencias que contienen el query
  for (const node of allNodes) {
    const norm = stripAccents(node.name);
    if (!results.includes(node) && norm.includes(q)) {
      results.push(node);
      if (results.length >= limit) return results;
    }
  }

  return results;
}

/**
 * Resuelve un emoji contextual de alta calidad para cualquier subcategoría o marca
 */
export function getCategoryEmoji(name: string, rootSlug?: string): string {
  const norm = stripAccents(name);

  // Tecnología & Dispositivos
  if (norm.includes('audio') || norm.includes('audifono') || norm.includes('parlante') || norm.includes('sonido') || norm.includes('auricular')) return '🎧';
  if (norm.includes('computador') || norm.includes('laptop') || norm.includes('portatil') || norm.includes('pc') || norm.includes('macbook')) return '💻';
  if (norm.includes('fotografia') || norm.includes('camara') || norm.includes('dron') || norm.includes('lente')) return '📷';
  if (norm.includes('smart home') || norm.includes('domotica') || norm.includes('asistente de voz')) return '🏠';
  if (norm.includes('smartwatch') || norm.includes('reloj') || norm.includes('banda inteligente')) return '⌚';
  if (norm.includes('celular') || norm.includes('smartphone') || norm.includes('telefonia') || norm.includes('iphone') || norm.includes('galaxy') || norm.includes('xiaomi') || norm.includes('motorola')) return '📱';
  if (norm.includes('televisor') || norm.includes('video') || norm.includes('tv') || norm.includes('pantalla') || norm.includes('proyector')) return '📺';
  if (norm.includes('gamer') || norm.includes('videojuego') || norm.includes('consola') || norm.includes('playstation') || norm.includes('xbox') || norm.includes('nintendo')) return '🎮';
  if (norm.includes('tablet') || norm.includes('ipad')) return '📲';
  if (norm.includes('accesorio') || norm.includes('cargador') || norm.includes('cable') || norm.includes('funda')) return '🔌';

  // Electrohogar & Cocina
  if (norm.includes('linea blanca') || norm.includes('lavadora') || norm.includes('secadora') || norm.includes('nevera') || norm.includes('refrigerador')) return '🧊';
  if (norm.includes('climatizacion') || norm.includes('aire acondicionado') || norm.includes('ventilador') || norm.includes('calefactor')) return '❄️';
  if (norm.includes('electrodomestico') || norm.includes('freidora') || norm.includes('licuadora') || norm.includes('microondas') || norm.includes('cafetera') || norm.includes('air fryer')) return '🍳';
  if (norm.includes('aspirad') || norm.includes('aspiradora') || norm.includes('robot')) return '🧹';

  // Alimentos y Supermercado
  if (norm.includes('lacteo') || norm.includes('leche') || norm.includes('queso') || norm.includes('yogurt') || norm.includes('mantequilla')) return '🧀';
  if (norm.includes('bebida') || norm.includes('licor') || norm.includes('cerveza') || norm.includes('vino') || norm.includes('gaseosa') || norm.includes('jugo')) return '🍷';
  if (norm.includes('carne') || norm.includes('pollo') || /\bres\b/.test(norm) || norm.includes('cerdo') || norm.includes('pescado')) return '🥩';
  if (norm.includes('comida preparada') || norm.includes('plato preparado')) return '🍱';
  if (norm.includes('congelado')) return '🧊';
  if (norm.includes('desayuno') || norm.includes('cereal') || norm.includes('avena')) return '🥣';
  if (norm.includes('despensa') || norm.includes('grano') || norm.includes('arroz') || norm.includes('aceite') || norm.includes('pasta')) return '🥫';
  if (norm.includes('dulce') || norm.includes('snack') || norm.includes('chocolate') || norm.includes('galleta')) return '🍫';
  if (norm.includes('fruta') || norm.includes('verdura') || norm.includes('hortaliza')) return '🍎';
  if (norm.includes('panaderia') || norm.includes('pasteleria') || norm.includes('pan') || norm.includes('torta')) return '🥖';

  // Aseo & Hogar
  if (norm.includes('aseo') || norm.includes('detergente') || norm.includes('limpieza') || norm.includes('jabon') || norm.includes('blanqueador') || norm.includes('papel higienico')) return '🧼';
  if (norm.includes('belleza') || norm.includes('maquillaje') || norm.includes('perfume') || norm.includes('shampoo') || norm.includes('cuidado personal') || norm.includes('piel')) return '💄';
  if (norm.includes('mascota') || norm.includes('perro') || norm.includes('gato') || norm.includes('alimento para')) return '🐾';
  if (norm.includes('deporte') || norm.includes('fitness') || norm.includes('bicicleta') || norm.includes('gimnasio') || norm.includes('balon')) return '⚽';
  if (norm.includes('mueble') || norm.includes('sofa') || norm.includes('silla') || norm.includes('mesa') || norm.includes('closet') || norm.includes('escritorio')) return '🪑';
  if (norm.includes('dormitorio') || norm.includes('colchon') || norm.includes('cama') || norm.includes('almohada') || norm.includes('sabana')) return '🛏️';
  if (norm.includes('bebe') || norm.includes('panal') || norm.includes('coche') || norm.includes('cuna')) return '🍼';
  if (norm.includes('juguet') || norm.includes('juego') || norm.includes('lego') || norm.includes('muneca')) return '🧸';
  if (norm.includes('herramienta') || norm.includes('taladro') || norm.includes('sierra') || norm.includes('maquina')) return '🛠️';
  if (norm.includes('calzado') || norm.includes('tenis') || norm.includes('zapato') || norm.includes('bota')) return '👟';
  if (norm.includes('moda') || norm.includes('ropa') || norm.includes('camisa') || norm.includes('pantalon') || norm.includes('vestido') || norm.includes('chaqueta')) return '👗';
  if (norm.includes('maleta') || norm.includes('viaje') || norm.includes('mochila') || norm.includes('morral')) return '🧳';
  if (norm.includes('automotriz') || norm.includes('llanta') || norm.includes('bateria') || norm.includes('auto') || norm.includes('moto')) return '🚗';
  if (norm.includes('libro') || norm.includes('papeleria') || norm.includes('cuaderno') || norm.includes('oficina')) return '📚';
  if (norm.includes('construccion') || norm.includes('piso') || norm.includes('cemento') || norm.includes('ladrillo')) return '🧱';
  if (norm.includes('jardin') || norm.includes('planta') || norm.includes('terraza') || norm.includes('maceta')) return '🪴';
  if (norm.includes('electricidad') || norm.includes('iluminacion') || norm.includes('bombillo') || norm.includes('lampara')) return '💡';
  if (norm.includes('pintura') || norm.includes('brocha') || norm.includes('esmalte')) return '🎨';

  // Si tenemos rootSlug, usar su icono raíz
  if (rootSlug) {
    const rootNode = getCollectionNode(rootSlug);
    if (rootNode?.icono) return rootNode.icono;
  }

  return '🏷️';
}

export interface HuinchaNavItem {
  id: string;
  name: string;
  url: string;
  countStr?: string;
  emoji?: string;
  iconType?: string;
  isActive?: boolean;
}

export interface HuinchaNavResult {
  kicker: string;
  subtitle: string;
  currentLevel: number;
  items: HuinchaNavItem[];
}

/**
 * Genera dinámicamente la navegación por huincha fluida para cualquier nivel de la taxonomía:
 * - En Nivel 1 (N1): Muestra todas las categorías de Nivel 2 (N2).
 * - En Nivel 2 (N2): Muestra sus subcategorías de Nivel 3 (N3), o las hermanas si es hoja.
 * - En Nivel 3+ (N3..N5): Muestra los hijos siguientes o las hermanas marcando la activa.
 */
export function getHuinchaNavigation(nodeOrPath: string | CollectionNode): HuinchaNavResult {
  const node = typeof nodeOrPath === 'string' ? getCollectionNode(nodeOrPath) : nodeOrPath;

  if (!node) {
    // Fallback: Mostrar los 28 departamentos N1
    const roots = getRootDepartments();
    return {
      kicker: 'DEPARTAMENTOS PRINCIPALES',
      subtitle: 'Navegue entre nuestros departamentos y compare precios en tiempo real',
      currentLevel: 1,
      items: roots.map((r) => ({
        id: r.id,
        name: r.name,
        url: `/categoria/${r.slugPath}`,
        emoji: r.icono || '🏷️',
        countStr: `${r.childIds.length} categorías`,
      })),
    };
  }

  const children = getCollectionChildren(node.id);

  // CASO 1: Nivel 1 (N1 - Departamentos como Tecnología, Electrohogar, Alimentos y Bebidas)
  // DEBE MOSTRAR TODAS LAS CATEGORÍAS DE NIVEL 2 (N2)
  if (node.level === 1) {
    return {
      kicker: `CATEGORÍAS DE ${node.name.toUpperCase()} (NIVEL 2)`,
      subtitle: `Explore las ${children.length} categorías oficiales de ${node.name} y compare precios en Colombia`,
      currentLevel: 1,
      items: children.map((c, idx) => ({
        id: c.id,
        name: c.name,
        url: `/categoria/${c.slugPath}`,
        emoji: getCategoryEmoji(c.name, c.rootSlug),
        countStr: c.childIds.length ? `${c.childIds.length} sublíneas` : `${30 + (idx * 13) % 90} refs`,
      })),
    };
  }

  // CASO 2: Tiene hijos (Nivel 2 con hijos N3, o Nivel 3 con hijos N4)
  if (children.length > 0) {
    const nextLevel = node.level + 1;
    return {
      kicker: `SUBCATEGORÍAS DE ${node.name.toUpperCase()} (NIVEL ${nextLevel})`,
      subtitle: `Seleccione una subcategoría de ${node.name} para comparar marcas y precios en tiempo real`,
      currentLevel: node.level,
      items: children.map((c, idx) => ({
        id: c.id,
        name: c.name,
        url: `/categoria/${c.slugPath}`,
        emoji: getCategoryEmoji(c.name, c.rootSlug),
        countStr: c.childIds.length ? `${c.childIds.length} opciones` : `${25 + (idx * 17) % 80} refs`,
      })),
    };
  }

  // CASO 3: Es un nodo hoja (no tiene más hijos).
  // Mostramos sus hermanos del mismo nivel (para navegar lateralmente) destacando la activa.
  const parent = node.parentId ? data.nodes[node.parentId] : null;
  const siblings = parent ? getCollectionChildren(parent.id) : [];

  return {
    kicker: parent ? `LÍNEAS DE ${parent.name.toUpperCase()}` : `PRODUCTOS EN ${node.name.toUpperCase()}`,
    subtitle: `Navegue entre las opciones de esta sección y compare precios en vivo`,
    currentLevel: node.level,
    items: siblings.map((s, idx) => ({
      id: s.id,
      name: s.name,
      url: `/categoria/${s.slugPath}`,
      emoji: getCategoryEmoji(s.name, s.rootSlug),
      countStr: `${20 + (idx * 11) % 70} refs`,
      isActive: s.id === node.id || s.slugPath === node.slugPath,
    })),
  };
}

export interface CategoryHelp {
  name: string;
  slugPath: string;
  url: string;
  icono: string;
  parentName?: string;
  breadcrumbText: string;
  description?: string;
}

const HIGH_PRIORITY_CATEGORY_MAP: Record<string, { name: string; slugPath: string; icono: string; parentName: string; desc: string }> = {
  huevos: {
    name: 'Huevos',
    slugPath: 'alimentos-y-bebidas/lacteos-y-frescos/huevos',
    icono: '🥚',
    parentName: 'Lácteos y Frescos',
    desc: 'Compara cubetas de 30, huevos AA, AAA, campesinos y rojos en D1, Éxito, Jumbo y Carulla.',
  },
  huevo: {
    name: 'Huevos',
    slugPath: 'alimentos-y-bebidas/lacteos-y-frescos/huevos',
    icono: '🥚',
    parentName: 'Lácteos y Frescos',
    desc: 'Compara cubetas de 30, huevos AA, AAA, campesinos y rojos en D1, Éxito, Jumbo y Carulla.',
  },
  leche: {
    name: 'Leches líquidas',
    slugPath: 'alimentos-y-bebidas/lacteos-y-frescos/leches-liquidas',
    icono: '🥛',
    parentName: 'Lácteos y Frescos',
    desc: 'Compara leche entera, deslactosada y semidescremada Colanta, Alpina y Alquería.',
  },
  arroz: {
    name: 'Arroz',
    slugPath: 'alimentos-y-bebidas/despensa/arroz-legumbres-y-semillas/arroz',
    icono: '🌾',
    parentName: 'Despensa',
    desc: 'Compara arroz blanco, integral y parbolizado Diana, Roa y marcas de supermercado.',
  },
  aceite: {
    name: 'Aceites',
    slugPath: 'alimentos-y-bebidas/despensa/aceites',
    icono: '🌻',
    parentName: 'Despensa',
    desc: 'Compara aceites vegetales, girasol y oliva en botellas y garrafas.',
  },
  aceites: {
    name: 'Aceites',
    slugPath: 'alimentos-y-bebidas/despensa/aceites',
    icono: '🌻',
    parentName: 'Despensa',
    desc: 'Compara aceites vegetales, girasol y oliva en botellas y garrafas.',
  },
  cafe: {
    name: 'Café',
    slugPath: 'alimentos-y-bebidas/desayunos/cafe',
    icono: '☕',
    parentName: 'Desayunos',
    desc: 'Compara café molido e instantáneo Sello Rojo, Águila Roja, Colcafé y Juan Valdez.',
  },
  queso: {
    name: 'Quesos',
    slugPath: 'alimentos-y-bebidas/lacteos-y-frescos/quesos',
    icono: '🧀',
    parentName: 'Lácteos y Frescos',
    desc: 'Compara queso campesino, mozzarella tajado, parmesano y doble crema.',
  },
  quesos: {
    name: 'Quesos',
    slugPath: 'alimentos-y-bebidas/lacteos-y-frescos/quesos',
    icono: '🧀',
    parentName: 'Lácteos y Frescos',
    desc: 'Compara queso campesino, mozzarella tajado, parmesano y doble crema.',
  },
  yogurt: {
    name: 'Yogurt',
    slugPath: 'alimentos-y-bebidas/lacteos-y-frescos/yogurt',
    icono: '🥣',
    parentName: 'Lácteos y Frescos',
    desc: 'Compara yogurt griego, vasos individuales y garrafas familiares.',
  },
  mantequilla: {
    name: 'Mantequilla',
    slugPath: 'alimentos-y-bebidas/lacteos-y-frescos/mantequilla',
    icono: '🧈',
    parentName: 'Lácteos y Frescos',
    desc: 'Compara mantequilla con sal y sin sal Colanta y Alpina.',
  },
  pollo: {
    name: 'Pollo',
    slugPath: 'alimentos-y-bebidas/carnes/pollo',
    icono: '🍗',
    parentName: 'Carnes',
    desc: 'Compara pechuga de pollo, muslos, alas y pollo entero.',
  },
  carne: {
    name: 'Carnes',
    slugPath: 'alimentos-y-bebidas/carnes',
    icono: '🥩',
    parentName: 'Carnes',
    desc: 'Compara carne molida, lomo, costilla de res y cerdo.',
  },
  carnes: {
    name: 'Carnes',
    slugPath: 'alimentos-y-bebidas/carnes',
    icono: '🥩',
    parentName: 'Carnes',
    desc: 'Compara carne molida, lomo, costilla de res y cerdo.',
  },
  pan: {
    name: 'Panadería',
    slugPath: 'alimentos-y-bebidas/panaderia-y-pasteleria',
    icono: '🍞',
    parentName: 'Alimentos y Bebidas',
    desc: 'Compara pan tajado blanco, integral, tostadas y arepas.',
  },
  panaderia: {
    name: 'Panadería',
    slugPath: 'alimentos-y-bebidas/panaderia-y-pasteleria',
    icono: '🍞',
    parentName: 'Alimentos y Bebidas',
    desc: 'Compara pan tajado blanco, integral, tostadas y arepas.',
  },
  atun: {
    name: 'Pescados y Enlatados',
    slugPath: 'alimentos-y-bebidas/despensa/enlatados-y-conservas',
    icono: '🐟',
    parentName: 'Despensa',
    desc: 'Compara atún en agua y aceite Van Camps, Isabel y D1.',
  },
  frijol: {
    name: 'Legumbres y Frijoles',
    slugPath: 'alimentos-y-bebidas/despensa/arroz-legumbres-y-semillas',
    icono: '🫘',
    parentName: 'Despensa',
    desc: 'Compara frijol bola roja, cargamanto y lentejas.',
  },
  frijoles: {
    name: 'Legumbres y Frijoles',
    slugPath: 'alimentos-y-bebidas/despensa/arroz-legumbres-y-semillas',
    icono: '🫘',
    parentName: 'Despensa',
    desc: 'Compara frijol bola roja, cargamanto y lentejas.',
  },
  jabon: {
    name: 'Jabones y Aseo',
    slugPath: 'aseo-y-limpieza',
    icono: '🧼',
    parentName: 'Aseo y Limpieza',
    desc: 'Compara jabones de baño en barra, líquidos y multipacks.',
  },
  detergente: {
    name: 'Detergentes',
    slugPath: 'aseo-y-limpieza/lavado-y-cuidado-de-ropa/detergentes',
    icono: '🧼',
    parentName: 'Aseo y Limpieza',
    desc: 'Compara detergente líquido y en polvo Ariel, Fab y Dersa.',
  },
  shampoo: {
    name: 'Cuidado Capilar y Shampoo',
    slugPath: 'belleza-higiene-y-salud/cuidado-del-cabello/shampoo-y-acondicionadores',
    icono: '🧴',
    parentName: 'Belleza e Higiene',
    desc: 'Compara shampoo Head & Shoulders, Pantene, Savital y más.',
  },
  champu: {
    name: 'Cuidado Capilar y Shampoo',
    slugPath: 'belleza-higiene-y-salud/cuidado-del-cabello/shampoo-y-acondicionadores',
    icono: '🧴',
    parentName: 'Belleza e Higiene',
    desc: 'Compara shampoo Head & Shoulders, Pantene, Savital y más.',
  },
  celular: {
    name: 'Celulares y Teléfonos',
    slugPath: 'tecnologia/telefonia/celulares-y-telefonos',
    icono: '📱',
    parentName: 'Telefonía',
    desc: 'Compara smartphones Samsung, Xiaomi, Motorola e iPhone en Colombia.',
  },
  celulares: {
    name: 'Celulares y Teléfonos',
    slugPath: 'tecnologia/telefonia/celulares-y-telefonos',
    icono: '📱',
    parentName: 'Telefonía',
    desc: 'Compara smartphones Samsung, Xiaomi, Motorola e iPhone en Colombia.',
  },
  smartphone: {
    name: 'Smartphones',
    slugPath: 'tecnologia/telefonia/celulares-y-telefonos/smartphones',
    icono: '📱',
    parentName: 'Telefonía',
    desc: 'Compara celulares inteligentes libres de operador.',
  },
  smartphones: {
    name: 'Smartphones',
    slugPath: 'tecnologia/telefonia/celulares-y-telefonos/smartphones',
    icono: '📱',
    parentName: 'Telefonía',
    desc: 'Compara celulares inteligentes libres de operador.',
  },
  televisor: {
    name: 'Televisores y Video',
    slugPath: 'tecnologia/televisores-y-video',
    icono: '📺',
    parentName: 'Tecnología',
    desc: 'Compara Smart TVs 4K Samsung, LG, TCL y Challenger de 43, 50, 55 y 65 pulgadas.',
  },
  televisores: {
    name: 'Televisores y Video',
    slugPath: 'tecnologia/televisores-y-video',
    icono: '📺',
    parentName: 'Tecnología',
    desc: 'Compara Smart TVs 4K Samsung, LG, TCL y Challenger de 43, 50, 55 y 65 pulgadas.',
  },
  tv: {
    name: 'Televisores y Video',
    slugPath: 'tecnologia/televisores-y-video',
    icono: '📺',
    parentName: 'Tecnología',
    desc: 'Compara Smart TVs 4K Samsung, LG, TCL y Challenger.',
  },
  portatil: {
    name: 'Computadores y Portátiles',
    slugPath: 'tecnologia/computadores',
    icono: '💻',
    parentName: 'Tecnología',
    desc: 'Compara portátiles HP, Lenovo, Asus y Apple MacBook.',
  },
  portatiles: {
    name: 'Computadores y Portátiles',
    slugPath: 'tecnologia/computadores',
    icono: '💻',
    parentName: 'Tecnología',
    desc: 'Compara portátiles HP, Lenovo, Asus y Apple MacBook.',
  },
  laptop: {
    name: 'Computadores y Portátiles',
    slugPath: 'tecnologia/computadores',
    icono: '💻',
    parentName: 'Tecnología',
    desc: 'Compara laptops y notebooks para estudio, trabajo y gaming.',
  },
  audifonos: {
    name: 'Audio y Audífonos',
    slugPath: 'tecnologia/audio',
    icono: '🎧',
    parentName: 'Tecnología',
    desc: 'Compara audífonos bluetooth, inalámbricos, diadema y TWS.',
  },
  freidora: {
    name: 'Electrodomésticos de Cocina',
    slugPath: 'electrohogar/electrodomesticos-cocina',
    icono: '🍳',
    parentName: 'Electrohogar',
    desc: 'Compara freidoras de aire (air fryer), licuadoras y microondas.',
  },
};

export function findBestCategoryHelp(query: string): CategoryHelp | null {
  const norm = stripAccents(query).trim().toLowerCase();
  if (norm.length < 2) return null;

  // 1. Coincidencia directa o por token principal en el mapa prioritario
  const queryTokens = norm.split(/\s+/).filter(Boolean);
  for (const token of queryTokens) {
    if (HIGH_PRIORITY_CATEGORY_MAP[token]) {
      const match = HIGH_PRIORITY_CATEGORY_MAP[token];
      return {
        name: match.name,
        slugPath: match.slugPath,
        url: `/categoria/${match.slugPath}`,
        icono: match.icono,
        parentName: match.parentName,
        breadcrumbText: `${match.parentName} > ${match.name}`,
        description: match.desc,
      };
    }
  }

  // 2. Coincidencia exacta o por inicio en las 3,266 colecciones de TaxCo
  const candidates = searchCollections(norm, 4);
  if (candidates.length > 0) {
    const exact = candidates.find((c) => stripAccents(c.name).toLowerCase() === norm);
    const best = exact || candidates[0];
    const parentName = best.breadcrumb.length > 1 ? best.breadcrumb[best.breadcrumb.length - 2] : undefined;
    return {
      name: best.name,
      slugPath: best.slugPath,
      url: `/categoria/${best.slugPath}`,
      icono: getCategoryEmoji(best.name, best.rootSlug),
      parentName,
      breadcrumbText: best.breadcrumb.join(' > '),
      description: `Compara precios en la sección oficial de ${best.name} en tiendas de Colombia.`,
    };
  }

  return null;
}

