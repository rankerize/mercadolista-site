import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const BASE_URL = 'https://mercadolista.com';
// Fecha de hoy en Colombia (UTC-5), para que lastmod no salte de día de noche
const TODAY = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });

// Un sitemap por tipo de URL. El índice /sitemap.xml los agrupa.
const SITEMAP_TYPES = ['page', 'categoria', 'search', 'collection'];
const groups = Object.fromEntries(SITEMAP_TYPES.map((type) => [type, new Map()]));

function addUrl(type, urlPath, priority = '0.8', changefreq = 'daily') {
  const cleanPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
  const fullUrl = `${BASE_URL}${cleanPath === '/' ? '' : cleanPath}`;

  if (!groups[type].has(fullUrl)) {
    groups[type].set(fullUrl, { loc: fullUrl, lastmod: TODAY, changefreq, priority });
  }
}

// 1. page: páginas estáticas y landings
addUrl('page', '/', '1.0', 'daily');
addUrl('page', '/page/black-friday', '1.0', 'daily');
addUrl('page', '/asistente', '0.9', 'daily');
addUrl('page', '/perfil', '0.8', 'weekly');
addUrl('page', '/privacidad', '0.5', 'monthly');
addUrl('page', '/terminos', '0.5', 'monthly');

// 2. categoria: índice de categorías, árbol TaxCo y taxonomía CSV
addUrl('categoria', '/categoria', '0.9', 'daily');

const taxcoPath = path.join(rootDir, 'src', 'data', 'taxco-tree.json');
if (fs.existsSync(taxcoPath)) {
  const taxco = JSON.parse(fs.readFileSync(taxcoPath, 'utf8'));
  for (const node of Object.values(taxco.nodes)) {
    const priority = node.level === 1 ? '1.0' : (node.level === 2 ? '0.9' : (node.level === 3 ? '0.8' : (node.level === 4 ? '0.7' : '0.6')));
    addUrl('categoria', `/categoria/${node.slugPath}`, priority, 'daily');
  }
}

const taxCsvPath = path.join(rootDir, 'taxonomia', 'mercadolista-taxonomy.csv');
if (fs.existsSync(taxCsvPath)) {
  const lines = fs.readFileSync(taxCsvPath, 'utf8').split('\n').slice(1);
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(',');
    const url = parts[0]?.trim();
    const vol = parts[parts.length - 2]?.trim();
    const indexar = parts[parts.length - 1]?.trim();
    if (url && indexar === 'Sí') {
      const priority = vol === 'Alto' ? '0.9' : (vol === 'Medio' ? '0.8' : '0.7');
      addUrl('categoria', url, priority, 'daily');
    }
  }
}

const prodCsvPath = path.join(rootDir, 'taxonomia', 'categorias-productos.csv');
if (fs.existsSync(prodCsvPath)) {
  const lines = fs.readFileSync(prodCsvPath, 'utf8').split('\n').slice(1);
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(',');
    const url = parts[4]?.trim();
    if (url && url.startsWith('/categoria')) {
      const isProduct = parts[0]?.trim() === 'PRODUCTO';
      addUrl('categoria', url, isProduct ? '0.9' : '0.8', 'daily');
    }
  }
}

// 3. search: las páginas /search/ son noindex; el sitemap queda vacío a propósito.

// 4. collection: índice de colecciones y una URL por keyword
addUrl('collection', '/collection', '0.9', 'weekly');
const keywordsPath = path.join(rootDir, 'src', 'data', 'keyword-collections.json');
const keywordCollections = JSON.parse(fs.readFileSync(keywordsPath, 'utf8'));
for (const c of keywordCollections) {
  addUrl('collection', `/collection/${c.slug}`, '0.9', 'weekly');
}

function urlsetXml(entries) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  for (const entry of entries) {
    lines.push('  <url>');
    lines.push(`    <loc>${entry.loc}</loc>`);
    lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
    lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    lines.push(`    <priority>${entry.priority}</priority>`);
    lines.push('  </url>');
  }
  lines.push('</urlset>');
  return lines.join('\n') + '\n';
}

function indexXml(types) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  for (const type of types) {
    lines.push('  <sitemap>');
    lines.push(`    <loc>${BASE_URL}/sitemap-${type}.xml</loc>`);
    lines.push(`    <lastmod>${TODAY}</lastmod>`);
    lines.push('  </sitemap>');
  }
  lines.push('</sitemapindex>');
  return lines.join('\n') + '\n';
}

// Escribe en public/ y, si existe, sincroniza dist/client/
const outputs = new Map();
for (const type of SITEMAP_TYPES) {
  outputs.set(`sitemap-${type}.xml`, urlsetXml([...groups[type].values()]));
}
outputs.set('sitemap.xml', indexXml(SITEMAP_TYPES));

const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist', 'client');
for (const [file, xml] of outputs) {
  fs.writeFileSync(path.join(publicDir, file), xml, 'utf8');
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, file), xml, 'utf8');
  }
}

for (const type of SITEMAP_TYPES) {
  console.log(`✓ sitemap-${type}.xml: ${groups[type].size} URLs`);
}
console.log(`✓ sitemap.xml (índice) con ${SITEMAP_TYPES.length} sitemaps`);
