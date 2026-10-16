const form = document.querySelector("#search-form");
const queryInput = document.querySelector("#query");
const citySelect = document.querySelector("#city");
const cityRow = document.querySelector("#city-row");
const submit = document.querySelector("#submit");
const status = document.querySelector("#status");
const results = document.querySelector("#results");
const examples = document.querySelector("#examples");
const lead = document.querySelector("#lead");
const footnote = document.querySelector("#footnote");
const singleSearch = document.querySelector("#single-search");
const listEditor = document.querySelector("#list-editor");
const listRows = document.querySelector("#list-rows");
const addRow = document.querySelector("#add-row");
const listSubmit = document.querySelector("#list-submit");
const CITY_KEY = "comparador-ciudad";
const LIST_KEY = "comparador-lista";
const LIST_MAX = 15;
const FORMATS = [
  ["gramos", "Gramos"],
  ["mililitros", "Mililitros"],
  ["unidades", "Unidades"],
];
const DEFAULT_LIST = [
  { nombre: "Arroz", marca: "TODAS", formato: "gramos", cantidad: 1000 },
  { nombre: "Aceite", marca: "TODAS", formato: "mililitros", cantidad: 1000 },
  { nombre: "Huevos", marca: "TODAS", formato: "unidades", cantidad: 30 },
];

const MODES = {
  local: {
    endpoint: "/api/buscar",
    status: "Buscando en Éxito, Jumbo, Carulla, Olímpica, D1, Alkosto, Ktronix, Falabella y Easy para {ciudad}…",
    placeholder: "Ej. leche entera colanta, arroz roa, televisor 55",
    lead: "Compara el precio publicado en tiendas de Colombia y te dice en cuál está el más bajo.",
    footnote: "Precios de {ciudad} cuando la tienda los publica para esa zona. Pueden cambiar según la sede y las promociones. Confirma el valor antes de pagar.",
    examples: [
      ["leche entera colanta", "Leche Colanta"],
      ["arroz roa", "Arroz Roa"],
      ["aceite premier", "Aceite Premier"],
      ["televisor 55", "Televisor 55\""],
    ],
  },
  unit: {
    endpoint: "/api/unidad",
    status: "Buscando en Éxito, Jumbo, Carulla, Olímpica, D1, Alkosto, Ktronix, Falabella y Easy para {ciudad}…",
    placeholder: "Ej. huevos, leche, arroz, aceite",
    lead: "Compara el precio de cada unidad. Si el producto se vende por peso, muestra el gramo; si se vende por volumen, el mililitro.",
    footnote: "La unidad sale de la cantidad escrita en el nombre. El gramo y el mililitro salen del peso o del volumen. La ciudad es {ciudad}. Confirma el tamaño en la tienda antes de pagar.",
    examples: [
      ["huevos", "Huevos"],
      ["leche", "Leche"],
      ["arroz", "Arroz"],
      ["aceite", "Aceite"],
    ],
  },
  list: {
    endpoint: "/api/lista",
    status: "Buscando {n} productos en Éxito, Jumbo, Carulla, Olímpica, D1, Alkosto, Ktronix, Falabella y Easy para {ciudad}…",
    placeholder: "",
    lead: "Arma tu lista con nombre, marca, formato y cantidad. Te dice dónde sale más barato cada producto y cuánto cuesta toda la lista.",
    footnote: "Solo cuenta empaques del tamaño exacto que pides: 1000 gramos trae empaques de 1 kilo, no de 500 gramos ni de 2 kilos. Cada producto suma un solo empaque. Si la tarjeta de la tienda es más barata, usa ese precio. Ciudad: {ciudad}.",
    examples: [],
  },
  intl: {
    endpoint: "/api/internacional",
    status: "Buscando en Amazon, AliExpress y eBay…",
    placeholder: "Ej. audífonos bluetooth, cargador usb c, mouse inalámbrico",
    lead: "Compara Amazon, AliExpress y eBay, y suma el envío a Colombia cuando la tienda lo publica.",
    footnote: "Los precios internacionales están en pesos cuando la tienda los muestra para Colombia. El flete es el publicado en el listado; si no aparece, el total todavía no incluye el transporte. Revisa que el producto sea el que buscas antes de comprar.",
    examples: [
      ["audífonos bluetooth", "Audífonos"],
      ["cargador usb c", "Cargador USB-C"],
      ["mouse inalámbrico", "Mouse"],
    ],
  },
};

let mode = "local";

const STORE_COLOR = {
  exito: "#f2c200",
  carulla: "#1f8f4e",
  jumbo: "#00a34a",
  olimpica: "#d21f3c",
  alkosto: "#e23b2f",
  ktronix: "#111111",
  falabella: "#6fbf4a",
  easy: "#f18a00",
  d1: "#e10600",
};

function money(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function moneyExact(value) {
  const digits = value >= 100 ? 0 : 2;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function safeImage(url) {
  if (!url || !String(url).startsWith("https://")) return null;
  const image = document.createElement("img");
  image.src = url;
  image.alt = "";
  image.referrerPolicy = "no-referrer";
  return image;
}

function paymentLine(offer) {
  if (!offer.payment_label || offer.payment_price == null) return null;
  const samePrice = Math.abs(offer.payment_price - offer.price) < 1;
  const text = samePrice
    ? `${offer.payment_label}: mismo precio`
    : `${offer.payment_label}: ${money(offer.payment_price)}`;
  return el("span", "card-line", text);
}

function storeMark(id, name) {
  const wrap = el("span", "store");
  const dot = document.createElement("i");
  dot.style.setProperty("--store", STORE_COLOR[id] || "#0e6a45");
  wrap.append(dot, document.createTextNode(name));
  return wrap;
}

function cityName() {
  const option = citySelect.selectedOptions[0];
  return option ? option.textContent : "Bogotá";
}

function cityNote(report) {
  const name = report.city && report.city.name ? report.city.name : cityName();
  return el("p", "city-note", `Precios para ${name}`);
}

function render(report) {
  results.replaceChildren();
  results.hidden = false;
  results.append(cityNote(report));

  if (!report.verdict) {
    results.append(el("section", "panel", "No encontré precios parecidos a esa búsqueda."));
    renderStores(report.stores);
    return;
  }

  const verdict = report.verdict;
  const card = el("article", "verdict");
  const photo = safeImage(verdict.image);
  if (photo) card.append(photo);
  else card.append(el("div"));

  const copy = el("div");
  copy.append(el("p", "kicker", "Mejor precio de compra"));
  copy.append(el("h2", null, verdict.headline));
  copy.append(el("p", "price", money(verdict.price)));
  copy.append(el("p", "detail", `${verdict.name}. ${verdict.detail}`));
  if (verdict.payment_note) copy.append(el("p", "card-line", verdict.payment_note));
  const buy = el("a", "buy", `Ver en ${verdict.store_name}`);
  buy.href = verdict.url;
  buy.target = "_blank";
  buy.rel = "noreferrer";
  copy.append(buy);
  card.append(copy);
  results.append(card);

  if (report.relaxed) {
    results.append(el("p", "note", "Amplié la búsqueda porque pocos productos coincidían con todas las palabras."));
  }

  if (report.same_product) {
    const panel = el("section", "panel");
    panel.append(el("h3", null, "Mismo producto en varias tiendas"));
    panel.append(el("p", "meta", report.same_product.name));
    const list = el("div", "compare");
    for (const offer of report.same_product.offers) {
      const row = el("div", "compare-row");
      const left = el("div");
      left.append(storeMark(offer.store_id, offer.store_name));
        if (offer.difference === 0) {
          left.append(el("span", "winner-tag", "Mejor precio"));
        }
      const right = el("div", "money");
      right.append(el("strong", null, money(offer.price)));
      const extra = offer.difference === 0 ? "Mejor precio" : `+ ${money(offer.difference)}`;
      const unit = offer.unit_price ? ` · ${money(offer.unit_price)} / ${offer.unit_label}` : "";
      right.append(el("span", null, extra + unit));
      const card = paymentLine(offer);
      if (card) right.append(card);
      const link = el("a", null, "Abrir");
      link.href = offer.url;
      link.target = "_blank";
      link.rel = "noreferrer";
      right.append(link);
      row.append(left, right);
      list.append(row);
    }
    panel.append(list);
    results.append(panel);
  }

  const others = el("section", "panel");
  others.append(el("h3", null, "Ofertas parecidas"));
  const list = el("div", "offers");
  for (const offer of report.offers) {
    const row = el("article", "offer");
    const photo = safeImage(offer.image);
    row.append(photo || el("div"));
    const info = el("div");
    info.append(el("h4", null, offer.name));
    const bits = [offer.store_name];
    if (offer.brand) bits.push(offer.brand);
    if (offer.unit_price) bits.push(`${money(offer.unit_price)} / ${offer.unit_label}`);
    info.append(el("p", "meta", bits.join(" · ")));
    const link = el("a", null, "Ver producto");
    link.href = offer.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    info.append(link);
    const price = el("div", "money");
    price.append(el("strong", null, money(offer.price)));
    if (offer.list_price) price.append(el("span", "was", money(offer.list_price)));
    const card = paymentLine(offer);
    if (card) price.append(card);
    row.append(info, price);
    list.append(row);
  }
  others.append(list);
  results.append(others);
  renderStores(report.stores);
}

function renderUnit(report) {
  results.replaceChildren();
  results.hidden = false;
  results.append(cityNote(report));
  if (!report.verdict) {
    results.append(el("section", "panel", "No encontré productos con cantidad, peso o volumen para comparar."));
    renderStores(report.stores);
    return;
  }
  const verdict = report.verdict;
  const card = el("article", "verdict");
  card.append(safeImage(verdict.image) || el("div"));
  const copy = el("div");
  copy.append(el("p", "kicker", verdict.kicker));
  copy.append(el("h2", null, verdict.headline));
  copy.append(el("p", "price", moneyExact(verdict.unit_price)));
  copy.append(el("p", "detail", verdict.detail));
  if (verdict.payment_note) copy.append(el("p", "card-line", verdict.payment_note));
  const buy = el("a", "buy", `Ver en ${verdict.store_name}`);
  buy.href = verdict.url;
  buy.target = "_blank";
  buy.rel = "noreferrer";
  copy.append(buy);
  card.append(copy);
  results.append(card);

  if (report.relaxed) {
    results.append(el("p", "note", "Amplié la búsqueda porque pocos productos coincidían con todas las palabras."));
  }
  if (report.unmeasured) {
    const count = report.unmeasured;
    results.append(el("p", "note", `${count} producto${count === 1 ? "" : "s"} quedaron fuera porque el nombre no dice cuántas unidades, gramos o mililitros trae.`));
  }

  const others = el("section", "panel");
  others.append(el("h3", null, `De menor a mayor por ${verdict.unit_label}`));
  const list = el("div", "offers");
  const ranked = report.offers.slice().sort((a, b) => {
    const byUnit = a.unit_price - b.unit_price;
    if (Math.abs(byUnit) > 0.0001) return byUnit;
    const packA = a.from_card && a.payment_price != null ? a.payment_price : a.price;
    const packB = b.from_card && b.payment_price != null ? b.payment_price : b.price;
    return packA - packB;
  });
  for (const offer of ranked) {
    const row = el("article", "offer");
    row.append(safeImage(offer.image) || el("div"));
    const info = el("div");
    info.append(el("h4", null, offer.name));
    info.append(el("p", "meta", `${offer.store_name} · ${offer.unit_quantity_label}`));
    const link = el("a", null, "Ver producto");
    link.href = offer.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    info.append(link);
    const price = el("div", "money");
    price.append(el("strong", null, moneyExact(offer.unit_price)));
    price.append(el("span", null, `por ${offer.unit_label}`));
    if (offer.from_card && offer.payment_price != null) {
      price.append(el("span", "card-line", `${offer.payment_label}: empaque ${money(offer.payment_price)}`));
    } else {
      price.append(el("span", null, `Empaque ${money(offer.price)}`));
    }
    row.append(info, price);
    list.append(row);
  }
  others.append(list);
  results.append(others);
  renderStores(report.stores);
}

function renderStores(stores) {
  const panel = el("section", "panel");
  panel.append(el("h3", null, "Tiendas consultadas"));
  const wrap = el("div", "stores");
  for (const store of stores) {
    let label = store.name;
    let kind = "ok";
    if (store.error) {
      label = `${store.name}: ${store.error}`;
      kind = "bad";
    } else if (!store.count) {
      label = `${store.name}: sin resultados`;
      kind = "";
    } else if (store.listTotal) {
      label = `${store.name}: respondió en ${store.count} de ${store.listTotal}`;
    } else {
      label = `${store.name}: ${store.count} producto${store.count === 1 ? "" : "s"}`;
    }
    wrap.append(el("span", `pill ${kind}`, label));
  }
  panel.append(wrap);
  results.append(panel);
}

function renderInternational(report) {
  results.replaceChildren();
  results.hidden = false;
  if (!report.verdict) {
    results.append(el("section", "panel", "No encontré productos internacionales parecidos a esa búsqueda."));
    renderStores(report.stores);
    return;
  }
  const verdict = report.verdict;
  const card = el("article", "verdict");
  const photo = safeImage(verdict.image);
  card.append(photo || el("div"));
  const copy = el("div");
  copy.append(el("p", "kicker", verdict.kicker));
  copy.append(el("h2", null, verdict.headline));
  copy.append(el("p", "price", money(verdict.total != null ? verdict.total : verdict.price)));
  copy.append(el("p", "detail", verdict.detail));
  const buy = el("a", "buy", `Ver en ${verdict.store_name}`);
  buy.href = verdict.url;
  buy.target = "_blank";
  buy.rel = "noreferrer";
  copy.append(buy);
  card.append(copy);
  results.append(card);

  if (report.relaxed) {
    results.append(el("p", "note", "Amplié la búsqueda porque pocos productos coincidían con todas las palabras."));
  }

  const others = el("section", "panel");
  others.append(el("h3", null, "Productos parecidos"));
  const list = el("div", "offers");
  for (const offer of report.offers) {
    const row = el("article", "offer");
    row.append(safeImage(offer.image) || el("div"));
    const info = el("div");
    info.append(el("h4", null, offer.name));
    info.append(el("p", "meta", `${offer.store_name} · ${shipText(offer)}`));
    const link = el("a", null, "Ver producto");
    link.href = offer.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    info.append(link);
    const price = el("div", "money");
    price.append(el("strong", null, money(offer.total != null ? offer.total : offer.price)));
    price.append(el("span", null, offer.total != null ? `Producto ${money(offer.price)}` : "Sin flete"));
    row.append(info, price);
    list.append(row);
  }
  others.append(list);
  results.append(others);
  renderStores(report.stores);
}

function shipText(offer) {
  if (offer.ships_to_colombia === false) return "No envía a Colombia";
  if (offer.shipping_cost === 0) return "Envío gratis a Colombia";
  if (offer.shipping_cost != null) return `Envío ${money(offer.shipping_cost)}`;
  return offer.shipping_note || "Flete por confirmar";
}

function setMode(next) {
  mode = next;
  const config = MODES[mode];
  document.querySelectorAll(".tab").forEach((tab) => {
    const selected = tab.dataset.mode === mode;
    tab.classList.toggle("is-active", selected);
    tab.setAttribute("aria-selected", selected ? "true" : "false");
  });
  queryInput.placeholder = config.placeholder;
  lead.textContent = config.lead;
  cityRow.hidden = mode === "intl";
  const isList = mode === "list";
  singleSearch.hidden = isList;
  listEditor.hidden = !isList;
  queryInput.required = !isList;
  examples.hidden = isList;
  footnote.textContent = config.footnote.replaceAll("{ciudad}", cityName());
  examples.replaceChildren();
  for (const [query, label] of config.examples) {
    const button = el("button", null, label);
    button.type = "button";
    button.dataset.query = query;
    examples.append(button);
  }
  results.hidden = true;
  results.replaceChildren();
  status.textContent = "";
}

async function search(query) {
  const config = MODES[mode];
  submit.disabled = true;
  status.textContent = config.status.replaceAll("{ciudad}", cityName());
  results.hidden = true;
  try {
    const cityQuery = mode === "intl" ? "" : `&ciudad=${encodeURIComponent(citySelect.value || "bogota")}`;
    const response = await fetch(`${config.endpoint}?q=${encodeURIComponent(query)}${cityQuery}`);
    if (!response.ok) {
      throw new Error("No pude completar la búsqueda");
    }
    const report = await response.json();
    status.textContent = "";
    if (mode === "intl") renderInternational(report);
    else if (mode === "unit") renderUnit(report);
    else render(report);
  } catch (error) {
    status.textContent = error.message || "Falló la búsqueda";
  } finally {
    submit.disabled = false;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (mode === "list") {
    searchList();
    return;
  }
  const query = queryInput.value.trim();
  if (query.length >= 2) search(query);
});

function readList() {
  return [...listRows.querySelectorAll(".list-row")].map((row) => ({
    nombre: row.querySelector('[name="nombre"]').value.trim(),
    marca: row.querySelector('[name="marca"]').value.trim() || "TODAS",
    formato: row.querySelector('[name="formato"]').value,
    cantidad: Number(row.querySelector('[name="cantidad"]').value),
  }));
}

function saveList() {
  localStorage.setItem(LIST_KEY, JSON.stringify(readList()));
}

function field(labelText, control) {
  const wrap = el("label", "list-field");
  wrap.append(el("span", null, labelText), control);
  return wrap;
}

function listRow(item) {
  const row = el("div", "list-row");
  const name = document.createElement("input");
  name.name = "nombre";
  name.type = "text";
  name.placeholder = "Arroz";
  name.maxLength = 60;
  name.autocomplete = "off";
  name.value = item.nombre || "";

  const brand = document.createElement("input");
  brand.name = "marca";
  brand.type = "text";
  brand.placeholder = "TODAS";
  brand.maxLength = 40;
  brand.autocomplete = "off";
  brand.setAttribute("list", "brand-options");
  brand.value = item.marca && item.marca.toUpperCase() !== "TODAS" ? item.marca : "";

  const format = document.createElement("select");
  format.name = "formato";
  for (const [value, label] of FORMATS) {
    const option = el("option", null, label);
    option.value = value;
    format.append(option);
  }
  format.value = item.formato || "gramos";

  const amount = document.createElement("input");
  amount.name = "cantidad";
  amount.type = "number";
  amount.inputMode = "decimal";
  amount.min = "1";
  amount.step = "any";
  amount.placeholder = "1000";
  amount.value = item.cantidad || "";

  const remove = el("button", "remove-row", "Quitar");
  remove.type = "button";
  remove.addEventListener("click", () => {
    row.remove();
    if (!listRows.children.length) listRows.append(listRow({ formato: "gramos" }));
    saveList();
    updateAddRow();
  });

  row.append(
    field("Nombre", name),
    field("Marca", brand),
    field("Formato", format),
    field("Cantidad", amount),
    remove,
  );
  row.addEventListener("input", saveList);
  row.addEventListener("change", saveList);
  return row;
}

function updateAddRow() {
  addRow.disabled = listRows.children.length >= LIST_MAX;
}

function loadList() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(LIST_KEY) || "null");
  } catch (error) {
    saved = null;
  }
  const items = Array.isArray(saved) && saved.length ? saved.slice(0, LIST_MAX) : DEFAULT_LIST;
  listRows.replaceChildren(...items.map(listRow));
  const brands = document.createElement("datalist");
  brands.id = "brand-options";
  const option = document.createElement("option");
  option.value = "TODAS";
  brands.append(option);
  listEditor.append(brands);
  updateAddRow();
}

addRow.addEventListener("click", () => {
  if (listRows.children.length >= LIST_MAX) return;
  const row = listRow({ formato: "gramos" });
  listRows.append(row);
  row.querySelector('[name="nombre"]').focus();
  saveList();
  updateAddRow();
});

const accountOut = document.querySelector("#account-out");
const accountIn = document.querySelector("#account-in");
const accountNameField = document.querySelector("#account-name-field");
const accountName = document.querySelector("#account-name");
const accountContact = document.querySelector("#account-contact");
const accountSubmit = document.querySelector("#account-submit");
const accountHello = document.querySelector("#account-hello");
const accountStatus = document.querySelector("#account-status");
const accountFields = accountOut.querySelector(".account-fields");
const savedSelect = document.querySelector("#saved-select");
const savedName = document.querySelector("#saved-name");
const savedSave = document.querySelector("#saved-save");
const savedDelete = document.querySelector("#saved-delete");
let accountMode = "register";
let savedLists = [];

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data && data.detail;
    const error = new Error(typeof detail === "string" ? detail : "Revisa los datos e intenta de nuevo.");
    error.status = response.status;
    throw error;
  }
  return data;
}

function setRows(items) {
  listRows.replaceChildren(...items.slice(0, LIST_MAX).map(listRow));
  saveList();
  updateAddRow();
}

function setAccountMode(next) {
  accountMode = next;
  accountOut.querySelectorAll("[data-account]").forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.account === next);
  });
  const isLogin = next === "login";
  accountNameField.hidden = isLogin;
  accountFields.classList.toggle("is-login", isLogin);
  accountSubmit.textContent = isLogin ? "Entrar" : "Inscribirme";
  accountStatus.textContent = "";
}

function showLoggedOut(message = "") {
  savedLists = [];
  accountIn.hidden = true;
  accountOut.hidden = false;
  accountStatus.textContent = message;
}

function showLoggedIn(user) {
  accountOut.hidden = true;
  accountIn.hidden = false;
  accountHello.textContent = `Hola, ${user.nombre}`;
  accountStatus.textContent = "";
}

function renderSaved(selectedId = "") {
  savedSelect.replaceChildren();
  const fresh = el("option", null, "Nueva lista (sin guardar)");
  fresh.value = "";
  savedSelect.append(fresh);
  for (const saved of savedLists) {
    const option = el("option", null, `${saved.nombre} · ${saved.items.length} productos`);
    option.value = String(saved.id);
    savedSelect.append(option);
  }
  savedSelect.value = String(selectedId);
  const current = savedLists.find((saved) => String(saved.id) === savedSelect.value);
  savedName.value = current ? current.nombre : "";
  savedDelete.hidden = !current;
}

async function loadSavedLists(selectedId = "") {
  savedLists = await api("/api/listas");
  renderSaved(selectedId);
}

async function loadAccount() {
  try {
    const user = await api("/api/yo");
    showLoggedIn(user);
    await loadSavedLists();
  } catch (error) {
    if (error.status === 401) showLoggedOut();
    else {
      showLoggedOut(error.status === 503 ? error.message : "No pude revisar tu cuenta.");
      accountSubmit.disabled = error.status === 503;
    }
  }
}

async function submitAccount() {
  const contacto = accountContact.value.trim();
  const nombre = accountName.value.trim();
  if (accountMode === "register" && nombre.length < 2) {
    accountStatus.textContent = "Escribe tu nombre.";
    accountName.focus();
    return;
  }
  if (contacto.length < 5) {
    accountStatus.textContent = "Escribe tu correo o teléfono.";
    accountContact.focus();
    return;
  }
  accountSubmit.disabled = true;
  try {
    const user = accountMode === "register"
      ? await api("/api/usuarios", { method: "POST", body: JSON.stringify({ nombre, contacto }) })
      : await api("/api/sesion", { method: "POST", body: JSON.stringify({ contacto }) });
    accountContact.value = "";
    accountName.value = "";
    showLoggedIn(user);
    await loadSavedLists();
    accountStatus.textContent = savedLists.length
      ? "Elige una de tus listas o guarda la actual."
      : "Ponle un nombre a la lista y toca Guardar.";
  } catch (error) {
    accountStatus.textContent = error.message;
  } finally {
    accountSubmit.disabled = false;
  }
}

function applyCity(cityId) {
  if (![...citySelect.options].some((option) => option.value === cityId)) return;
  citySelect.value = cityId;
  localStorage.setItem(CITY_KEY, cityId);
  footnote.textContent = MODES[mode].footnote.replaceAll("{ciudad}", cityName());
}

async function saveCurrentList() {
  const nombre = savedName.value.trim();
  const items = readList().filter((item) => item.nombre.length >= 2);
  if (!nombre) {
    accountStatus.textContent = "Ponle un nombre a la lista.";
    savedName.focus();
    return;
  }
  if (!items.length) {
    accountStatus.textContent = "Escribe al menos un producto con nombre.";
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
    const body = JSON.stringify({ nombre, ciudad: citySelect.value || "bogota", items });
    const saved = id
      ? await api(`/api/listas/${id}`, { method: "PUT", body })
      : await api("/api/listas", { method: "POST", body });
    await loadSavedLists(saved.id);
    accountStatus.textContent = `Guardé «${saved.nombre}».`;
  } catch (error) {
    if (error.status === 401) showLoggedOut("Tu sesión terminó. Entra de nuevo.");
    else accountStatus.textContent = error.message;
  } finally {
    savedSave.disabled = false;
  }
}

accountOut.querySelectorAll("[data-account]").forEach((chip) => {
  chip.addEventListener("click", () => setAccountMode(chip.dataset.account));
});
accountSubmit.addEventListener("click", submitAccount);
for (const input of [accountName, accountContact]) {
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    submitAccount();
  });
}
savedName.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  saveCurrentList();
});
savedSave.addEventListener("click", saveCurrentList);

savedSelect.addEventListener("change", () => {
  const current = savedLists.find((saved) => String(saved.id) === savedSelect.value);
  renderSaved(savedSelect.value);
  accountStatus.textContent = "";
  if (!current) return;
  setRows(current.items);
  applyCity(current.ciudad);
  results.hidden = true;
  status.textContent = "";
});

savedDelete.addEventListener("click", async () => {
  const current = savedLists.find((saved) => String(saved.id) === savedSelect.value);
  if (!current || !window.confirm(`¿Borrar la lista «${current.nombre}»?`)) return;
  try {
    await api(`/api/listas/${current.id}`, { method: "DELETE" });
    await loadSavedLists();
    accountStatus.textContent = `Borré «${current.nombre}». Los productos siguen en pantalla.`;
  } catch (error) {
    accountStatus.textContent = error.message;
  }
});

document.querySelector("#account-logout").addEventListener("click", async () => {
  try {
    await api("/api/sesion", { method: "DELETE" });
  } catch (error) {
    accountStatus.textContent = error.message;
    return;
  }
  setAccountMode("login");
  showLoggedOut("Saliste. Tus listas quedan guardadas.");
});

async function searchList() {
  const items = readList().filter((item) => item.nombre.length >= 2);
  const invalid = items.find((item) => !(item.cantidad > 0));
  if (!items.length) {
    status.textContent = "Escribe al menos un producto con nombre.";
    return;
  }
  if (invalid) {
    status.textContent = `Falta la cantidad de ${invalid.nombre}.`;
    return;
  }
  const config = MODES.list;
  listSubmit.disabled = true;
  status.textContent = config.status.replace("{n}", items.length).replaceAll("{ciudad}", cityName());
  results.hidden = true;
  try {
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ciudad: citySelect.value || "bogota", items }),
    });
    if (!response.ok) throw new Error("No pude comparar la lista. Revisa nombres y cantidades.");
    const report = await response.json();
    status.textContent = "";
    renderList(report);
  } catch (error) {
    status.textContent = error.message || "Falló la búsqueda";
  } finally {
    listSubmit.disabled = false;
  }
}

function renderList(report) {
  results.replaceChildren();
  results.hidden = false;
  results.append(cityNote(report));

  const card = el("article", "verdict list-verdict");
  const copy = el("div");
  copy.append(el("p", "kicker", "Lista de compras"));
  copy.append(el("h2", null, report.found ? "Comprando cada producto donde sale más barato" : "No encontré los productos de la lista"));
  if (report.found) copy.append(el("p", "price", money(report.total)));
  let summary = `Encontré ${report.found} de ${report.count} productos con el formato que pediste.`;
  if (report.missing.length) summary += ` Sin resultado: ${report.missing.join(", ")}.`;
  copy.append(el("p", "detail", summary));
  const single = report.best_single_store;
  if (single && report.found === report.count) {
    const diff = single.total - report.total;
    const text = diff > 0.5
      ? `Toda la lista en ${single.store_name}: ${money(single.total)} (${money(diff)} más, pero en una sola tienda).`
      : `Toda la lista en ${single.store_name}: ${money(single.total)}.`;
    copy.append(el("p", "card-line", text));
  }
  card.append(copy);
  results.append(card);

  const panel = el("section", "panel");
  panel.append(el("h3", null, "Producto por producto"));
  const list = el("div", "offers");
  for (const item of report.items) {
    const row = el("article", "offer list-item");
    const winner = item.winner;
    row.append((winner && safeImage(winner.image)) || el("div"));
    const info = el("div");
    info.append(el("p", "list-label", item.label));
    if (!winner) {
      info.append(el("p", "note", "No encontré ese producto con la marca y el formato pedidos."));
      row.append(info, el("div"));
      list.append(row);
      continue;
    }
    info.append(el("h4", null, winner.name));
    const meta = el("p", "meta");
    meta.append(storeMark(winner.store_id, winner.store_name));
    info.append(meta);
    info.append(el("p", "meta", item.detail));
    const link = el("a", null, "Ver producto");
    link.href = winner.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    info.append(link);
    if (item.options.length) {
      const others = el("ul", "list-options");
      for (const option of item.options) {
        others.append(el("li", null, `${option.store_name}: ${money(option.total)} · ${option.name}`));
      }
      info.append(el("p", "list-options-title", "Otras opciones, no se suman al total:"), others);
    }
    const price = el("div", "money");
    price.append(el("strong", null, money(winner.total)));
    price.append(el("span", null, `${moneyExact(winner.unit_price)} por ${winner.unit_label}`));
    if (winner.from_card) price.append(el("span", "card-line", winner.payment_label));
    row.append(info, price);
    list.append(row);
  }
  panel.append(list);
  results.append(panel);

  const stores = el("section", "panel");
  stores.append(el("h3", null, "Toda la lista en una sola tienda"));
  const compare = el("div", "compare");
  for (const store of report.single_store) {
    const row = el("div", "compare-row");
    row.append(storeMark(store.store_id, store.store_name));
    const right = el("div", "money");
    if (!store.missing.length) {
      right.append(el("strong", null, money(store.total)));
    } else if (store.total == null) {
      right.append(el("span", null, "Ningún producto de la lista"));
    } else {
      right.append(el("strong", null, money(store.total)));
      right.append(el("span", null, `Le falta: ${store.missing.join(", ")}`));
    }
    row.append(right);
    compare.append(row);
  }
  stores.append(compare);
  results.append(stores);

  renderStores(report.stores.map((store) => ({ ...store, listTotal: report.count })));
}

examples.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  queryInput.value = button.dataset.query;
  search(button.dataset.query);
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => setMode(tab.dataset.mode));
});

citySelect.addEventListener("change", () => {
  localStorage.setItem(CITY_KEY, citySelect.value);
  const config = MODES[mode];
  footnote.textContent = config.footnote.replaceAll("{ciudad}", cityName());
});

async function loadCities() {
  const saved = localStorage.getItem(CITY_KEY) || "bogota";
  try {
    const response = await fetch("/api/ciudades");
    if (!response.ok) return;
    const cities = await response.json();
    citySelect.replaceChildren();
    for (const city of cities) {
      const option = el("option", null, city.name);
      option.value = city.id;
      citySelect.append(option);
    }
  } catch (error) {
    return;
  }
  if ([...citySelect.options].some((option) => option.value === saved)) {
    citySelect.value = saved;
  }
  const config = MODES[mode];
  footnote.textContent = config.footnote.replaceAll("{ciudad}", cityName());
}

loadList();
setMode(mode);
loadCities();
loadAccount();
