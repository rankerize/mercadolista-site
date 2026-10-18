export interface City {
  id: string;
  name: string;
  postal_code: string;
}

export interface Offer {
  store_id: string;
  store_name: string;
  name: string;
  brand: string | null;
  price: number;
  list_price: number | null;
  url: string;
  image: string | null;
  ean: string | null;
  categories: string[];
  payment_label?: string | null;
  payment_price?: number | null;
  savings?: number | null;
}

export interface StoreOutcome {
  store_id: string;
  store_name: string;
  kind: string;
  offers: Offer[];
  error?: string | null;
}

export interface IntlOffer {
  store_id: string;
  store_name: string;
  name: string;
  price: number;
  url: string;
  image?: string | null;
  shipping_cost?: number | null;
  ships_to_colombia?: boolean | null;
  shipping_note?: string | null;
  total?: number | null;
}

export interface IntlOutcome {
  store_id: string;
  store_name: string;
  offers: IntlOffer[];
  error?: string | null;
}

export interface ListItemIn {
  nombre: string;
  marca?: string;
  formato: 'gramos' | 'mililitros' | 'unidades';
  cantidad: number;
}

export interface UserSession {
  id: number;
  nombre: string;
  contacto: string;
}
