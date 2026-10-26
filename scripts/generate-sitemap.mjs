import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const BASE_URL = 'https://mercadolista.com';
const TODAY = '2026-10-25';

const entriesMap = new Map();

function addUrl(urlPath, priority = '0.8', changefreq = 'daily') {
  const cleanPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
  const fullUrl = `${BASE_URL}${cleanPath === '/' ? '' : cleanPath}`;
  
  if (!entriesMap.has(fullUrl)) {
    entriesMap.set(fullUrl, {
      loc: fullUrl,
      lastmod: TODAY,
      changefreq,
      priority,
    });
  }
}

// 1. Páginas estáticas principales
addUrl('/', '1.0', 'daily');
addUrl('/asistente', '0.9', 'daily');
addUrl('/categoria', '0.9', 'daily');
addUrl('/perfil', '0.8', 'weekly');
addUrl('/privacidad', '0.5', 'monthly');
addUrl('/terminos', '0.5', 'monthly');

// 2. Taxonomía TaxCo (3,266 nodos - indexar el 100% de categorías)
const taxcoPath = path.join(rootDir, 'src', 'data', 'taxco-tree.json');
if (fs.existsSync(taxcoPath)) {
  const taxco = JSON.parse(fs.readFileSync(taxcoPath, 'utf8'));
  for (const node of Object.values(taxco.nodes)) {
    const priority = node.level === 1 ? '1.0' : (node.level === 2 ? '0.9' : (node.level === 3 ? '0.8' : (node.level === 4 ? '0.7' : '0.6')));
    addUrl(`/categoria/${node.slugPath}`, priority, 'daily');
  }
}

// 3. URLs de la taxonomía colombiana previa (mercadolista-taxonomy.csv)
const taxCsvPath = path.join(rootDir, 'taxonomia', 'mercadolista-taxonomy.csv');
if (fs.existsSync(taxCsvPath)) {
  const content = fs.readFileSync(taxCsvPath, 'utf8');
  const lines = content.split('\n').slice(1);
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(',');
    const url = parts[0]?.trim();
    const vol = parts[parts.length - 2]?.trim();
    const indexar = parts[parts.length - 1]?.trim();
    if (url && indexar === 'Sí') {
      const priority = vol === 'Alto' ? '0.9' : (vol === 'Medio' ? '0.8' : '0.7');
      addUrl(url, priority, 'daily');
    }
  }
}

// 4. URLs de productos individuales (categorias-productos.csv)
const prodCsvPath = path.join(rootDir, 'taxonomia', 'categorias-productos.csv');
if (fs.existsSync(prodCsvPath)) {
  const content = fs.readFileSync(prodCsvPath, 'utf8');
  const lines = content.split('\n').slice(1);
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(',');
    const url = parts[4]?.trim();
    if (url && url.startsWith('/categoria')) {
      const isProduct = parts[0]?.trim() === 'PRODUCTO';
      addUrl(url, isProduct ? '0.9' : '0.8', 'daily');
    }
  }
}

// Construir XML
const xmlLines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
];

for (const entry of entriesMap.values()) {
  xmlLines.push('  <url>');
  xmlLines.push(`    <loc>${entry.loc}</loc>`);
  xmlLines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
  xmlLines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
  xmlLines.push(`    <priority>${entry.priority}</priority>`);
  xmlLines.push('  </url>');
}

xmlLines.push('</urlset>');
const xmlOutput = xmlLines.join('\n') + '\n';

// Guardar en public/sitemap.xml y en dist/client/sitemap.xml
const publicSitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
fs.writeFileSync(publicSitemapPath, xmlOutput, 'utf8');
console.log(`✓ Sitemap generado con ${entriesMap.size} URLs en: ${publicSitemapPath}`);

const distSitemapPath = path.join(rootDir, 'dist', 'client', 'sitemap.xml');
if (fs.existsSync(path.dirname(distSitemapPath))) {
  fs.writeFileSync(distSitemapPath, xmlOutput, 'utf8');
  console.log(`✓ Sitemap sincronizado en: ${distSitemapPath}`);
}
