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
