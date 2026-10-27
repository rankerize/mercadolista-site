// Colecciones de keywords puntuales: cada una es una URL /collection/[slug]/
// que consulta precios en vivo para su término exacto.
// La lista vive en src/data/keyword-collections.json para que el generador de sitemaps la use también.
import collectionsData from '../data/keyword-collections.json';

export interface KeywordCollection {
  slug: string;
  nombre: string;
  query: string;
}

export const KEYWORD_COLLECTIONS: KeywordCollection[] = collectionsData;

export function getKeywordCollection(slug: string): KeywordCollection | undefined {
  return KEYWORD_COLLECTIONS.find((c) => c.slug === slug);
}
