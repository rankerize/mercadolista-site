import { searchCollections } from './collectionTaxonomy';
import { KEYWORD_COLLECTIONS } from './keywordCollections';
import { stripAccents } from './normalize';

export type SuggestionType = 'buscar' | 'coleccion' | 'categoria' | 'pagina';

export interface Suggestion {
  type: SuggestionType;
  label: string;
  sublabel?: string;
  icono: string;
  url: string;
}

const MAX_SUGGESTIONS = 10;

// Páginas fijas del sitio que se sugieren por nombre o por palabra clave
const PAGES: Array<{ label: string; url: string; icono: string; terms: string[] }> = [
  { label: 'Black Friday 2026', url: '/page/black-friday', icono: '🛍️', terms: ['black friday', 'ofertas', 'descuentos'] },
  { label: 'Asistente de compras', url: '/asistente', icono: '🧑‍🍳', terms: ['asistente', 'receta', 'recetas', 'cocinar'] },
  { label: 'Todas las categorías', url: '/categoria', icono: '🗂️', terms: ['categoria', 'categorias', 'explorar'] },
  { label: 'Mi perfil y listas', url: '/perfil', icono: '👤', terms: ['perfil', 'mis listas', 'cuenta'] },
];

function norm(text: string): string {
  return stripAccents(text).toLowerCase().trim();
}

export function getSuggestions(rawQuery: string): Suggestion[] {
  const query = rawQuery.trim().replace(/\s+/g, ' ');
  if (query.length < 2) return [];

  const q = norm(query);
  const suggestions: Suggestion[] = [
    {
      type: 'buscar',
      label: `Buscar "${query}"`,
      sublabel: 'Ver precios en todas las tiendas',
      icono: '🔍',
      url: `/search/?query=${encodeURIComponent(query)}`,
    },
  ];

  // 1. Colecciones de keywords puntuales (ej. iPhone 16)
  for (const c of KEYWORD_COLLECTIONS) {
    if (norm(c.nombre).includes(q) || norm(c.query).includes(q)) {
      suggestions.push({
        type: 'coleccion',
        label: c.nombre,
        sublabel: 'Colección de precios',
        icono: '⭐',
        url: `/collection/${c.slug}`,
      });
    }
  }

  // 2. Categorías del árbol TaxCo (ej. Celulares y Teléfonos)
  for (const node of searchCollections(query, 5)) {
    const parent = node.breadcrumb.length > 1 ? node.breadcrumb[node.breadcrumb.length - 2] : undefined;
    suggestions.push({
      type: 'categoria',
      label: node.name,
      sublabel: parent ? `en ${parent}` : 'Categoría',
      icono: node.icono || '🏷️',
      url: `/categoria/${node.slugPath}`,
    });
  }

  // 3. Páginas del sitio
  for (const p of PAGES) {
    if (norm(p.label).includes(q) || p.terms.some((t) => t.includes(q) || q.includes(t))) {
      suggestions.push({ type: 'pagina', label: p.label, sublabel: 'Página', icono: p.icono, url: p.url });
    }
  }

  return suggestions.slice(0, MAX_SUGGESTIONS);
}
