const STOPWORDS = /* @__PURE__ */ new Set([
  "de",
  "la",
  "el",
  "en",
  "y",
  "para",
  "con",
  "por",
  "del",
  "los",
  "las",
  "un",
  "una",
  "al",
  "lo",
  "su",
  "x"
]);
const SYNONYMS = {
  televisor: /* @__PURE__ */ new Set(["televisor", "tv", "television"]),
  tv: /* @__PURE__ */ new Set(["televisor", "tv", "television"]),
  television: /* @__PURE__ */ new Set(["televisor", "tv", "television"]),
  celular: /* @__PURE__ */ new Set(["celular", "smartphone", "iphone"]),
  smartphone: /* @__PURE__ */ new Set(["celular", "smartphone", "iphone"]),
  nevera: /* @__PURE__ */ new Set(["nevera", "refrigerador", "refrigeradora"]),
  refrigerador: /* @__PURE__ */ new Set(["nevera", "refrigerador", "refrigeradora"]),
  lavadora: /* @__PURE__ */ new Set(["lavadora", "lavarropas"]),
  portatil: /* @__PURE__ */ new Set(["portatil", "laptop", "notebook"]),
  laptop: /* @__PURE__ */ new Set(["portatil", "laptop", "notebook"]),
  arroz: /* @__PURE__ */ new Set(["arroz"]),
  leche: /* @__PURE__ */ new Set(["leche"]),
  aceite: /* @__PURE__ */ new Set(["aceite"]),
  cargador: /* @__PURE__ */ new Set(["cargador", "charger"]),
  charger: /* @__PURE__ */ new Set(["cargador", "charger"]),
  mouse: /* @__PURE__ */ new Set(["mouse", "raton"]),
  raton: /* @__PURE__ */ new Set(["mouse", "raton"])
};
const AUDIO_WORDS = [
  "audifono",
  "audifonos",
  "auricular",
  "auriculares",
  "earbud",
  "earbuds",
  "earphone",
  "earphones",
  "headphone",
  "headphones",
  "headset",
  "cascos",
  "buds"
];
const AUDIO_SET = new Set(AUDIO_WORDS);
for (const word of AUDIO_WORDS) {
  SYNONYMS[word] = AUDIO_SET;
}
const SIZE_RE = /(\d+(?:[.,]\d+)?)\s*(mililitros|ml|litros|litro|lts|lt|l|kg|kilogramos|kilos|gramos|gramo|grs|gr|g)\b/i;
const PACK_RE = /\bx\s*(\d+)\s*(unds|und|unidades|unid|u)\b/i;
const UNIT_TO_BASE = {
  ml: ["L", 1e-3],
  mililitros: ["L", 1e-3],
  l: ["L", 1],
  lt: ["L", 1],
  lts: ["L", 1],
  litro: ["L", 1],
  litros: ["L", 1],
  g: ["kg", 1e-3],
  gr: ["kg", 1e-3],
  grs: ["kg", 1e-3],
  gramo: ["kg", 1e-3],
  gramos: ["kg", 1e-3],
  kg: ["kg", 1],
  kilos: ["kg", 1],
  kilogramos: ["kg", 1]
};
function stripAccents(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function normalize(text) {
  return stripAccents(text).toLowerCase();
}
function tokens(text) {
  const matches = normalize(text).match(/[a-z0-9]+/g) || [];
  return matches.filter((token) => !STOPWORDS.has(token) && token.length > 1);
}
function tokenMatches(token, productTokens, productText) {
  const options = SYNONYMS[token] || /* @__PURE__ */ new Set([token]);
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
function relevance(query, name, brand) {
  const queryTokens = tokens(query);
  if (queryTokens.length === 0) return 0;
  const blob = `${name} ${brand || ""}`;
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
function requiredMatchRatio(query) {
  const count = tokens(query).length;
  return count <= 2 ? 1 : 0.67;
}
function categoryMatches(query, categories) {
  if (!categories || categories.length === 0) return false;
  const blob = categories.join(" ");
  const productTokens = new Set(tokens(blob));
  const productText = normalize(blob);
  const qTokens = tokens(query);
  return qTokens.some((token) => tokenMatches(token, productTokens, productText));
}
function parseCop(value) {
  let cleaned = value.trim().replace(/\$/g, "").replace(/\s/g, "");
  if (!cleaned) return null;
  if (cleaned.includes(",") && cleaned.includes(".")) {
    cleaned = cleaned.replace(/\./g, "").replace(/,/g, ".");
  } else if (cleaned.includes(",")) {
    cleaned = cleaned.replace(/,/g, ".");
  } else {
    cleaned = cleaned.replace(/\./g, "");
  }
  const amount = Number(cleaned);
  if (isNaN(amount) || amount <= 0) return null;
  return amount;
}
function cleanEan(value, minLength = 8) {
  if (value == null) return null;
  const digits = String(value).replace(/\D/g, "");
  if (digits.length >= minLength && digits.length <= 14 && new Set(digits).size > 1) {
    return digits;
  }
  return null;
}
function parseNumber(raw) {
  let s = raw;
  if (s.includes(",") && s.includes(".")) {
    s = s.replace(/\./g, "").replace(/,/g, ".");
  } else if (s.split(".").length === 2 && s.split(".")[1].length !== 3) {
    s = s.replace(/,/g, ".");
  } else {
    s = s.replace(/\./g, "").replace(/,/g, ".");
  }
  return Number(s);
}
const COUNT_RE = /(?:x\s*)?(\d+)\s*(?:unidades|unidad|unds|und|unid|uds|un)\b/i;
const EGG_RE = /(\d+)\s*huevos?\b/i;
const LOOSE_COUNT_RE = /\bx\s*(\d+)\b(?!\s*(?:\.\d{3})?\s*(?:mililitros|ml|litros|litro|lts|lt|l|kg|kilogramos|kilos|gramos|gramo|grs|gr|g)\b)/i;
const MULTIPACK_PREFIX_RE = /(?<![\d.,])(\d{1,2})\s*[x×]\s*$/i;
const GRAM_FACTOR = {
  g: 1,
  gr: 1,
  grs: 1,
  gramo: 1,
  gramos: 1,
  kg: 1e3,
  kilos: 1e3,
  kilogramos: 1e3
};
const ML_FACTOR = {
  ml: 1,
  mililitros: 1,
  l: 1e3,
  lt: 1e3,
  lts: 1e3,
  litro: 1e3,
  litros: 1e3
};
function countInName(name) {
  for (const pattern of [COUNT_RE, EGG_RE, LOOSE_COUNT_RE]) {
    const m = pattern.exec(name);
    if (m) {
      const count = parseInt(m[1], 10);
      if (count >= 1 && count <= 500) return count;
    }
  }
  return null;
}
function saleMeasure(name, price) {
  const folded = stripAccents(name);
  const count = countInName(folded);
  if (count) {
    return {
      amount: Number((price / count).toFixed(4)),
      quantity: count,
      per: "unidad",
      basis: "unidad"
    };
  }
  const match = SIZE_RE.exec(folded);
  if (!match) return null;
  const quantity = parseNumber(match[1]);
  const unit = match[2].toLowerCase();
  let total;
  let per;
  if (unit in GRAM_FACTOR) {
    total = quantity * GRAM_FACTOR[unit];
    per = "gramo";
  } else if (unit in ML_FACTOR) {
    total = quantity * ML_FACTOR[unit];
    per = "mililitro";
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
    basis: per
  };
}
function unitPrice(name, price) {
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
function cop(amount) {
  const formatted = Math.round(amount).toLocaleString("es-CO");
  return `$ ${formatted.replace(/,/g, ".")}`;
}
function copExact(amount) {
  if (amount >= 100) {
    return cop(amount);
  }
  const parts = amount.toFixed(2).split(".");
  return `$ ${parts[0]},${parts[1]}`;
}

export { relevance as a, copExact as b, cop as c, categoryMatches as d, saleMeasure as e, cleanEan as f, parseCop as p, requiredMatchRatio as r, stripAccents as s, unitPrice as u };
