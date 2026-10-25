export const STOPWORDS = new Set([
  'de', 'la', 'el', 'en', 'y', 'para', 'con', 'por', 'del',
  'los', 'las', 'un', 'una', 'al', 'lo', 'su', 'x',
]);

export const SYNONYMS: Record<string, Set<string>> = {
  televisor: new Set(['televisor', 'tv', 'television']),
  tv: new Set(['televisor', 'tv', 'television']),
  television: new Set(['televisor', 'tv', 'television']),
  celular: new Set(['celular', 'smartphone', 'iphone']),
  smartphone: new Set(['celular', 'smartphone', 'iphone']),
  nevera: new Set(['nevera', 'refrigerador', 'refrigeradora']),
  refrigerador: new Set(['nevera', 'refrigerador', 'refrigeradora']),
  lavadora: new Set(['lavadora', 'lavarropas']),
  portatil: new Set(['portatil', 'laptop', 'notebook']),
  laptop: new Set(['portatil', 'laptop', 'notebook']),
  arroz: new Set(['arroz']),
  leche: new Set(['leche']),
  aceite: new Set(['aceite']),
  cargador: new Set(['cargador', 'charger']),
  charger: new Set(['cargador', 'charger']),
  mouse: new Set(['mouse', 'raton']),
  raton: new Set(['mouse', 'raton']),
};

const AUDIO_WORDS = [
  'audifono', 'audifonos', 'auricular', 'auriculares', 'earbud', 'earbuds',
  'earphone', 'earphones', 'headphone', 'headphones', 'headset', 'cascos', 'buds',
];
const AUDIO_SET = new Set(AUDIO_WORDS);
for (const word of AUDIO_WORDS) {
  SYNONYMS[word] = AUDIO_SET;
}

const SIZE_RE = /(\d+(?:[.,]\d+)?)\s*(mililitros|ml|litros|litro|lts|lt|l|kg|kilogramos|kilos|gramos|gramo|grs|gr|g)\b/i;
const PACK_RE = /\bx\s*(\d+)\s*(unds|und|unidades|unid|u)\b/i;

const UNIT_TO_BASE: Record<string, [string, number]> = {
  ml: ['L', 0.001],
  mililitros: ['L', 0.001],
  l: ['L', 1],
  lt: ['L', 1],
  lts: ['L', 1],
  litro: ['L', 1],
  litros: ['L', 1],
  g: ['kg', 0.001],
  gr: ['kg', 0.001],
  grs: ['kg', 0.001],
  gramo: ['kg', 0.001],
  gramos: ['kg', 0.001],
  kg: ['kg', 1],
  kilos: ['kg', 1],
  kilogramos: ['kg', 1],
};

export function stripAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalize(text: string): string {
  return stripAccents(text).toLowerCase();
}

export function tokens(text: string): string[] {
  const matches = normalize(text).match(/[a-z0-9]+/g) || [];
  return matches.filter((token) => !STOPWORDS.has(token) && token.length > 1);
}

export function tokenMatches(token: string, productTokens: Set<string>, productText: string): boolean {
  const options = SYNONYMS[token] || new Set([token]);
  for (const opt of options) {
    if (productTokens.has(opt)) return true;
  }
  if (/^\d{2,}$/.test(token)) {
    const re = new RegExp(`(?<![0-9])${token}(?![0-9])`);
    return re.test(productText);
  }
  if (token.length >= 5) {
    for (const prod of productTokens) {
      if (prod.length >= 5 && (prod.startsWith(token) || token.startsWith(prod))) {
        return true;
      }
    }
  }
  return false;
}

export const ACCESSORY_TERMS = new Set([
  'acomodador', 'acomodadores',
  'organizador', 'organizadores',
  'portahuevos', 'porta-huevos', 'huevera', 'hueveras',
  'dispensador', 'dispensadores',
  'soporte', 'soportes',
  'separador', 'separadores',
  'batidor', 'batidores', 'batidora',
  'cocinador', 'cocinadores',
  'hervidor', 'hervidores',
  'escalfador', 'escalfadores',
  'rallador', 'ralladores',
  'exprimidor', 'exprimidores',
  'espumador', 'espumadores',
  'molde', 'moldes',
  'jabonera', 'jaboneras',
  'mantequillera', 'mantequilleras',
  'quesera', 'queseras',
  'panera', 'paneras',
  'aceitera', 'aceiteras',
  'arrocera', 'arroceras',
  'cafetera', 'cafeteras',
  'molinillo',
  'extractor', 'extractores',
  'biberon', 'biberones',
  'pelador', 'peladores',
  'descorazonador',
  'peluche', 'juguete', 'disfraz',
]);

export function isAccessoryMismatch(query: string, name: string): boolean {
  const normQ = normalize(query);
  const qTokens = new Set(tokens(query));

  // Si la búsqueda del usuario ya incluye algún término de accesorio explícitamente
  // (ej. "organizador de huevos", "huevera", "cafetera", "arrocera", "dispensador"),
  // NO es un mismatch (el usuario realmente busca el accesorio/utensilio).
  for (const t of qTokens) {
    if (ACCESSORY_TERMS.has(t) || t === 'porta' || (t.startsWith('porta') && !t.startsWith('portatil') && !t.startsWith('portada'))) {
      return false;
    }
  }
  if (/\bporta\s+/i.test(normQ) || /\b(organizador|soporte|dispensador|huevera)\b/i.test(normQ)) {
    return false;
  }

  const normName = normalize(name);
  const nameTokens = tokens(name);

  // 1. Coincidencia directa con ACCESSORY_TERMS en los tokens del producto
  for (const t of nameTokens) {
    if (ACCESSORY_TERMS.has(t)) {
      return true;
    }
  }

  // 2. Patrones con "porta", ej: "porta huevos", "porta-huevos", "portahuevos", "porta leche"
  if (/\bporta[\s-]*[a-z]{3,}\b/i.test(normName)) {
    const portaMatch = normName.match(/\bporta[\s-]*([a-z]+)\b/i);
    if (portaMatch) {
      const rest = portaMatch[1];
      if (!rest.startsWith('til') && !rest.startsWith('da') && !rest.startsWith('folio') && !rest.startsWith('ble')) {
        return true;
      }
    }
  }

  // 3. Patrones de organizador/soporte/recipiente/caja para alimentos:
  // "recipiente para huevos", "caja organizadora para huevos", "bandeja organizadora de huevos"
  if (/\b(recipiente|caja organizadora|bandeja organizadora|estante organizador)\s+(?:para|de)\s+(?:huevos?|nevera|refrigerador)\b/i.test(normName)) {
    return true;
  }

  return false;
}

export function relevance(query: string, name: string, brand?: string | null): number {
  if (isAccessoryMismatch(query, name)) {
    return 0.0;
  }
  const queryTokens = tokens(query);
  if (queryTokens.length === 0) return 0.0;
  const blob = `${name} ${brand || ''}`;
  const productTokens = new Set(tokens(blob));
  const productText = normalize(blob);
  let matched = 0;
  for (const token of queryTokens) {
    if (tokenMatches(token, productTokens, productText)) {
      matched += 1;
    }
  }
  return matched / queryTokens.length;
}

export function requiredMatchRatio(query: string): number {
  const count = tokens(query).length;
  return count <= 2 ? 1.0 : 0.67;
}

export function categoryMatches(query: string, categories: string[], name?: string): boolean {
  if (!categories || categories.length === 0) return false;
  if (name && isAccessoryMismatch(query, name)) return false;
  const blob = categories.join(' ');
  const productTokens = new Set(tokens(blob));
  const productText = normalize(blob);
  const qTokens = tokens(query);
  return qTokens.some((token) => tokenMatches(token, productTokens, productText));
}

export function parseCop(value: string): number | null {
  let cleaned = value.trim().replace(/\$/g, '').replace(/\s/g, '');
  if (!cleaned) return null;
  if (cleaned.includes(',') && cleaned.includes('.')) {
    cleaned = cleaned.replace(/\./g, '').replace(/,/g, '.');
  } else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(/,/g, '.');
  } else {
    cleaned = cleaned.replace(/\./g, '');
  }
  const amount = Number(cleaned);
  if (isNaN(amount) || amount <= 0) return null;
  return amount;
}

export function cleanEan(value: unknown, minLength = 8): string | null {
  if (value == null) return null;
  const digits = String(value).replace(/\D/g, '');
  if (digits.length >= minLength && digits.length <= 14 && new Set(digits).size > 1) {
    return digits;
  }
  return null;
}

function parseNumber(raw: string): number {
  let s = raw;
  if (s.includes(',') && s.includes('.')) {
    s = s.replace(/\./g, '').replace(/,/g, '.');
  } else if (s.split('.').length === 2 && s.split('.')[1].length !== 3) {
    s = s.replace(/,/g, '.');
  } else {
    s = s.replace(/\./g, '').replace(/,/g, '.');
  }
  return Number(s);
}

const COUNT_RE = /(?:x\s*)?(\d+)\s*(?:unidades|unidad|unds|und|unid|uds|un)\b/i;
const EGG_RE = /(\d+)\s*huevos?\b/i;
const LOOSE_COUNT_RE = /\bx\s*(\d+)\b(?!\s*(?:\.\d{3})?\s*(?:mililitros|ml|litros|litro|lts|lt|l|kg|kilogramos|kilos|gramos|gramo|grs|gr|g)\b)/i;
const MULTIPACK_PREFIX_RE = /(?<![\d.,])(\d{1,2})\s*[x×]\s*$/i;

const GRAM_FACTOR: Record<string, number> = {
  g: 1, gr: 1, grs: 1, gramo: 1, gramos: 1, kg: 1000, kilos: 1000, kilogramos: 1000,
};
const ML_FACTOR: Record<string, number> = {
  ml: 1, mililitros: 1, l: 1000, lt: 1000, lts: 1000, litro: 1000, litros: 1000,
};

function countInName(name: string): number | null {
  for (const pattern of [COUNT_RE, EGG_RE, LOOSE_COUNT_RE]) {
    const m = pattern.exec(name);
    if (m) {
      const count = parseInt(m[1], 10);
      if (count >= 1 && count <= 500) return count;
    }
  }
  return null;
}

export interface SaleMeasureResult {
  amount: number;
  quantity: number;
  per: string;
  basis: string;
}

export function saleMeasure(name: string, price: number): SaleMeasureResult | null {
  const folded = stripAccents(name);
  const count = countInName(folded);
  if (count) {
    return {
      amount: Number((price / count).toFixed(4)),
      quantity: count,
      per: 'unidad',
      basis: 'unidad',
    };
  }
  const match = SIZE_RE.exec(folded);
  if (!match) return null;
  const quantity = parseNumber(match[1]);
  const unit = match[2].toLowerCase();
  let total: number;
  let per: string;
  if (unit in GRAM_FACTOR) {
    total = quantity * GRAM_FACTOR[unit];
    per = 'gramo';
  } else if (unit in ML_FACTOR) {
    total = quantity * ML_FACTOR[unit];
    per = 'mililitro';
  } else {
    return null;
  }
  const multipack = MULTIPACK_PREFIX_RE.exec(folded.slice(0, match.index));
  if (multipack && parseInt(multipack[1], 10) >= 2) {
    total *= parseInt(multipack[1], 10);
  }
  if (total <= 0) return null;
  return {
    amount: Number((price / total).toFixed(4)),
    quantity: total,
    per,
    basis: per,
  };
}

export function unitPrice(name: string, price: number): { amount: number; per: string } | null {
  const match = SIZE_RE.exec(name);
  if (!match) return null;
  const quantity = parseNumber(match[1]);
  const unit = match[2].toLowerCase();
  const config = UNIT_TO_BASE[unit];
  if (!config) return null;
  const [base, factor] = config;
  let total = quantity * factor;
  const pack = PACK_RE.exec(name);
  if (pack) {
    total *= parseInt(pack[1], 10);
  }
  if (total <= 0) return null;
  return { amount: Number((price / total).toFixed(2)), per: base };
}

export function cop(amount: number): string {
  const formatted = Math.round(amount).toLocaleString('es-CO');
  return `$ ${formatted.replace(/,/g, '.')}`;
}

export function copExact(amount: number): string {
  if (amount >= 100) {
    return cop(amount);
  }
  const parts = amount.toFixed(2).split('.');
  return `$ ${parts[0]},${parts[1]}`;
}

export function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

