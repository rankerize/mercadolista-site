import { CATALOG_ITEMS, CATEGORIES } from './catalog';
import type { CatalogItem, CategoryInfo } from './catalog';

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return CATEGORIES.find((c) => c.id === slug);
}

export function getItemBySlug(categoriaSlug: string, productoSlug: string): CatalogItem | undefined {
  return CATALOG_ITEMS.find(
    (item) => item.categoria === categoriaSlug && toSlug(item.nombre) === productoSlug,
  );
}

export function findCategoryMatch(query: string): CategoryInfo | undefined {
  const qSlug = toSlug(query);
  if (!qSlug) return undefined;
  return CATEGORIES.find((c) => {
    const cSlug = toSlug(c.nombre);
    return c.id === qSlug || cSlug === qSlug || c.palabrasClave.some((kw) => toSlug(kw) === qSlug);
  });
}

export function findProductMatch(query: string): CatalogItem | undefined {
  const qSlug = toSlug(query);
  if (!qSlug) return undefined;
  return CATALOG_ITEMS.find((it) => toSlug(it.nombre) === qSlug);
}

export function getProductUrl(item: CatalogItem): string {
  return `/categoria/${item.categoria}/${toSlug(item.nombre)}`;
}

export function getCategoryUrl(categoriaId: string): string {
  return `/categoria/${categoriaId}`;
}

