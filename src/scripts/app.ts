import {
  loginWithGoogle,
  logoutUser,
  subscribeAuth,
  getUserLists,
  saveUserList,
  deleteUserList,
  getListById,
  joinSharedList,
  subscribeList,
  toggleItemBought,
  type SavedList,
  type ListItemData,
} from '../lib/firebaseAuth';
import { initShareModal } from './shareModal';
import {
  CATEGORIES,
  searchCatalog,
  searchCategories,
  getItemsByCategory,
  type CatalogItem,
} from '../lib/catalog';
import {
  toSlug,
  findCategoryMatch,
  findProductMatch,
  getProductUrl,
  getCategoryUrl,
} from '../lib/slugs';
import { escapeHtml } from '../lib/normalize';
import { findBestCategoryHelp } from '../lib/collectionTaxonomy';

const form = document.querySelector<HTMLFormElement>('#search-form')!;
const queryInput = document.querySelector<HTMLInputElement>('#query')!;
const queryAutocomplete = document.querySelector<HTMLElement>('#query-autocomplete')!;
const listAutocomplete = document.querySelector<HTMLElement>('#list-autocomplete')!;
const categoriesContainer = document.querySelector<HTMLElement>('#categories-container')!;
const categoryChipsScroll = document.querySelector<HTMLElement>('#category-chips-scroll')!;
const categoryQuickItems = document.querySelector<HTMLElement>('#category-quick-items')!;
const citySelect = document.querySelector<HTMLSelectElement>('#city')!;
const cityRow = document.querySelector<HTMLElement>('#city-row')!;
const unitFilters = document.querySelector<HTMLElement>('#unit-filters')!;
const unitBasis = document.querySelector<HTMLSelectElement>('#unit-basis')!;
const unitMin = document.querySelector<HTMLInputElement>('#unit-min')!;
const unitMinLabel = document.querySelector<HTMLElement>('#unit-min-label')!;
const unitCategory = document.querySelector<HTMLSelectElement>('#unit-category')!;

const UNIT_MIN_LABEL: Record<string, string> = {
  mililitros: 'Mínimo en mililitros',
  gramos: 'Mínimo en gramos',
  unidades: 'Mínimo en unidades',
};

function syncUnitMin() {
  const basis = unitBasis.value;
  const open = basis !== 'todas';
  unitMin.disabled = !open;
  unitMinLabel.textContent = open ? UNIT_MIN_LABEL[basis] || 'Cantidad mínima' : 'Cantidad mínima';
  unitMin.placeholder = open ? 'Ej. 900' : 'Elige una unidad';
}
const submit = document.querySelector<HTMLButtonElement>('#submit')!;
const status = document.querySelector<HTMLElement>('#status')!;
// Cuadrícula de resultados: 4 columnas × 5 filas por página.
const OFFERS_PER_PAGE = 20;
const results = document.querySelector<HTMLElement>('#results')!;
const examples = document.querySelector<HTMLElement>('#examples')!;
const lead = document.querySelector<HTMLElement>('#lead')!;
const footnote = document.querySelector<HTMLElement>('#footnote')!;
const singleSearch = document.querySelector<HTMLElement>('#single-search')!;
const listEditor = document.querySelector<HTMLElement>('#list-editor')!;
const listRows = document.querySelector<HTMLElement>('#list-rows')!;
const addRow = document.querySelector<HTMLButtonElement>('#add-row')!;
const listSubmit = document.querySelector<HTMLButtonElement>('#list-submit')!;

const accountOut = document.querySelector<HTMLElement>('#account-out')!;
const accountIn = document.querySelector<HTMLElement>('#account-in')!;
const accountGoogleBtn = document.querySelector<HTMLButtonElement>('#account-google-btn')!;
const accountHello = document.querySelector<HTMLElement>('#account-hello')!;
const accountStatus = document.querySelector<HTMLElement>('#account-status')!;
const accountLogout = document.querySelector<HTMLButtonElement>('#account-logout')!;
const savedSelect = document.querySelector<HTMLSelectElement>('#saved-select')!;
const savedName = document.querySelector<HTMLInputElement>('#saved-name')!;
const savedSave = document.querySelector<HTMLButtonElement>('#saved-save')!;
const savedShare = document.querySelector<HTMLButtonElement>('#saved-share')!;
const savedDelete = document.querySelector<HTMLButtonElement>('#saved-delete')!;
const listCollabBanner = document.querySelector<HTMLElement>('#list-collab-banner');

const headerLoginBtn = document.querySelector<HTMLButtonElement>('#header-login-btn')!;
const headerUserInfo = document.querySelector<HTMLElement>('#header-user-info')!;
const headerUserName = document.querySelector<HTMLAnchorElement>('#header-user-name')!;
const headerLogoutBtn = document.querySelector<HTMLButtonElement>('#header-logout-btn')!;
const headerCartBtn = document.querySelector<HTMLButtonElement>('#header-cart-btn');
const headerCartCount = document.querySelector<HTMLElement>('#header-cart-count');
const openShareModal = initShareModal();

let activeListId: string | null = null;
let unsubscribeActiveList: (() => void) | null = null;
const boughtIndices = new Set<number>();
let updateSuperStatsGlobal: () => void = () => {};

function updateCollabBanner(list: SavedList | null | undefined) {
  if (!listCollabBanner) return;
  if (!list) {
    listCollabBanner.hidden = true;
    listCollabBanner.replaceChildren();
    return;
  }

  const otherCollabs: string[] = [];
  if (list.collaborators && list.collaborators.length > 0) {
    list.collaborators.forEach((c) => {
      if (c.uid !== currentUserId && (c.name || c.email)) {
        otherCollabs.push(c.name || (c.email ? c.email.split('@')[0] : 'Colaborador'));
      }
    });
  }
  if (list.sharedWithEmails && list.sharedWithEmails.length > 0) {
    list.sharedWithEmails.forEach((email) => {
      const short = email.split('@')[0];
      if (email !== currentUserObj?.email && !otherCollabs.includes(short)) {
        otherCollabs.push(short);
      }
    });
  }

  const uniqueCollabs = [...new Set(otherCollabs)];

  if (list.isOwner ?? (list.ownerId === currentUserId)) {
    if (uniqueCollabs.length > 0) {
      const safeCollabs = uniqueCollabs.map(escapeHtml).join(', ');
      listCollabBanner.hidden = false;
      listCollabBanner.innerHTML = `<span class="collab-badge">👥 Compartida con: <strong>${safeCollabs}</strong></span>`;
    } else {
      listCollabBanner.hidden = false;
      listCollabBanner.innerHTML = `<span style="font-size: 0.72rem; color: var(--muted);">🔒 Lista privada (solo tú). Usa 📲 Compartir para colaborar.</span>`;
    }
  } else {
    const ownerDisplayName = list.ownerName || (list.ownerEmail ? list.ownerEmail.split('@')[0] : 'tu pareja');
    const others = uniqueCollabs.filter((n) => n !== ownerDisplayName);
    const safeOthers = others.length > 0 ? ` (con ${others.map(escapeHtml).join(', ')})` : '';
    listCollabBanner.hidden = false;
    listCollabBanner.innerHTML = `<span class="collab-badge">👥 Lista compartida de <strong>${escapeHtml(ownerDisplayName)}</strong>${safeOthers}</span>`;
  }
}

function setupRealtimeList(listId: string) {
  if (unsubscribeActiveList) {
    unsubscribeActiveList();
    unsubscribeActiveList = null;
  }
  activeListId = listId;
  if (!listId) return;

  unsubscribeActiveList = subscribeList(listId, (updatedList) => {
    if (!updatedList || !updatedList.items) return;
    updateCollabBanner(updatedList);

    // Sincronizar nombre y ciudad si cambiaron en Firestore
    if (updatedList.nombre && savedName && savedName.value !== updatedList.nombre) {
      savedName.value = updatedList.nombre;
    }
    if (updatedList.ciudad && citySelect && citySelect.value !== updatedList.ciudad) {
      applyCity(updatedList.ciudad);
    }

    // Comprobar si los productos de la lista cambiaron en la nube
    const currentItems = readList();
    const curSig = JSON.stringify(currentItems.map((i) => `${i.nombre}|${i.marca}|${i.formato}|${i.cantidad}`));
    const updSig = JSON.stringify(updatedList.items.map((i) => `${i.nombre}|${i.marca}|${i.formato}|${i.cantidad}`));

    if (curSig !== updSig) {
      const activeEl = document.activeElement;
      const isTypingInList = activeEl && (listRows.contains(activeEl) || activeEl === savedName);

      if (!isTypingInList) {
        setRows(updatedList.items);
        saveListLocal(false);
        updateAddRow();
        updateHeaderCartCount();
        showLiveSyncIndicator(`🟢 Lista «${updatedList.nombre}» sincronizada en tiempo real`);
        setTimeout(() => {
          if (accountStatus.textContent?.includes('sincronizada en tiempo real')) {
            accountStatus.textContent = '';
          }
        }, 4000);
      }
    }

    // Sincronizar estado de checkboxes en modo compra / veredicto
    updatedList.items.forEach((item, idx) => {
      const cb = document.querySelector<HTMLInputElement>(`.super-checkbox[data-index="${idx}"]`);
      if (cb) {
        const isBought = !!item.comprado;
        if (cb.checked !== isBought) {
          cb.checked = isBought;
          cb.closest('.offer')?.classList.toggle('is-bought', isBought);
          if (isBought) boughtIndices.add(idx);
          else boughtIndices.delete(idx);
          updateSuperStatsGlobal();
        }
      }
    });
  });
}

const CITY_KEY = 'comparador-ciudad';
const LIST_KEY = 'comparador-lista';
const LIST_MAX = 15;
const FORMATS = [
  ['gramos', 'Gramos'],
  ['mililitros', 'Mililitros'],
  ['unidades', 'Unidades'],
] as const;

const DEFAULT_LIST = [
  { nombre: 'Arroz', marca: 'TODAS', formato: 'gramos' as const, cantidad: 1000 },
  { nombre: 'Aceite', marca: 'TODAS', formato: 'mililitros' as const, cantidad: 1000 },
  { nombre: 'Huevos', marca: 'TODAS', formato: 'unidades' as const, cantidad: 30 },
];

const MODES = {
  local: {
    endpoint: '/api/buscar',
    status: 'Buscando en Éxito, Jumbo, Carulla, Olímpica, D1, Alkosto, Ktronix, Falabella y Easy para {ciudad}…',
    placeholder: 'Ej. leche entera colanta, arroz roa, televisor 55',
    lead: 'Compara el precio publicado en tiendas de Colombia y te dice en cuál está el más bajo.',
    footnote: 'Precios de {ciudad} cuando la tienda los publica para esa zona. Pueden cambiar según la sede y las promociones. Confirma el valor antes de pagar.',
    examples: [
      ['leche entera colanta', 'Leche Colanta'],
      ['arroz roa', 'Arroz Roa'],
      ['aceite premier', 'Aceite Premier'],
      ['televisor 55', 'Televisor 55"'],
    ],
  },
  unit: {
    endpoint: '/api/unidad',
    status: 'Buscando en Éxito, Jumbo, Carulla, Olímpica, D1, Alkosto, Ktronix, Falabella y Easy para {ciudad}…',
    placeholder: 'Ej. huevos, leche, arroz, aceite',
    lead: 'Elige la unidad, un mínimo y la categoría. Con 900 mililitros entran esa presentación y las más grandes.',
    footnote: 'La unidad sale de la cantidad escrita en el nombre. El gramo y el mililitro salen del peso o del volumen. La ciudad es {ciudad}. Confirma el tamaño en la tienda antes de pagar.',
    examples: [
      ['huevos', 'Huevos'],
      ['leche', 'Leche'],
      ['arroz', 'Arroz'],
      ['aceite', 'Aceite'],
    ],
  },
  list: {
    endpoint: '/api/lista',
    status: 'Buscando {n} productos en Éxito, Jumbo, Carulla, Olímpica, D1, Alkosto, Ktronix, Falabella y Easy para {ciudad}…',
    placeholder: '',
    lead: 'Arma tu lista con nombre, marca, formato y cantidad. Te dice dónde sale más barato cada producto y cuánto cuesta toda la lista.',
    footnote: 'Solo cuenta empaques del tamaño exacto que pides: 1000 gramos trae empaques de 1 kilo, no de 500 gramos ni de 2 kilos. Cada producto suma un solo empaque. Si la tarjeta de la tienda es más barata, usa ese precio. Ciudad: {ciudad}.',
    examples: [] as [string, string][],
  },
  intl: {
    endpoint: '/api/internacional',
    status: 'Buscando en Amazon, AliExpress y eBay…',
    placeholder: 'Ej. audífonos bluetooth, cargador usb c, mouse inalámbrico',
    lead: 'Compara Amazon, AliExpress y eBay, y suma el envío a Colombia cuando la tienda lo publica.',
    footnote: 'Los precios internacionales están en pesos cuando la tienda los muestra para Colombia. El flete es el publicado en el listado; si no aparece, el total todavía no incluye el transporte. Revisa que el producto sea el que buscas antes de comprar.',
    examples: [
      ['audífonos bluetooth', 'Audífonos'],
      ['cargador usb c', 'Cargador USB-C'],
      ['mouse inalámbrico', 'Mouse'],
    ],
  },
};

type ModeKey = keyof typeof MODES;
let mode: ModeKey = 'local';
let currentUserId: string | null = null;
let currentUserObj: any = null;
let savedLists: SavedList[] = [];

const STORE_COLOR: Record<string, string> = {
  exito: '#f2c200',
  carulla: '#1f8f4e',
  jumbo: '#00a34a',
  olimpica: '#d21f3c',
  alkosto: '#e23b2f',
  ktronix: '#111111',
  falabella: '#6fbf4a',
  easy: '#f18a00',
  d1: '#e10600',
};

function money(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

function moneyExact(value: number): string {
  const digits = value >= 100 ? 0 : 2;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string | null,
  text?: string | null
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function safeImage(url?: string): HTMLImageElement | null {
  if (!url || !String(url).startsWith('https://')) return null;
  const image = document.createElement('img');
  image.src = url;
  image.alt = '';
  image.referrerPolicy = 'no-referrer';
  return image;
}

function paymentLine(offer: any): HTMLElement | null {
  if (!offer.payment_label || offer.payment_price == null) return null;
  const samePrice = Math.abs(offer.payment_price - offer.price) < 1;
  const text = samePrice
    ? `${offer.payment_label}: mismo precio`
    : `${offer.payment_label}: ${money(offer.payment_price)}`;
  return el('span', 'card-line', text);
}

function storeMark(id: string, name: string): HTMLElement {
  const wrap = el('span', 'store');
  const dot = document.createElement('i');
  dot.style.setProperty('--store', STORE_COLOR[id] || '#0e6a45');
  wrap.append(dot, document.createTextNode(name));
  return wrap;
}

function cityName(): string {
  const option = citySelect.selectedOptions[0];
  return option ? option.textContent || 'Bogotá' : 'Bogotá';
}

function cityNote(report: any): HTMLElement {
  const name = report.city && report.city.name ? report.city.name : cityName();
  return el('p', 'city-note', `Precios para ${name}`);
}

function renderStores(stores: any[]) {
  const panel = el('section', 'panel');
  panel.append(el('h3', null, 'Tiendas consultadas'));
  const wrap = el('div', 'stores');
  for (const store of stores) {
    let label = store.name;
    let kind = 'ok';
    if (store.error) {
      label = `${store.name}: ${store.error}`;
      kind = 'bad';
    } else if (!store.count) {
      label = `${store.name}: sin resultados`;
      kind = '';
    } else if (store.listTotal) {
      label = `${store.name}: respondió en ${store.count} de ${store.listTotal}`;
    } else {
      label = `${store.name}: ${store.count} producto${store.count === 1 ? '' : 's'}`;
    }
    wrap.append(el('span', `pill ${kind}`, label));
  }
  panel.append(wrap);
  results.append(panel);
}

function render(report: any) {
  results.replaceChildren();
  results.hidden = false;
  results.append(cityNote(report));

  if (report.category_suggestion) {
    const sug = report.category_suggestion;
    const banner = el('aside', 'category-auto-help-banner');
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', `Sugerencia de categoría: ${sug.name}`);
    banner.innerHTML = `
      <div class="category-auto-help-main">
        <span class="category-auto-help-icon">${sug.icono || '🏷️'}</span>
        <div class="category-auto-help-text">
          <div class="category-auto-help-tag">📂 Sección sugerida</div>
          <strong class="category-auto-help-title">Categoría oficial de ${escapeHtml(sug.name)}</strong>
          <p class="category-auto-help-desc">${escapeHtml(sug.description || `Explora toda la sección de ${sug.name} organizada por tipo y tienda en Colombia.`)}</p>
        </div>
      </div>
      <a href="${sug.url}" class="category-auto-help-link">
        Ver categoría ${escapeHtml(sug.name)} →
      </a>
    `;
    results.append(banner);
  }

  if (!report.verdict) {
    results.append(el('section', 'panel', 'No encontré precios parecidos a esa búsqueda.'));
    renderStores(report.stores);
    return;
  }

  const verdict = report.verdict;
  const card = el('article', 'verdict');
  const photo = safeImage(verdict.image);
  if (photo) card.append(photo);
  else card.append(el('div'));

  const copy = el('div');
  copy.append(el('p', 'kicker', 'Mejor precio de compra'));
  copy.append(el('h2', null, verdict.headline));
  copy.append(el('p', 'price', money(verdict.price)));
  copy.append(el('p', 'detail', `${verdict.name}. ${verdict.detail}`));
  if (verdict.payment_note) copy.append(el('p', 'card-line', verdict.payment_note));
  const buy = el('a', 'buy', `Ver en ${verdict.store_name}`);
  buy.href = verdict.url;
  buy.target = '_blank';
  buy.rel = 'noreferrer';
  copy.append(buy);

  const addVerdictBtn = el('button', 'btn-add-list-verdict', '➕ Añadir a lista');
  addVerdictBtn.type = 'button';
  addVerdictBtn.title = 'Añadir este producto a una lista de compras';
  addVerdictBtn.addEventListener('click', () => {
    openAddToListModal({
      name: verdict.name || verdict.headline,
      brand: verdict.brand,
      unit_name: verdict.unit_name,
      unit_quantity: verdict.unit_quantity,
      price: verdict.price,
      store_name: verdict.store_name,
      image: verdict.image,
    });
  });
  copy.append(addVerdictBtn);

  card.append(copy);
  results.append(card);

  if (report.relaxed) {
    results.append(el('p', 'note', 'Amplié la búsqueda porque pocos productos coincidían con todas las palabras.'));
  }

  if (report.same_product) {
    const panel = el('section', 'panel');
    panel.append(el('h3', null, 'Mismo producto en varias tiendas'));
    panel.append(el('p', 'meta', report.same_product.name));
    const list = el('div', 'compare');
    for (const offer of report.same_product.offers) {
      const row = el('div', 'compare-row');
      const left = el('div');
      left.append(storeMark(offer.store_id, offer.store_name));
      if (offer.difference === 0) {
        left.append(el('span', 'winner-tag', 'Mejor precio'));
      }
      const right = el('div', 'money');
      right.append(el('strong', null, money(offer.price)));
      const extra = offer.difference === 0 ? 'Mejor precio' : `+ ${money(offer.difference)}`;
      const unit = offer.unit_price ? ` · ${money(offer.unit_price)} / ${offer.unit_label}` : '';
      right.append(el('span', null, extra + unit));
      const cardEl = paymentLine(offer);
      if (cardEl) right.append(cardEl);
      const link = el('a', null, 'Abrir');
      link.href = offer.url;
      link.target = '_blank';
      link.rel = 'noreferrer';
      right.append(link);

      const addBtn = el('button', 'btn-add-list', '➕ Lista');
      addBtn.type = 'button';
      addBtn.title = 'Añadir a lista';
      addBtn.addEventListener('click', () => {
        openAddToListModal({
          name: offer.name || report.same_product.name,
          brand: offer.brand,
          unit_name: offer.unit_name,
          unit_quantity: offer.unit_quantity,
          price: offer.price,
          store_name: offer.store_name,
          image: offer.image,
        });
      });
      right.append(addBtn);

      row.append(left, right);
      list.append(row);
    }
    panel.append(list);
    results.append(panel);
  }

  const others = el('section', 'panel');
  others.append(el('h3', null, 'Ofertas parecidas'));
  const list = el('div', 'offers offers-grid');
  const pager = el('nav', 'offers-pager');
  others.append(list, pager);

  const drawPage = (page: number) => {
    const start = (page - 1) * OFFERS_PER_PAGE;
    list.replaceChildren();
    for (const offer of report.offers.slice(start, start + OFFERS_PER_PAGE)) {
      const row = el('article', 'offer');
      const photoImg = safeImage(offer.image);
      row.append(photoImg || el('div'));
      const info = el('div');
      info.append(el('h4', null, offer.name));
      const bits = [offer.store_name];
      if (offer.brand) bits.push(offer.brand);
      if (offer.unit_price) bits.push(`${money(offer.unit_price)} / ${offer.unit_label}`);
      info.append(el('p', 'meta', bits.join(' · ')));
      const link = el('a', null, 'Ver producto');
      link.href = offer.url;
      link.target = '_blank';
      link.rel = 'noreferrer';
      info.append(link);

      const addBtn = el('button', 'btn-add-list', '➕ Añadir a lista');
      addBtn.type = 'button';
      addBtn.title = 'Añadir a lista de compras';
      addBtn.addEventListener('click', () => {
        openAddToListModal({
          name: offer.name,
          brand: offer.brand,
          unit_name: offer.unit_name,
          unit_quantity: offer.unit_quantity,
          price: offer.price,
          store_name: offer.store_name,
          image: offer.image,
        });
      });
      info.append(addBtn);

      const price = el('div', 'money');
      price.append(el('strong', null, money(offer.price)));
      if (offer.list_price) price.append(el('span', 'was', money(offer.list_price)));
      const cardEl = paymentLine(offer);
      if (cardEl) price.append(cardEl);
      row.append(info, price);
      list.append(row);
    }
    drawPager(page);
  };

  const drawPager = (page: number) => {
    const pages = Math.ceil(report.offers.length / OFFERS_PER_PAGE);
    pager.replaceChildren();
    pager.hidden = pages <= 1;
    if (pages <= 1) return;
    const goTo = (target: number) => {
      drawPage(target);
      others.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const prev = el('button', 'btn-page', '← Anterior');
    prev.type = 'button';
    prev.disabled = page === 1;
    prev.addEventListener('click', () => goTo(page - 1));
    const next = el('button', 'btn-page', 'Siguiente →');
    next.type = 'button';
    next.disabled = page === pages;
    next.addEventListener('click', () => goTo(page + 1));
    const info = el('span', 'pager-info', `Página ${page} de ${pages} · ${report.offers.length} productos`);
    pager.append(prev, info, next);
  };

  drawPage(1);
  results.append(others);
  renderStores(report.stores);
}

function renderUnit(report: any) {
  results.replaceChildren();
  results.hidden = false;
  results.append(cityNote(report));

  if (report.category_suggestion) {
    const sug = report.category_suggestion;
    const banner = el('aside', 'category-auto-help-banner');
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', `Sugerencia de categoría: ${sug.name}`);
    banner.innerHTML = `
      <div class="category-auto-help-main">
        <span class="category-auto-help-icon">${sug.icono || '🏷️'}</span>
        <div class="category-auto-help-text">
          <div class="category-auto-help-tag">📂 Sección sugerida</div>
          <strong class="category-auto-help-title">Categoría oficial de ${escapeHtml(sug.name)}</strong>
          <p class="category-auto-help-desc">${escapeHtml(sug.description || `Explora toda la sección de ${sug.name} organizada por tipo y tienda en Colombia.`)}</p>
        </div>
      </div>
      <a href="${sug.url}" class="category-auto-help-link">
        Ver categoría ${escapeHtml(sug.name)} →
      </a>
    `;
    results.append(banner);
  }

  if (!report.verdict) {
    results.append(el('section', 'panel', report.empty_detail || 'No encontré productos con cantidad, peso o volumen para comparar.'));
    renderStores(report.stores);
    return;
  }
  if (report.filter_label) {
    results.append(el('p', 'note', `Filtro: ${report.filter_label}.`));
  }
  const verdict = report.verdict;
  const card = el('article', 'verdict');
  card.append(safeImage(verdict.image) || el('div'));
  const copy = el('div');
  copy.append(el('p', 'kicker', verdict.kicker));
  copy.append(el('h2', null, verdict.headline));
  copy.append(el('p', 'price', moneyExact(verdict.unit_price)));
  copy.append(el('p', 'detail', verdict.detail));
  if (verdict.payment_note) copy.append(el('p', 'card-line', verdict.payment_note));
  const buy = el('a', 'buy', `Ver en ${verdict.store_name}`);
  buy.href = verdict.url;
  buy.target = '_blank';
  buy.rel = 'noreferrer';
  copy.append(buy);

  const addVerdictBtn = el('button', 'btn-add-list-verdict', '➕ Añadir a lista');
  addVerdictBtn.type = 'button';
  addVerdictBtn.title = 'Añadir este producto a una lista de compras';
  addVerdictBtn.addEventListener('click', () => {
    openAddToListModal({
      name: verdict.name || verdict.headline,
      brand: verdict.brand,
      unit_name: verdict.unit_name,
      unit_quantity: verdict.unit_quantity,
      price: verdict.price || verdict.unit_price,
      store_name: verdict.store_name,
      image: verdict.image,
    });
  });
  copy.append(addVerdictBtn);

  card.append(copy);
  results.append(card);

  if (report.relaxed) {
    results.append(el('p', 'note', 'Amplié la búsqueda porque pocos productos coincidían con todas las palabras.'));
  }
  if (report.unmeasured) {
    const count = report.unmeasured;
    results.append(
      el('p', 'note', `${count} producto${count === 1 ? '' : 's'} quedaron fuera porque el nombre no dice cuántas unidades, gramos o mililitros trae.`)
    );
  }

  const others = el('section', 'panel');
  others.append(el('h3', null, `De menor a mayor por ${verdict.unit_label}`));
  const list = el('div', 'offers');
  const ranked = report.offers.slice().sort((a: any, b: any) => {
    const byUnit = a.unit_price - b.unit_price;
    if (Math.abs(byUnit) > 0.0001) return byUnit;
    const packA = a.from_card && a.payment_price != null ? a.payment_price : a.price;
    const packB = b.from_card && b.payment_price != null ? b.payment_price : b.price;
    return packA - packB;
  });
  for (const offer of ranked) {
    const row = el('article', 'offer');
    row.append(safeImage(offer.image) || el('div'));
    const info = el('div');
    info.append(el('h4', null, offer.name));
    info.append(el('p', 'meta', `${offer.store_name} · ${offer.unit_quantity_label}`));
    const link = el('a', null, 'Ver producto');
    link.href = offer.url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    info.append(link);

    const addBtn = el('button', 'btn-add-list', '➕ Añadir a lista');
    addBtn.type = 'button';
    addBtn.title = 'Añadir a lista de compras';
    addBtn.addEventListener('click', () => {
      openAddToListModal({
        name: offer.name,
        brand: offer.brand,
        unit_name: offer.unit_name,
        unit_quantity: offer.unit_quantity,
        price: offer.price,
        store_name: offer.store_name,
        image: offer.image,
      });
    });
    info.append(addBtn);
    const price = el('div', 'money');
    price.append(el('strong', null, moneyExact(offer.unit_price)));
    price.append(el('span', null, `por ${offer.unit_label}`));
    if (offer.from_card && offer.payment_price != null) {
      price.append(el('span', 'card-line', `${offer.payment_label}: empaque ${money(offer.payment_price)}`));
    } else {
      price.append(el('span', null, `Empaque ${money(offer.price)}`));
    }
    row.append(info, price);
    list.append(row);
  }
  others.append(list);
  results.append(others);
  renderStores(report.stores);
}

function shipText(offer: any): string {
  if (offer.ships_to_colombia === false) return 'No envía a Colombia';
  if (offer.shipping_cost === 0) return 'Envío gratis a Colombia';
  if (offer.shipping_cost != null) return `Envío ${money(offer.shipping_cost)}`;
  return offer.shipping_note || 'Flete por confirmar';
}

function renderInternational(report: any) {
  results.replaceChildren();
  results.hidden = false;
  if (!report.verdict) {
    results.append(el('section', 'panel', 'No encontré productos internacionales parecidos a esa búsqueda.'));
    renderStores(report.stores);
    return;
  }
  const verdict = report.verdict;
  const card = el('article', 'verdict');
  const photo = safeImage(verdict.image);
  card.append(photo || el('div'));
  const copy = el('div');
  copy.append(el('p', 'kicker', verdict.kicker));
  copy.append(el('h2', null, verdict.headline));
  copy.append(el('p', 'price', money(verdict.total != null ? verdict.total : verdict.price)));
  copy.append(el('p', 'detail', verdict.detail));
  const buy = el('a', 'buy', `Ver en ${verdict.store_name}`);
  buy.href = verdict.url;
  buy.target = '_blank';
  buy.rel = 'noreferrer';
  copy.append(buy);

  const addVerdictBtn = el('button', 'btn-add-list-verdict', '➕ Añadir a lista');
  addVerdictBtn.type = 'button';
  addVerdictBtn.title = 'Añadir este producto a una lista de compras';
  addVerdictBtn.addEventListener('click', () => {
    openAddToListModal({
      name: verdict.headline || verdict.name,
      price: verdict.total != null ? verdict.total : verdict.price,
      store_name: verdict.store_name,
      image: verdict.image,
    });
  });
  copy.append(addVerdictBtn);

  card.append(copy);
  results.append(card);

  if (report.relaxed) {
    results.append(el('p', 'note', 'Amplié la búsqueda porque pocos productos coincidían con todas las palabras.'));
  }

  const others = el('section', 'panel');
  others.append(el('h3', null, 'Productos parecidos'));
  const list = el('div', 'offers');
  for (const offer of report.offers) {
    const row = el('article', 'offer');
    row.append(safeImage(offer.image) || el('div'));
    const info = el('div');
    info.append(el('h4', null, offer.name));
    info.append(el('p', 'meta', `${offer.store_name} · ${shipText(offer)}`));
    const link = el('a', null, 'Ver producto');
    link.href = offer.url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    info.append(link);

    const addBtn = el('button', 'btn-add-list', '➕ Añadir a lista');
    addBtn.type = 'button';
    addBtn.title = 'Añadir a lista de compras';
    addBtn.addEventListener('click', () => {
      openAddToListModal({
        name: offer.name,
        price: offer.total != null ? offer.total : offer.price,
        store_name: offer.store_name,
        image: offer.image,
      });
    });
    info.append(addBtn);

    const price = el('div', 'money');
    price.append(el('strong', null, money(offer.total != null ? offer.total : offer.price)));
    price.append(el('span', null, offer.total != null ? `Producto ${money(offer.price)}` : 'Sin flete'));
    row.append(info, price);
    list.append(row);
  }
  others.append(list);
  results.append(others);
  renderStores(report.stores);
}

let lastSearchedItems: ListItemData[] = [];

function renderList(report: any) {
  results.replaceChildren();
  results.hidden = false;
  results.append(cityNote(report));

  const card = el('article', 'verdict list-verdict');
  const copy = el('div');
  copy.append(el('p', 'kicker', 'Lista de compras'));
  copy.append(el('h2', null, report.found ? 'Comprando cada producto donde sale más barato' : 'No encontré los productos de la lista'));
  if (report.found) copy.append(el('p', 'price', money(report.total)));
  let summary = `Encontré ${report.found} de ${report.count} productos con el formato que pediste.`;
  if (report.missing.length) summary += ` Sin resultado: ${report.missing.join(', ')}.`;
  copy.append(el('p', 'detail', summary));
  const single = report.best_single_store;
  if (single && report.found === report.count) {
    const diff = single.total - report.total;
    const text = diff > 0.5
      ? `Toda la lista en ${single.store_name}: ${money(single.total)} (${money(diff)} más, pero en una sola tienda).`
      : `Toda la lista en ${single.store_name}: ${money(single.total)}.`;
    copy.append(el('p', 'card-line', text));
  }

  // Botón para exportar compra organizada a WhatsApp
  if (report.found) {
    const exportBtn = el('button', 'btn-whatsapp-export');
    exportBtn.type = 'button';
    exportBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.27-2.42 5.82a8.19 8.19 0 0 1-5.82 2.42c-1.45 0-2.88-.39-4.13-1.12l-.3-.18-3.08.81.82-3-.19-.31a8.18 8.18 0 0 1-1.25-4.44c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.3 3.8.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29z"/>
      </svg>
      <span>📲 Enviar compra a WhatsApp</span>
    `;
    exportBtn.addEventListener('click', () => {
      const curId = activeListId || savedSelect.value || '';
      const shareUrl = curId ? `${window.location.origin}/?listaId=${curId}` : `${window.location.origin}/?tab=list`;

      const storeGroups = new Map<string, { total: number; items: string[] }>();
      for (const it of report.items) {
        if (!it.winner) continue;
        const sName = it.winner.store_name;
        if (!storeGroups.has(sName)) {
          storeGroups.set(sName, { total: 0, items: [] });
        }
        const g = storeGroups.get(sName)!;
        g.total += it.winner.total || 0;
        g.items.push(`◻ ${it.winner.name} (${money(it.winner.total)})`);
      }

      let text = `🛒 *Mercado Óptimo - Mercado Lista*\n`;
      text += `📍 Total estimado: ${money(report.total)}\n\n`;

      for (const [sName, g] of storeGroups.entries()) {
        text += `🏪 *Comprar en ${sName}* (${money(g.total)}):\n`;
        text += g.items.join('\n') + '\n\n';
      }

      if (report.missing && report.missing.length) {
        text += `⚠️ *No encontrados:* ${report.missing.join(', ')}\n\n`;
      }

      text += `🔗 *Tacha mientras compras en tiempo real:*\n${shareUrl}`;

      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    });
    copy.append(exportBtn);
  }

  card.append(copy);
  results.append(card);

  const panel = el('section', 'panel');

  // Modo Supermercado: Panel de Progreso y Presupuesto
  const superPanel = el('div', 'super-panel');
  const superHeader = el('div', 'super-panel-header');
  const badge = el('span', 'super-badge');
  badge.innerHTML = `<span>🛒</span><span>Modo Supermercado · Tacha mientras compras</span>`;
  const actionsWrap = el('div', 'super-actions');
  const resetBtn = el('button', 'btn-reset-checklist', 'Desmarcar todo');
  resetBtn.type = 'button';
  actionsWrap.append(resetBtn);
  superHeader.append(badge, actionsWrap);

  const progressBar = el('div', 'super-progress-bar');
  const progressFill = el('div', 'super-progress-fill');
  progressBar.append(progressFill);

  const statsWrap = el('div', 'super-stats');
  const countStat = el('span', null, `0 de ${report.items.length} en el carrito (0%)`);
  const moneyStat = el('span', 'super-stat-highlight', `$0 en carrito`);
  statsWrap.append(countStat, moneyStat);

  function updateSuperStats() {
    const totalItems = report.items.length;
    const boughtCount = boughtIndices.size;
    let spentTotal = 0;
    for (const idx of boughtIndices) {
      const it = report.items[idx];
      if (it && it.winner && it.winner.total) {
        spentTotal += it.winner.total;
      }
    }
    const pct = totalItems > 0 ? Math.round((boughtCount / totalItems) * 100) : 0;
    progressFill.style.width = `${pct}%`;
    countStat.textContent = `${boughtCount} de ${totalItems} en el carrito (${pct}%)`;
    moneyStat.textContent = `${money(spentTotal)} en carrito`;
  }

  updateSuperStatsGlobal = updateSuperStats;

  resetBtn.addEventListener('click', () => {
    boughtIndices.clear();
    panel.querySelectorAll<HTMLInputElement>('.super-checkbox').forEach((cb, idx) => {
      cb.checked = false;
      cb.closest('.offer')?.classList.remove('is-bought');
      const curId = activeListId || savedSelect.value;
      if (curId) {
        toggleItemBought(curId, idx, false).catch(() => {});
      }
    });
    updateSuperStats();
  });

  superPanel.append(superHeader, progressBar, statsWrap);
  panel.append(superPanel);

  panel.append(el('h3', null, 'Producto por producto'));
  const list = el('div', 'offers');
  report.items.forEach((item: any, index: number) => {
    const row = el('article', 'offer list-item');
    const isInitiallyBought = boughtIndices.has(index);
    if (isInitiallyBought) {
      row.classList.add('is-bought');
    }

    // Checkbox táctil para marcar en el pasillo del súper
    const checkWrap = el('label', 'super-check-label');
    const checkInput = document.createElement('input');
    checkInput.type = 'checkbox';
    checkInput.className = 'super-checkbox';
    checkInput.dataset.index = String(index);
    checkInput.checked = isInitiallyBought;
    checkInput.setAttribute('aria-label', `Marcar ${item.label} como comprado`);

    checkInput.addEventListener('change', () => {
      const isChecked = checkInput.checked;
      row.classList.toggle('is-bought', isChecked);
      if (isChecked) boughtIndices.add(index);
      else boughtIndices.delete(index);
      updateSuperStats();

      const curId = activeListId || savedSelect.value;
      if (curId) {
        toggleItemBought(curId, index, isChecked).catch(() => {});
      }
    });

    checkWrap.append(checkInput);
    row.append(checkWrap);

    const winner = item.winner;
    row.append((winner && safeImage(winner.image)) || el('div'));
    const info = el('div');
    const labelP = el('p', 'list-label', item.label);
    const origItem = lastSearchedItems[index];
    if (origItem && (origItem.addedBy || origItem.addedById)) {
      const isMe = currentUserId && origItem.addedById === currentUserId;
      const authorName = isMe ? 'Tú' : (origItem.addedBy || '');
      if (authorName) {
        labelP.append(el('span', 'item-author-pill', `👤 ${authorName}`));
      }
    }
    info.append(labelP);
    if (!winner) {
      info.append(el('p', 'note', 'No encontré ese producto con la marca y el formato pedidos.'));
      row.append(info, el('div'));
      list.append(row);
      return;
    }
    info.append(el('h4', null, winner.name));
    const meta = el('p', 'meta');
    meta.append(storeMark(winner.store_id, winner.store_name));
    info.append(meta);
    info.append(el('p', 'meta', item.detail));
    const link = el('a', null, 'Ver producto');
    link.href = winner.url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    info.append(link);
    if (item.options && item.options.length) {
      const others = el('ul', 'list-options');
      for (const option of item.options) {
        others.append(el('li', null, `${option.store_name}: ${money(option.total)} · ${option.name}`));
      }
      info.append(el('p', 'list-options-title', 'Otras opciones, no se suman al total:'), others);
    }
    const price = el('div', 'money');
    price.append(el('strong', null, money(winner.total)));
    price.append(el('span', null, `${moneyExact(winner.unit_price)} por ${winner.unit_label}`));
    if (winner.from_card) price.append(el('span', 'card-line', winner.payment_label));
    row.append(info, price);
    list.append(row);
  });
  panel.append(list);
  results.append(panel);

  updateSuperStats();

  const stores = el('section', 'panel');
  stores.append(el('h3', null, 'Toda la lista en una sola tienda'));
  const compare = el('div', 'compare');
  for (const store of report.single_store) {
    const row = el('div', 'compare-row');
    row.append(storeMark(store.store_id, store.store_name));
    const right = el('div', 'money');
    if (!store.missing.length) {
      right.append(el('strong', null, money(store.total)));
    } else if (store.total == null) {
      right.append(el('span', null, 'Ningún producto de la lista'));
    } else {
      right.append(el('strong', null, money(store.total)));
      right.append(el('span', null, `Le falta: ${store.missing.join(', ')}`));
    }
    row.append(right);
    compare.append(row);
  }
  stores.append(compare);
  results.append(stores);

  renderStores(report.stores.map((store: any) => ({ ...store, listTotal: report.count })));
}

function setMode(next: ModeKey) {
  mode = next;
  const config = MODES[mode];
  document.querySelectorAll<HTMLButtonElement>('.tab').forEach((tab) => {
    const selected = tab.dataset.mode === mode;
    tab.classList.toggle('is-active', selected);
    tab.setAttribute('aria-selected', selected ? 'true' : 'false');
  });
  queryInput.placeholder = config.placeholder;
  lead.textContent = config.lead;
  cityRow.hidden = mode === 'intl';
  unitFilters.hidden = mode !== 'unit';
  if (mode === 'unit') syncUnitMin();
  const isList = mode === 'list';
  singleSearch.hidden = isList;
  listEditor.hidden = !isList;
  queryInput.required = !isList;
  examples.hidden = isList;
  footnote.textContent = config.footnote.replaceAll('{ciudad}', cityName());
  examples.replaceChildren();
  for (const [query, labelText] of config.examples) {
    const button = el('button', null, labelText);
    button.type = 'button';
    button.dataset.query = query;
    examples.append(button);
  }
  results.hidden = true;
  results.replaceChildren();
  status.textContent = '';
}

async function search(query: string) {
  const config = MODES[mode];
  submit.disabled = true;
  status.textContent = config.status.replaceAll('{ciudad}', cityName());
  results.hidden = true;
  try {
    const cityQuery = mode === 'intl' ? '' : `&ciudad=${encodeURIComponent(citySelect.value || 'bogota')}`;
    const minRaw = unitMin.value.trim().replace(',', '.');
    const minQuery = mode === 'unit' && unitBasis.value !== 'todas' && minRaw
      ? `&minimo=${encodeURIComponent(minRaw)}`
      : '';
    const unitQuery = mode === 'unit'
      ? `&unidad=${encodeURIComponent(unitBasis.value || 'todas')}&categoria=${encodeURIComponent(unitCategory.value || 'todas')}${minQuery}`
      : '';
    const response = await fetch(`${config.endpoint}?q=${encodeURIComponent(query)}${cityQuery}${unitQuery}`);
    if (!response.ok) {
      throw new Error('No pude completar la búsqueda');
    }
    const report = await response.json();
    status.textContent = '';
    if (mode === 'intl') renderInternational(report);
    else if (mode === 'unit') renderUnit(report);
    else render(report);
  } catch (error: any) {
    status.textContent = error.message || 'Falló la búsqueda';
  } finally {
    submit.disabled = false;
  }
}

function readList(): ListItemData[] {
  return [...listRows.querySelectorAll('.list-row')].map((row, idx) => {
    const r = row as HTMLElement;
    const nombre = (r.querySelector<HTMLInputElement>('[name="nombre"]')!.value || '').trim();
    const marca = (r.querySelector<HTMLInputElement>('[name="marca"]')!.value || '').trim() || 'TODAS';
    const formato = r.querySelector<HTMLSelectElement>('[name="formato"]')!.value as 'gramos' | 'mililitros' | 'unidades';
    const cantidad = Number(r.querySelector<HTMLInputElement>('[name="cantidad"]')!.value);
    const comprado = boughtIndices.has(idx);

    let addedBy = r.dataset.addedBy;
    let addedById = r.dataset.addedById;

    if (nombre && !addedBy && currentUserObj) {
      addedBy = currentUserObj.displayName || 'Tú';
      addedById = currentUserId || '';
      r.dataset.addedBy = addedBy;
      r.dataset.addedById = addedById;
    }

    const item: ListItemData = {
      nombre,
      marca,
      formato,
      cantidad,
      comprado,
    };
    if (addedBy) item.addedBy = addedBy;
    if (addedById) item.addedById = addedById;
    return item;
  });
}

function updateHeaderCartCount() {
  if (!headerCartCount) return;
  const items = readList().filter((it) => it.nombre && it.nombre.trim().length >= 1);
  headerCartCount.textContent = String(items.length);
}

let syncDebounceTimer: any = null;

function showLiveSyncIndicator(msg: string) {
  if (accountStatus) {
    accountStatus.textContent = msg;
  }
}

function autoSyncActiveListToCloud() {
  const targetUid = currentUserId;
  const targetListId = activeListId;
  if (!targetListId || !targetUid) return;
  clearTimeout(syncDebounceTimer);

  showLiveSyncIndicator('☁️ Sincronizando con tu pareja…');

  syncDebounceTimer = setTimeout(async () => {
    try {
      const items = readList().filter((it) => it.nombre && it.nombre.trim().length >= 1);
      const nombre = savedName.value.trim() || 'Mi Mercado';
      const ciudad = citySelect.value || 'bogota';

      await saveUserList(
        targetUid,
        { nombre, ciudad, items },
        targetListId,
        currentUserObj ? { displayName: currentUserObj.displayName, email: currentUserObj.email } : undefined
      );

      const inMemory = savedLists.find((l) => l.id === targetListId);
      if (inMemory) {
        inMemory.nombre = nombre;
        inMemory.ciudad = ciudad;
        inMemory.items = items;
      }

      showLiveSyncIndicator('✅ Sincronizado en tiempo real con tu pareja');
      setTimeout(() => {
        if (accountStatus.textContent?.includes('Sincronizado')) {
          accountStatus.textContent = '';
        }
      }, 3500);
    } catch (err: any) {
      console.warn('Error en autosync:', err);
    }
  }, 700);
}

function saveListLocal(shouldSyncToCloud = true) {
  localStorage.setItem(LIST_KEY, JSON.stringify(readList()));
  updateHeaderCartCount();
  if (shouldSyncToCloud && activeListId && currentUserId) {
    autoSyncActiveListToCloud();
  }
}

function field(labelText: string, control: HTMLElement) {
  const wrap = el('label', 'list-field');
  wrap.append(el('span', null, labelText), control);
  return wrap;
}

function highlightMatch(text: string, query: string): string {
  const normText = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const normQ = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const idx = normText.indexOf(normQ);
  if (idx === -1) return escapeHtml(text);
  const before = escapeHtml(text.slice(0, idx));
  const matched = escapeHtml(text.slice(idx, idx + normQ.length));
  const after = escapeHtml(text.slice(idx + normQ.length));
  return `${before}<strong>${matched}</strong>${after}`;
}

function setupCategoryExplorer() {
  if (!categoryChipsScroll || !categoryQuickItems) return;
  categoryChipsScroll.replaceChildren();

  CATEGORIES.forEach((cat) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'category-chip';
    chip.innerHTML = `<span>${cat.icono}</span><span>${cat.nombre}</span>`;

    chip.addEventListener('click', () => {
      const isAlreadyActive = chip.classList.contains('is-active');
      categoryChipsScroll.querySelectorAll('.category-chip').forEach((c) => c.classList.remove('is-active'));

      if (isAlreadyActive) {
        categoryQuickItems.hidden = true;
        categoryQuickItems.replaceChildren();
        return;
      }

      chip.classList.add('is-active');
      const items = getItemsByCategory(cat.id);
      categoryQuickItems.replaceChildren();

      items.forEach((it) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quick-item-btn';
        btn.innerHTML = `<span class="plus">+</span><span>${it.icono} ${it.nombre}</span>`;

        btn.addEventListener('click', () => {
          if (mode === 'list') {
            const rows = [...listRows.querySelectorAll<HTMLElement>('.list-row')];
            let targetRow: HTMLElement | null = null;
            for (const r of rows) {
              const nameInput = r.querySelector<HTMLInputElement>('[name="nombre"]');
              if (nameInput && !nameInput.value.trim()) {
                targetRow = r;
                break;
              }
            }
            if (!targetRow) {
              if (listRows.children.length >= LIST_MAX) return;
              targetRow = listRow({
                ...it,
                addedBy: currentUserObj?.displayName || 'Tú',
                addedById: currentUserId || undefined,
              });
              listRows.append(targetRow);
            } else {
              targetRow.querySelector<HTMLInputElement>('[name="nombre"]')!.value = it.nombre;
              targetRow.querySelector<HTMLSelectElement>('[name="formato"]')!.value = it.formato;
              targetRow.querySelector<HTMLInputElement>('[name="cantidad"]')!.value = String(it.cantidad);
              if (currentUserObj) {
                targetRow.dataset.addedBy = currentUserObj.displayName || 'Tú';
                targetRow.dataset.addedById = currentUserId || '';
                let authorPill = targetRow.querySelector<HTMLElement>('.item-author-pill');
                if (!authorPill) {
                  authorPill = el('span', 'item-author-pill', '👤 Tú');
                  targetRow.querySelector('.list-field span')?.append(authorPill);
                }
              }
            }
            saveListLocal();
            updateAddRow();
          } else {
            window.location.href = getProductUrl(it);
          }
        });

        categoryQuickItems.append(btn);
      });

      // Botón para ver toda la categoría completa
      const catLink = document.createElement('a');
      catLink.className = 'quick-item-btn quick-item-cat-link';
      catLink.href = getCategoryUrl(cat.id);
      catLink.innerHTML = `<strong>Ver toda la categoría ${escapeHtml(cat.nombre)} →</strong>`;
      catLink.style.background = '#e7f6ee';
      catLink.style.color = '#0e6a45';
      catLink.style.borderColor = '#0e6a45';
      catLink.style.textDecoration = 'none';
      categoryQuickItems.append(catLink);

      categoryQuickItems.hidden = false;
    });

    categoryChipsScroll.append(chip);
  });
}

function setupQueryAutocomplete() {
  if (!queryAutocomplete || !queryInput) return;
  let selectedIndex = -1;

  function closeDropdown() {
    queryAutocomplete.classList.remove('is-open');
    queryAutocomplete.replaceChildren();
    selectedIndex = -1;
  }

  queryInput.addEventListener('input', () => {
    const q = queryInput.value.trim();
    if (q.length < 2) {
      closeDropdown();
      return;
    }

    const bestCat = findBestCategoryHelp(q);
    const catMatches = searchCategories(q, 2);
    const matches = searchCatalog(q, 6);
    if (!bestCat && !catMatches.length && !matches.length) {
      closeDropdown();
      return;
    }

    queryAutocomplete.replaceChildren();
    selectedIndex = -1;

    let itemIndex = 0;

    // 0. Auto-ayuda de categoría oficial sugerida (ej. Huevos, Leche, Arroz)
    if (bestCat) {
      const bestCatEl = document.createElement('div');
      bestCatEl.className = 'autocomplete-item autocomplete-item-category autocomplete-category-highlight';
      bestCatEl.dataset.index = String(itemIndex++);
      bestCatEl.innerHTML = `
        <div class="autocomplete-item-left">
          <span class="autocomplete-item-icon">${bestCat.icono || '🏷️'}</span>
          <span class="autocomplete-item-text">
            <strong>${escapeHtml(bestCat.name)}</strong>
            <em style="font-size: 0.8rem; color: var(--muted);">${bestCat.parentName ? 'en ' + escapeHtml(bestCat.parentName) : 'Sección oficial'}</em>
          </span>
        </div>
        <span class="autocomplete-item-cat" style="background: #e7f6ee; color: #0e6a45; font-weight: 700;">Ver categoría →</span>
      `;
      bestCatEl.addEventListener('mousedown', (e) => {
        e.preventDefault();
        closeDropdown();
        window.location.href = bestCat.url;
      });
      queryAutocomplete.append(bestCatEl);
    }

    // 1. Sugerencias de categorías completas
    catMatches.forEach((cat) => {
      // Evitar duplicar si bestCat ya apunta a esta misma categoría
      if (bestCat && (bestCat.slugPath === cat.id || bestCat.url === getCategoryUrl(cat.id))) return;
      const catEl = document.createElement('div');
      catEl.className = 'autocomplete-item autocomplete-item-category';
      catEl.dataset.index = String(itemIndex++);
      catEl.innerHTML = `
        <div class="autocomplete-item-left">
          <span class="autocomplete-item-icon">${cat.icono}</span>
          <span class="autocomplete-item-text"><strong>${escapeHtml(cat.nombre)}</strong> <em style="font-size: 0.8rem; color: var(--muted);">(Ver categoría)</em></span>
        </div>
        <span class="autocomplete-item-cat" style="background: #e7f6ee; color: #0e6a45; font-weight: 600;">Categoría →</span>
      `;
      catEl.addEventListener('mousedown', (e) => {
        e.preventDefault();
        closeDropdown();
        window.location.href = getCategoryUrl(cat.id);
      });
      queryAutocomplete.append(catEl);
    });

    // 2. Sugerencias de productos del catálogo
    matches.forEach((m) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'autocomplete-item';
      itemEl.dataset.index = String(itemIndex++);
      const catInfo = CATEGORIES.find((c) => c.id === m.categoria);
      itemEl.innerHTML = `
        <div class="autocomplete-item-left">
          <span class="autocomplete-item-icon">${m.icono}</span>
          <span class="autocomplete-item-text">${highlightMatch(m.nombre, q)}</span>
        </div>
        <span class="autocomplete-item-cat">${catInfo ? catInfo.nombre : m.categoria}</span>
      `;
      itemEl.addEventListener('mousedown', (e) => {
        e.preventDefault();
        closeDropdown();
        if (mode === 'local') {
          window.location.href = getProductUrl(m);
        } else {
          queryInput.value = m.nombre;
          search(m.nombre);
        }
      });
      queryAutocomplete.append(itemEl);
    });

    queryAutocomplete.classList.add('is-open');
  });

  queryInput.addEventListener('keydown', (e) => {
    const items = queryAutocomplete.querySelectorAll<HTMLElement>('.autocomplete-item');
    if (!queryAutocomplete.classList.contains('is-open') || !items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % items.length;
      items.forEach((it, i) => it.classList.toggle('is-selected', i === selectedIndex));
      items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      items.forEach((it, i) => it.classList.toggle('is-selected', i === selectedIndex));
      items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && items[selectedIndex]) {
        e.preventDefault();
        items[selectedIndex].dispatchEvent(new MouseEvent('mousedown'));
      }
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  });

  document.addEventListener('click', (e) => {
    if (!queryAutocomplete.contains(e.target as Node) && e.target !== queryInput) {
      closeDropdown();
    }
  });
}

function listRow(item: {
  nombre?: string;
  marca?: string;
  formato?: 'gramos' | 'mililitros' | 'unidades';
  cantidad?: number;
  addedBy?: string;
  addedById?: string;
  comprado?: boolean;
}) {
  const row = el('div', 'list-row');
  if (item.addedBy) row.dataset.addedBy = item.addedBy;
  if (item.addedById) row.dataset.addedById = item.addedById;

  const name = document.createElement('input');
  name.name = 'nombre';
  name.type = 'text';
  name.placeholder = 'Arroz';
  name.maxLength = 60;
  name.autocomplete = 'off';
  name.value = item.nombre || '';

  const isMe = currentUserId && item.addedById === currentUserId;
  const authorName = isMe ? 'Tú' : (item.addedBy || '');
  const authorPill = authorName && item.nombre ? el('span', 'item-author-pill', `👤 ${authorName}`) : null;
  const nameField = field('Nombre', name);
  if (authorPill) {
    nameField.querySelector('span')?.append(authorPill);
  }

  const brand = document.createElement('input');
  brand.name = 'marca';
  brand.type = 'text';
  brand.placeholder = 'TODAS';
  brand.maxLength = 40;
  brand.autocomplete = 'off';
  brand.setAttribute('list', 'brand-options');
  brand.value = item.marca && item.marca.toUpperCase() !== 'TODAS' ? item.marca : '';

  const format = document.createElement('select');
  format.name = 'formato';
  for (const [value, labelText] of FORMATS) {
    const option = el('option', null, labelText);
    option.value = value;
    format.append(option);
  }
  format.value = item.formato || 'gramos';

  const amount = document.createElement('input');
  amount.name = 'cantidad';
  amount.type = 'number';
  amount.inputMode = 'decimal';
  amount.min = '1';
  amount.step = 'any';
  amount.placeholder = '1000';
  amount.value = item.cantidad ? String(item.cantidad) : '';

  // Autocompletado inteligente en filas de la lista
  name.addEventListener('input', () => {
    if (currentUserObj && !row.dataset.addedBy) {
      row.dataset.addedBy = currentUserObj.displayName || 'Tú';
      row.dataset.addedById = currentUserId || '';
      if (!nameField.querySelector('.item-author-pill') && name.value.trim().length >= 1) {
        const pill = el('span', 'item-author-pill', '👤 Tú');
        nameField.querySelector('span')?.append(pill);
      }
    }

    const q = name.value.trim();
    if (q.length < 2) {
      listAutocomplete.classList.remove('is-open');
      return;
    }
    const matches = searchCatalog(q);
    if (!matches.length) {
      listAutocomplete.classList.remove('is-open');
      return;
    }

    listAutocomplete.replaceChildren();
    matches.forEach((m) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'autocomplete-item';
      itemEl.innerHTML = `
        <div class="autocomplete-item-left">
          <span class="autocomplete-item-icon">${m.icono}</span>
          <span class="autocomplete-item-text">${highlightMatch(m.nombre, q)}</span>
        </div>
        <span class="autocomplete-item-cat">${m.cantidad} ${m.formato}</span>
      `;
      itemEl.addEventListener('mousedown', (e) => {
        e.preventDefault();
        name.value = m.nombre;
        format.value = m.formato;
        amount.value = String(m.cantidad);
        saveListLocal();
        listAutocomplete.classList.remove('is-open');
        brand.focus();
      });
      listAutocomplete.append(itemEl);
    });

    row.style.position = 'relative';
    row.append(listAutocomplete);
    listAutocomplete.style.top = '100%';
    listAutocomplete.style.left = '0';
    listAutocomplete.classList.add('is-open');
  });

  name.addEventListener('blur', () => {
    setTimeout(() => {
      listAutocomplete.classList.remove('is-open');
    }, 250);
  });

  const remove = el('button', 'remove-row', 'Quitar');
  remove.type = 'button';
  remove.addEventListener('click', () => {
    row.remove();
    if (!listRows.children.length) listRows.append(listRow({ formato: 'gramos' }));
    saveListLocal();
    updateAddRow();
  });

  row.append(
    nameField,
    field('Marca', brand),
    field('Formato', format),
    field('Cantidad', amount),
    remove
  );
  row.addEventListener('input', () => saveListLocal());
  row.addEventListener('change', () => saveListLocal());
  return row;
}

function updateAddRow() {
  addRow.disabled = listRows.children.length >= LIST_MAX;
}

function setRows(items: any[]) {
  boughtIndices.clear();
  items.forEach((item, idx) => {
    if (item.comprado) boughtIndices.add(idx);
  });
  listRows.replaceChildren(...items.slice(0, LIST_MAX).map(listRow));
  saveListLocal();
  updateAddRow();
}

function loadList() {
  let saved: any = null;
  try {
    saved = JSON.parse(localStorage.getItem(LIST_KEY) || 'null');
  } catch {
    saved = null;
  }
  const items = Array.isArray(saved) && saved.length ? saved.slice(0, LIST_MAX) : DEFAULT_LIST;
  listRows.replaceChildren(...items.map(listRow));
  const brands = document.createElement('datalist');
  brands.id = 'brand-options';
  const option = document.createElement('option');
  option.value = 'TODAS';
  brands.append(option);
  listEditor.append(brands);
  updateAddRow();
}

async function searchList() {
  const items = readList().filter((item) => item.nombre.length >= 2);
  const invalid = items.find((item) => !(item.cantidad > 0));
  if (!items.length) {
    status.textContent = 'Escribe al menos un producto con nombre.';
    return;
  }
  if (invalid) {
    status.textContent = `Falta la cantidad de ${invalid.nombre}.`;
    return;
  }
  lastSearchedItems = items;
  const config = MODES.list;
  listSubmit.disabled = true;
  status.textContent = config.status.replace('{n}', String(items.length)).replaceAll('{ciudad}', cityName());
  results.hidden = true;
  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ciudad: citySelect.value || 'bogota', items }),
    });
    if (!response.ok) throw new Error('No pude comparar la lista. Revisa nombres y cantidades.');
    const report = await response.json();
    status.textContent = '';
    renderList(report);
  } catch (error: any) {
    status.textContent = error.message || 'Falló la búsqueda';
  } finally {
    listSubmit.disabled = false;
  }
}

// Firebase Auth & Cloud Firestore Lists
function renderSavedDropdown(selectedId = '') {
  savedSelect.replaceChildren();
  const fresh = el('option', null, 'Nueva lista (sin guardar)');
  fresh.value = '';
  savedSelect.append(fresh);
  for (const saved of savedLists) {
    const isShared = !saved.isOwner || (saved.collaborators && saved.collaborators.length > 0) || (saved.sharedWithEmails && saved.sharedWithEmails.length > 0);
    const prefix = isShared ? '👥 ' : '📋 ';
    const option = el('option', null, `${prefix}${saved.nombre} · ${saved.items.length} productos`);
    option.value = String(saved.id);
    savedSelect.append(option);
  }
  savedSelect.value = String(selectedId);
  const current = savedLists.find((s) => s.id === savedSelect.value);
  savedName.value = current ? current.nombre : '';
  savedDelete.hidden = !current;
  savedShare.hidden = !current;
  updateCollabBanner(current);
}

async function refreshSavedLists(selectedId = '') {
  if (!currentUserId) return;
  try {
    savedLists = await getUserLists(currentUserId, currentUserObj?.email);
    renderSavedDropdown(selectedId);
  } catch (err: any) {
    accountStatus.textContent = 'Error al cargar listas guardadas.';
  }
}

function handleAuthState(user: any) {
  currentUserObj = user;
  if (user) {
    currentUserId = user.uid;
    // Header
    headerLoginBtn.hidden = true;
    headerUserInfo.hidden = false;
    headerUserName.textContent = `👤 ${user.displayName || user.email || 'Mi Perfil'}`;

    // List tab account panel
    accountOut.hidden = true;
    accountIn.hidden = false;
    accountHello.textContent = `Hola, ${user.displayName || user.email || 'Usuario'}`;
    accountStatus.textContent = '';
    refreshSavedLists();
  } else {
    currentUserId = null;
    savedLists = [];
    // Header
    headerLoginBtn.hidden = false;
    headerUserInfo.hidden = true;

    // List tab account panel
    accountIn.hidden = true;
    accountOut.hidden = false;
    accountStatus.textContent = '';
  }
}

async function saveCurrentList() {
  if (!currentUserId) {
    accountStatus.textContent = 'Inicia sesión para guardar tu lista.';
    return;
  }
  const nombre = savedName.value.trim();
  const items = readList().filter((item) => item.nombre.length >= 2);
  if (!nombre) {
    accountStatus.textContent = 'Ponle un nombre a la lista.';
    savedName.focus();
    return;
  }
  if (!items.length) {
    accountStatus.textContent = 'Escribe al menos un producto con nombre.';
    return;
  }
  const invalid = items.find((item) => !(item.cantidad > 0));
  if (invalid) {
    accountStatus.textContent = `Falta la cantidad de ${invalid.nombre}.`;
    return;
  }
  const id = savedSelect.value;
  savedSave.disabled = true;
  try {
    const saved = await saveUserList(
      currentUserId,
      { nombre, ciudad: citySelect.value || 'bogota', items },
      id || undefined,
      currentUserObj ? { displayName: currentUserObj.displayName, email: currentUserObj.email } : undefined
    );
    activeListId = saved.id;
    setupRealtimeList(saved.id);
    await refreshSavedLists(saved.id);
    accountStatus.textContent = `Guardé «${saved.nombre}» en tu cuenta.`;
  } catch (err: any) {
    accountStatus.textContent = err.message || 'Error al guardar la lista.';
  } finally {
    savedSave.disabled = false;
  }
}

function applyCity(cityId: string) {
  if (![...citySelect.options].some((option) => option.value === cityId)) return;
  citySelect.value = cityId;
  localStorage.setItem(CITY_KEY, cityId);
  footnote.textContent = MODES[mode].footnote.replaceAll('{ciudad}', cityName());
}

// Event Listeners
form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (mode === 'list') {
    searchList();
    return;
  }
  const query = queryInput.value.trim();
  if (query.length < 2) return;

  if (mode === 'local') {
    // 1. Si coincide con una categoría completa -> ir a /categoria/[categoria]
    const matchedCat = findCategoryMatch(query);
    if (matchedCat) {
      window.location.href = getCategoryUrl(matchedCat.id);
      return;
    }

    // 2. Si coincide con un producto del catálogo -> ir a /categoria/[categoria]/[producto]
    const matchedProd = findProductMatch(query);
    if (matchedProd) {
      window.location.href = getProductUrl(matchedProd);
      return;
    }
  }

  // 3. Búsqueda en tiempo real en la app si no es categoría fija
  search(query);
});

addRow.addEventListener('click', () => {
  if (listRows.children.length >= LIST_MAX) return;
  const row = listRow({
    formato: 'gramos',
    addedBy: currentUserObj?.displayName || 'Tú',
    addedById: currentUserId || undefined,
  });
  listRows.append(row);
  row.querySelector<HTMLInputElement>('[name="nombre"]')!.focus();
  saveListLocal();
  updateAddRow();
});

async function handleGoogleLogin() {
  accountStatus.textContent = 'Iniciando sesión con Google…';
  try {
    await loginWithGoogle();
  } catch (err: any) {
    console.error('Error al iniciar sesión con Google:', err);
    let msg = err.message || 'No se pudo iniciar sesión con Google';
    if (err.code === 'auth/unauthorized-domain') {
      msg = `El dominio «${window.location.hostname}» no está autorizado en Firebase. Agrégalo en Firebase Console > Authentication > Settings > Authorized domains.`;
    } else if (err.code === 'auth/popup-blocked') {
      msg = 'Tu navegador bloqueó la ventana emergente de Google. Por favor habilita los popups para este sitio.';
    } else if (err.code === 'auth/popup-closed-by-user') {
      msg = 'Se cerró la ventana emergente antes de completar el inicio de sesión.';
    }
    accountStatus.textContent = msg;
    if (mode !== 'list') {
      alert(msg);
    }
  }
}

headerLoginBtn.addEventListener('click', handleGoogleLogin);

headerLogoutBtn.addEventListener('click', async () => {
  await logoutUser();
  accountStatus.textContent = 'Has cerrado sesión.';
});

accountGoogleBtn.addEventListener('click', handleGoogleLogin);

accountLogout.addEventListener('click', async () => {
  await logoutUser();
  accountStatus.textContent = 'Has cerrado sesión.';
});

savedSave.addEventListener('click', saveCurrentList);
savedName.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    saveCurrentList();
  }
});
savedName.addEventListener('input', () => {
  if (activeListId && currentUserId) {
    autoSyncActiveListToCloud();
  }
});

savedSelect.addEventListener('change', () => {
  const current = savedLists.find((s) => s.id === savedSelect.value);
  renderSavedDropdown(savedSelect.value);
  accountStatus.textContent = '';
  if (savedSelect.value) {
    activeListId = savedSelect.value;
    setupRealtimeList(savedSelect.value);
  } else {
    activeListId = null;
    if (unsubscribeActiveList) {
      unsubscribeActiveList();
      unsubscribeActiveList = null;
    }
  }
  if (!current) return;
  setRows(current.items);
  applyCity(current.ciudad);
  results.hidden = true;
  status.textContent = '';
});

savedShare.addEventListener('click', () => {
  const current = savedLists.find((s) => s.id === savedSelect.value);
  if (!current) return;
  openShareModal({ listId: current.id, listName: current.nombre });
});

savedDelete.addEventListener('click', async () => {
  const current = savedLists.find((s) => s.id === savedSelect.value);
  if (!current || !currentUserId || !window.confirm(`¿Borrar la lista «${current.nombre}»?`)) return;
  try {
    await deleteUserList(currentUserId, current.id, current.isOwner ?? true);
    await refreshSavedLists();
    accountStatus.textContent = `Borré «${current.nombre}».`;
  } catch (err: any) {
    accountStatus.textContent = err.message || 'Error al borrar la lista.';
  }
});

examples.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
  if (!button || !button.dataset.query) return;
  queryInput.value = button.dataset.query;
  search(button.dataset.query);
});

document.querySelectorAll<HTMLButtonElement>('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    if (tab.dataset.mode) setMode(tab.dataset.mode as ModeKey);
  });
});

citySelect.addEventListener('change', () => {
  localStorage.setItem(CITY_KEY, citySelect.value);
  const config = MODES[mode];
  footnote.textContent = config.footnote.replaceAll('{ciudad}', cityName());
});

async function loadCities() {
  const saved = localStorage.getItem(CITY_KEY) || 'bogota';
  try {
    const response = await fetch('/api/ciudades');
    if (!response.ok) return;
    const cities = await response.json();
    citySelect.replaceChildren();
    for (const city of cities) {
      const option = el('option', null, city.name);
      option.value = city.id;
      citySelect.append(option);
    }
  } catch {
    return;
  }
  if ([...citySelect.options].some((option) => option.value === saved)) {
    citySelect.value = saved;
  }
  const config = MODES[mode];
  footnote.textContent = config.footnote.replaceAll('{ciudad}', cityName());
}

// Modal Añadir a Lista
interface AddModalProduct {
  name: string;
  brand?: string;
  unit_name?: string;
  unit_quantity?: number;
  price?: number;
  store_name?: string;
  image?: string;
}

let pendingAddProduct: AddModalProduct | null = null;

function openAddToListModal(prod: AddModalProduct) {
  pendingAddProduct = prod;
  const modal = document.getElementById('add-to-list-modal');
  if (!modal) return;

  const thumb = document.getElementById('add-modal-thumb')!;
  const prodName = document.getElementById('add-modal-prod-name')!;
  const prodMeta = document.getElementById('add-modal-prod-meta')!;
  const qtyInput = document.getElementById('add-modal-qty') as HTMLInputElement;
  const formatSelect = document.getElementById('add-modal-format') as HTMLSelectElement;
  const feedback = document.getElementById('add-modal-feedback')!;

  const authListsSec = document.getElementById('add-modal-auth-lists')!;
  const authNoListsSec = document.getElementById('add-modal-auth-nolists')!;
  const guestSec = document.getElementById('add-modal-guest')!;
  const existingSelect = document.getElementById('add-modal-existing-select') as HTMLSelectElement;
  const newNameInput = document.getElementById('add-modal-new-name') as HTMLInputElement;
  const destExisting = document.getElementById('add-dest-existing') as HTMLInputElement;
  const destNew = document.getElementById('add-dest-new') as HTMLInputElement;

  // Llenar datos de producto
  thumb.replaceChildren();
  const imgEl = safeImage(prod.image);
  if (imgEl) thumb.append(imgEl);

  prodName.textContent = prod.name;
  const metaParts: string[] = [];
  if (prod.store_name) metaParts.push(prod.store_name);
  if (prod.price) metaParts.push(money(prod.price));
  prodMeta.textContent = metaParts.join(' · ') || 'Producto de supermercado';

  // Configurar cantidad y formato sugeridos
  const detectedQty = prod.unit_quantity && prod.unit_quantity > 0 ? prod.unit_quantity : 1;
  qtyInput.value = String(detectedQty);

  if (prod.unit_name === 'gramos' || prod.unit_name === 'g') {
    formatSelect.value = 'gramos';
  } else if (prod.unit_name === 'mililitros' || prod.unit_name === 'ml') {
    formatSelect.value = 'mililitros';
  } else {
    formatSelect.value = 'unidades';
  }

  // Ocultar feedback al abrir
  feedback.hidden = true;

  // Evaluar estado de sesión
  if (currentUserId) {
    guestSec.hidden = true;
    if (savedLists.length > 0) {
      authListsSec.hidden = false;
      authNoListsSec.hidden = true;

      // Llenar selector de listas existentes
      existingSelect.replaceChildren();
      for (const list of savedLists) {
        const count = list.items ? list.items.length : 0;
        const opt = el('option', null, `${list.nombre} (${count} producto${count === 1 ? '' : 's'})`);
        opt.value = list.id;
        existingSelect.append(opt);
      }
      destExisting.checked = true;
      existingSelect.disabled = false;
      destNew.checked = false;
      newNameInput.disabled = true;
      newNameInput.value = '';
    } else {
      authListsSec.hidden = true;
      authNoListsSec.hidden = false;
      (document.getElementById('add-modal-first-name') as HTMLInputElement).value = '';
    }
  } else {
    authListsSec.hidden = true;
    authNoListsSec.hidden = true;
    guestSec.hidden = false;
  }

  modal.classList.add('is-open');
}

function initAddToListModalListeners() {
  const modal = document.getElementById('add-to-list-modal');
  if (!modal) return;

  const closeBtn = document.getElementById('add-modal-close');
  const continueBtn = document.getElementById('add-modal-continue');
  const goListBtn = document.getElementById('add-modal-go-list');

  const destExisting = document.getElementById('add-dest-existing') as HTMLInputElement;
  const destNew = document.getElementById('add-dest-new') as HTMLInputElement;
  const existingSelect = document.getElementById('add-modal-existing-select') as HTMLSelectElement;
  const newNameInput = document.getElementById('add-modal-new-name') as HTMLInputElement;

  const submitAuth = document.getElementById('add-modal-submit-auth');
  const submitFirst = document.getElementById('add-modal-submit-first');
  const addLocalBtn = document.getElementById('add-modal-add-local');
  const modalLoginBtn = document.getElementById('add-modal-login-btn');

  const qtyInput = document.getElementById('add-modal-qty') as HTMLInputElement;
  const formatSelect = document.getElementById('add-modal-format') as HTMLSelectElement;
  const feedback = document.getElementById('add-modal-feedback')!;
  const feedbackMsg = document.getElementById('add-modal-feedback-msg')!;

  const closeModal = () => modal.classList.remove('is-open');

  closeBtn?.addEventListener('click', closeModal);
  continueBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  goListBtn?.addEventListener('click', () => {
    closeModal();
    setMode('list');
    listEditor.scrollIntoView({ behavior: 'smooth' });
  });

  destExisting?.addEventListener('change', () => {
    existingSelect.disabled = false;
    newNameInput.disabled = true;
  });
  destNew?.addEventListener('change', () => {
    existingSelect.disabled = true;
    newNameInput.disabled = false;
    newNameInput.focus();
  });

  function showSuccess(msg: string) {
    feedbackMsg.textContent = msg;
    feedback.hidden = false;
    document.getElementById('add-modal-auth-lists')!.hidden = true;
    document.getElementById('add-modal-auth-nolists')!.hidden = true;
    document.getElementById('add-modal-guest')!.hidden = true;
  }

  submitAuth?.addEventListener('click', async () => {
    if (!pendingAddProduct || !currentUserId) return;
    const isNew = destNew.checked;
    const qty = Number(qtyInput.value) || 1;
    const format = formatSelect.value as 'gramos' | 'mililitros' | 'unidades';

    const newItem: ListItemData = {
      nombre: pendingAddProduct.name,
      marca: pendingAddProduct.brand || 'TODAS',
      formato: format,
      cantidad: qty,
      comprado: false,
      addedBy: currentUserObj?.displayName || 'Tú',
      addedById: currentUserId || undefined,
    };

    if (isNew) {
      const name = newNameInput.value.trim();
      if (!name) {
        alert('Escribe un nombre para la nueva lista');
        newNameInput.focus();
        return;
      }
      try {
        const saved = await saveUserList(
          currentUserId,
          { nombre: name, ciudad: citySelect.value || 'bogota', items: [newItem] },
          undefined,
          currentUserObj ? { displayName: currentUserObj.displayName, email: currentUserObj.email } : undefined
        );
        await refreshSavedLists(saved.id);
        showSuccess(`¡Lista «${saved.nombre}» creada y producto guardado!`);
      } catch (err: any) {
        alert(err.message || 'Error al crear la lista.');
      }
    } else {
      const targetId = existingSelect.value;
      const targetList = savedLists.find((l) => l.id === targetId);
      if (!targetList) return;
      try {
        const items = [...(targetList.items || []), newItem];
        await saveUserList(
          currentUserId,
          { nombre: targetList.nombre, ciudad: targetList.ciudad, items },
          targetList.id,
          currentUserObj ? { displayName: currentUserObj.displayName, email: currentUserObj.email } : undefined
        );
        targetList.items = items;
        if (savedSelect.value === targetList.id) {
          setRows(items);
        }
        await refreshSavedLists(targetList.id);
        showSuccess(`¡Agregado a «${targetList.nombre}»! Ahora tiene ${items.length} productos.`);
      } catch (err: any) {
        alert(err.message || 'Error al guardar en la lista.');
      }
    }
  });

  submitFirst?.addEventListener('click', async () => {
    if (!pendingAddProduct || !currentUserId) return;
    const firstNameInput = document.getElementById('add-modal-first-name') as HTMLInputElement;
    const name = firstNameInput.value.trim() || 'Mi Mercado';
    const qty = Number(qtyInput.value) || 1;
    const format = formatSelect.value as 'gramos' | 'mililitros' | 'unidades';

    const newItem: ListItemData = {
      nombre: pendingAddProduct.name,
      marca: pendingAddProduct.brand || 'TODAS',
      formato: format,
      cantidad: qty,
      comprado: false,
      addedBy: currentUserObj?.displayName || 'Tú',
      addedById: currentUserId || undefined,
    };

    try {
      const saved = await saveUserList(
        currentUserId,
        { nombre: name, ciudad: citySelect.value || 'bogota', items: [newItem] },
        undefined,
        currentUserObj ? { displayName: currentUserObj.displayName, email: currentUserObj.email } : undefined
      );
      await refreshSavedLists(saved.id);
      showSuccess(`¡Lista «${saved.nombre}» creada y producto guardado!`);
    } catch (err: any) {
      alert(err.message || 'Error al crear la lista.');
    }
  });

  addLocalBtn?.addEventListener('click', () => {
    if (!pendingAddProduct) return;
    const qty = Number(qtyInput.value) || 1;
    const format = formatSelect.value as 'gramos' | 'mililitros' | 'unidades';

    const newItem: ListItemData = {
      nombre: pendingAddProduct.name,
      marca: pendingAddProduct.brand || 'TODAS',
      formato: format,
      cantidad: qty,
      comprado: false,
      addedBy: currentUserObj?.displayName || 'Tú',
      addedById: currentUserId || undefined,
    };

    const rows = [...listRows.querySelectorAll('.list-row')];
    if (rows.length === 1 && !rows[0].querySelector<HTMLInputElement>('[name="nombre"]')?.value.trim()) {
      listRows.replaceChildren(listRow(newItem));
    } else {
      if (listRows.children.length < LIST_MAX) {
        listRows.append(listRow(newItem));
      } else {
        alert('Has alcanzado el límite de 15 productos en la lista.');
        return;
      }
    }

    saveListLocal();
    updateAddRow();
    showSuccess(`¡Agregado a tu canasta de compras! Ya puedes cotizarla en la pestaña «Lista».`);
  });

  modalLoginBtn?.addEventListener('click', async () => {
    await handleGoogleLogin();
    if (currentUserId && pendingAddProduct) {
      openAddToListModal(pendingAddProduct);
    }
  });
}

// Initial boot
const urlParams = new URLSearchParams(window.location.search);
const sharedListId = urlParams.get('listaId');
const initialTab = urlParams.get('tab') as ModeKey | null;

if (sharedListId) {
  mode = 'list';
  setupRealtimeList(sharedListId);
  getListById(sharedListId).then(async (sharedList) => {
    if (sharedList) {
      setRows(sharedList.items);
      if (sharedList.ciudad) applyCity(sharedList.ciudad);
      savedName.value = sharedList.nombre;
      accountStatus.textContent = `📋 Cargaste la lista «${sharedList.nombre}» compartida por ${sharedList.ownerName || 'tu pareja'}.`;
      if (currentUserObj) {
        await joinSharedList(sharedList.id, currentUserObj);
        await refreshSavedLists(sharedList.id);
      }
    }
  });
} else if (initialTab && initialTab in MODES) {
  mode = initialTab;
}

loadList();
updateHeaderCartCount();
unitBasis.addEventListener('change', syncUnitMin);
setMode(mode);
loadCities();
initAddToListModalListeners();
setupCategoryExplorer();
setupQueryAutocomplete();

const qParam = urlParams.get('q');
if (qParam && qParam.trim().length >= 2) {
  const cleanQ = qParam.trim();
  const matchedCat = findCategoryMatch(cleanQ);
  if (matchedCat) {
    window.location.replace(getCategoryUrl(matchedCat.id));
  } else {
    const matchedProd = findProductMatch(cleanQ);
    if (matchedProd) {
      window.location.replace(getProductUrl(matchedProd));
    } else {
      queryInput.value = cleanQ;
      search(cleanQ);
    }
  }
}

headerCartBtn?.addEventListener('click', () => {
  setMode('list');
  listEditor.scrollIntoView({ behavior: 'smooth' });
});
subscribeAuth(async (user) => {
  handleAuthState(user);
  if (user && sharedListId) {
    await joinSharedList(sharedListId, user);
    await refreshSavedLists(sharedListId);
  }
});
