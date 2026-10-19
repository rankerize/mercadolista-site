import { C as CATEGORIES, a as CATALOG_ITEMS } from './catalog_BCGwfOxn.mjs';

function toSlug(text) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, "-");
}
function getCategoryBySlug(slug) {
  return CATEGORIES.find((c) => c.id === slug);
}
function getItemBySlug(categoriaSlug, productoSlug) {
  return CATALOG_ITEMS.find(
    (item) => item.categoria === categoriaSlug && toSlug(item.nombre) === productoSlug
  );
}

export { getItemBySlug as a, getCategoryBySlug as g, toSlug as t };
