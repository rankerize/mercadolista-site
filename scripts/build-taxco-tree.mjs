import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function toSlug(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

function parseCSVLine(text) {
  let p = '', row = [], inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') inQuotes = !inQuotes;
    else if (c === ',' && !inQuotes) { row.push(p); p = ''; }
    else p += c;
  }
  row.push(p);
  return row;
}

const csvPath = path.join(rootDir, 'taxonomia', 'Bitacora de Collections - TaxCo.csv');
if (!fs.existsSync(csvPath)) {
  console.error('No se encontró el archivo:', csvPath);
  process.exit(1);
}

const file = fs.readFileSync(csvPath, 'utf8');
const lines = file.split('\n').filter(Boolean);

const nodes = {};
const pathToId = {};
const parentToChildren = {};
const rootIds = [];

const ROOT_ICONS = {
  'accesorios-moda': '👜',
  'alimentos-y-bebidas': '🥫',
  'aseo-y-limpieza': '🧼',
  'automotriz': '🚗',
  'belleza-higiene-y-salud': '💄',
  'calzado-y-tenis': '👟',
  'cocina-y-bano': '🍳',
  'construccion': '🧱',
  'decohogar': '🖼️',
  'deportes-y-aire-libre': '⚽',
  'dormitorio': '🛏️',
  'electricidad': '⚡',
  'electrohogar': '🔌',
  'ferreteria': '🔩',
  'gasfiteria': '🔧',
  'herramientas-y-maquinas': '🛠️',
  'jardin-y-terraza': '🪴',
  'libros-papeleria-y-celebraciones': '📚',
  'maleteria-y-viajes': '🧳',
  'mascotas': '🐾',
  'moda': '👗',
  'muebles-y-organizacion': '🪑',
  'mundo-bebe': '🍼',
  'musica-y-pasatiempos': '🎸',
  'ninos-y-jugueteria': '🧸',
  'pinturas': '🎨',
  'servicios-e-intangibles': '💳',
  'tecnologia': '📺',
};

for (let i = 1; i < lines.length; i++) {
  const row = parseCSVLine(lines[i]);
  const catId = (row[1] || '').trim();
  const parentIdRaw = (row[2] || '').trim();
  const name = (row[3] || '').trim();
  const breadcrumbRaw = (row[4] || '').trim();
  const n1 = (row[5] || '').trim();
  const n2 = (row[6] || '').trim();
  const n3 = (row[7] || '').trim();
  const n4 = (row[8] || '').trim();
  const n5 = (row[9] || '').trim();

  if (!catId || !name) continue;

  const parentId = (!parentIdRaw || parentIdRaw === 'null') ? null : parentIdRaw;
  const levels = [n1, n2, n3, n4, n5].filter(Boolean);
  const slugPath = levels.map(toSlug).join('/');
  const rootSlug = toSlug(n1);

  nodes[catId] = {
    id: catId,
    parentId,
    name,
    slug: toSlug(name),
    slugPath,
    rootSlug,
    level: levels.length,
    breadcrumb: breadcrumbRaw.split('|').map(s => s.trim()).filter(Boolean),
    icono: ROOT_ICONS[rootSlug] || '🏷️',
    query: name.toLowerCase(),
    childIds: [],
  };

  pathToId[slugPath] = catId;

  if (!parentId) {
    if (!rootIds.includes(catId)) rootIds.push(catId);
  } else {
    if (!parentToChildren[parentId]) parentToChildren[parentId] = [];
    parentToChildren[parentId].push(catId);
  }
}

// Asociar hijos
for (const [pId, children] of Object.entries(parentToChildren)) {
  if (nodes[pId]) {
    nodes[pId].childIds = children;
  }
}

const outputData = {
  total: Object.keys(nodes).length,
  rootIds,
  nodes,
  pathToId,
};

const outDir = path.join(rootDir, 'src', 'data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const outPath = path.join(outDir, 'taxco-tree.json');
fs.writeFileSync(outPath, JSON.stringify(outputData), 'utf8');

console.log(`✓ Árbol de taxonomía TaxCo generado con éxito:`);
console.log(`  - Total de nodos: ${outputData.total}`);
console.log(`  - Categorías raíz (L1): ${rootIds.length}`);
console.log(`  - Archivo guardado en: ${outPath}`);
