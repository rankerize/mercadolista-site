import type { City, Offer, StoreOutcome } from '../types';
import { type VtexStoreConfig, searchVtex } from './vtex';
import { type AlgoliaStoreConfig, searchAlgolia } from './algolia';
import { type FalabellaStoreConfig, searchFalabella } from './falabella';

export type StoreDef =
  | ({ type: 'vtex' } & VtexStoreConfig)
  | ({ type: 'algolia' } & AlgoliaStoreConfig)
  | ({ type: 'falabella' } & FalabellaStoreConfig);

export const STORES: readonly StoreDef[] = [
  { type: 'vtex', id: 'exito', name: 'Éxito', kind: 'supermercado', site: 'https://www.exito.com', api_root: 'https://exitocol.vtexcommercestable.com.br', region_root: 'https://exitocol.vtexcommercestable.com.br' },
  { type: 'vtex', id: 'carulla', name: 'Carulla', kind: 'supermercado', site: 'https://www.carulla.com', api_root: 'https://www.carulla.com/io' },
  { type: 'vtex', id: 'jumbo', name: 'Jumbo', kind: 'supermercado', site: 'https://www.jumbocolombia.com', api_root: 'https://www.jumbocolombia.com' },
  { type: 'vtex', id: 'olimpica', name: 'Olímpica', kind: 'supermercado', site: 'https://www.olimpica.com', api_root: 'https://www.olimpica.com' },
  { type: 'vtex', id: 'd1', name: 'D1', kind: 'supermercado', site: 'https://www.d1.com.co', api_root: 'https://www.d1.com.co' },
  { type: 'algolia', id: 'alkosto', name: 'Alkosto', kind: 'tecnologia', site: 'https://www.alkosto.com', home_url: 'https://www.alkosto.com/' },
  { type: 'algolia', id: 'ktronix', name: 'Ktronix', kind: 'tecnologia', site: 'https://www.ktronix.com', home_url: 'https://www.ktronix.com/' },
  { type: 'falabella', id: 'falabella', name: 'Falabella', kind: 'tecnologia', site: 'https://www.falabella.com.co' },
  { type: 'vtex', id: 'easy', name: 'Easy', kind: 'hogar', site: 'https://www.easy.com.co', api_root: 'https://www.easy.com.co' },
] as const;

export function storeCatalog(): { id: string; name: string; kind: string }[] {
  return STORES.map((s) => ({ id: s.id, name: s.name, kind: s.kind }));
}

function shortError(storeName: string, error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes('Timeout') || msg.includes('timeout') || msg.includes('aborted')) {
    return `${storeName} tardó demasiado`;
  }
  return `${storeName}: ${msg.slice(0, 140)}`;
}

export async function searchStores(query: string, city: City, limit = 16): Promise<StoreOutcome[]> {
  const tasks = STORES.map(async (store): Promise<StoreOutcome> => {
    try {
      let offers: Offer[] = [];
      if (store.type === 'vtex') {
        offers = await searchVtex(store, query, city, limit);
      } else if (store.type === 'algolia') {
        offers = await searchAlgolia(store, query, limit);
      } else if (store.type === 'falabella') {
        offers = await searchFalabella(store, query, limit);
      }
      return {
        store_id: store.id,
        store_name: store.name,
        kind: store.kind,
        offers,
      };
    } catch (err) {
      return {
        store_id: store.id,
        store_name: store.name,
        kind: store.kind,
        offers: [],
        error: shortError(store.name, err),
      };
    }
  });

  return Promise.all(tasks);
}
