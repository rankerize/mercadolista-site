import {
  loginWithGoogle,
  subscribeAuth,
  saveUserList,
  getUserLists,
  type SavedList,
  type ListItemData,
} from '../lib/firebaseAuth';
import type { User } from 'firebase/auth';

const LIST_KEY = 'comparador-lista';

interface Prod {
  name: string;
  store_name?: string;
  price?: number;
  image?: string;
}

let pending: Prod | null = null;
let currentUid: string | null = null;
let currentUser: User | null = null;
let userLists: SavedList[] = [];

function money(v: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(v);
}

function readLocal(): ListItemData[] {
  try { return JSON.parse(localStorage.getItem(LIST_KEY) || '[]') ?? []; }
  catch { return []; }
}

function writeLocal(items: ListItemData[]) {
  localStorage.setItem(LIST_KEY, JSON.stringify(items));
}

function getModal() { return document.getElementById('add-to-list-modal'); }

function closeModal() { getModal()?.classList.remove('is-open'); }

function showSection(id: string) {
  for (const sid of ['add-modal-auth-lists', 'add-modal-auth-nolists', 'add-modal-guest', 'add-modal-feedback']) {
    const el = document.getElementById(sid);
    if (el) el.hidden = sid !== id;
  }
}

function populateLists() {
  const sel = document.getElementById('add-modal-existing-select') as HTMLSelectElement | null;
  if (!sel) return;
  sel.innerHTML = '';
  userLists.forEach((l) => {
    const opt = document.createElement('option');
    opt.value = l.id;
    opt.textContent = l.nombre;
    sel.appendChild(opt);
  });
}

export function openCatAddModal(prod: Prod) {
  const modal = getModal();
  if (!modal) return;
  pending = prod;

  // Populate product info
  const thumb = document.getElementById('add-modal-thumb');
  const prodName = document.getElementById('add-modal-prod-name');
  const prodMeta = document.getElementById('add-modal-prod-meta');
  const qtyInput = document.getElementById('add-modal-qty') as HTMLInputElement | null;
  const feedbackEl = document.getElementById('add-modal-feedback');

  if (thumb) {
    thumb.innerHTML = '';
    if (prod.image) {
      const img = document.createElement('img');
      img.src = prod.image;
      img.alt = prod.name;
      img.width = 48; img.height = 48;
      img.style.cssText = 'width:48px;height:48px;object-fit:contain;border-radius:6px;';
      thumb.appendChild(img);
    }
  }
  if (prodName) prodName.textContent = prod.name;
  if (prodMeta) {
    const parts: string[] = [];
    if (prod.store_name) parts.push(prod.store_name);
    if (prod.price) parts.push(money(prod.price));
    prodMeta.textContent = parts.join(' · ') || 'Producto de supermercado';
  }
  if (qtyInput) qtyInput.value = '1';
  if (feedbackEl) feedbackEl.hidden = true;

  // Show correct auth section
  if (currentUid) {
    populateLists();
    showSection(userLists.length > 0 ? 'add-modal-auth-lists' : 'add-modal-auth-nolists');
  } else {
    showSection('add-modal-guest');
  }

  modal.classList.add('is-open');
}

function initListeners() {
  const modal = getModal();
  if (!modal) return;

  const feedbackMsg = document.getElementById('add-modal-feedback-msg');
  const qtyInput = document.getElementById('add-modal-qty') as HTMLInputElement | null;
  const formatSelect = document.getElementById('add-modal-format') as HTMLSelectElement | null;
  const destExisting = document.getElementById('add-dest-existing') as HTMLInputElement | null;
  const destNew = document.getElementById('add-dest-new') as HTMLInputElement | null;
  const existingSelect = document.getElementById('add-modal-existing-select') as HTMLSelectElement | null;
  const newNameInput = document.getElementById('add-modal-new-name') as HTMLInputElement | null;
  const firstNameInput = document.getElementById('add-modal-first-name') as HTMLInputElement | null;

  function showSuccess(msg: string) {
    if (feedbackMsg) feedbackMsg.textContent = msg;
    showSection('add-modal-feedback');
  }

  function makeItem(): ListItemData {
    return {
      nombre: pending?.name ?? '',
      marca: 'TODAS',
      formato: (formatSelect?.value ?? 'unidades') as ListItemData['formato'],
      cantidad: Number(qtyInput?.value) || 1,
      comprado: false,
    };
  }

  // Close
  document.getElementById('add-modal-close')?.addEventListener('click', closeModal);
  document.getElementById('add-modal-continue')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  // Go to list on main page
  document.getElementById('add-modal-go-list')?.addEventListener('click', () => {
    closeModal();
    window.location.href = '/#lista';
  });

  // Toggle existing / new radio
  destExisting?.addEventListener('change', () => {
    if (existingSelect) existingSelect.disabled = false;
    if (newNameInput) newNameInput.disabled = true;
  });
  destNew?.addEventListener('change', () => {
    if (existingSelect) existingSelect.disabled = true;
    if (newNameInput) { newNameInput.disabled = false; newNameInput.focus(); }
  });

  // Guest: add local
  document.getElementById('add-modal-add-local')?.addEventListener('click', () => {
    const items = readLocal();
    items.push(makeItem());
    writeLocal(items);
    showSuccess('¡Agregado a tu canasta! Puedes verlo en la página principal.');
  });

  // Guest: login
  document.getElementById('add-modal-login-btn')?.addEventListener('click', async () => {
    try {
      const user = await loginWithGoogle();
      currentUid = user.uid;
      currentUser = user;
      userLists = await getUserLists(user.uid, user.email ?? undefined);
      populateLists();
      showSection(userLists.length > 0 ? 'add-modal-auth-lists' : 'add-modal-auth-nolists');
    } catch { /* user cancelled */ }
  });

  // Auth: save to existing or new list
  document.getElementById('add-modal-submit-auth')?.addEventListener('click', async () => {
    if (!pending || !currentUid || !currentUser) return;
    const isNew = destNew?.checked ?? false;
    const item = makeItem();

    if (isNew) {
      const name = newNameInput?.value.trim() ?? '';
      if (!name) { alert('Escribe un nombre para la nueva lista'); return; }
      try {
        await saveUserList(
          currentUid,
          { nombre: name, ciudad: 'bogota', items: [item] },
          undefined,
          { displayName: currentUser.displayName, email: currentUser.email },
        );
        userLists = await getUserLists(currentUid, currentUser.email ?? undefined);
        showSuccess(`¡Lista «${name}» creada y producto guardado!`);
      } catch (err: any) { alert(err.message || 'Error al crear la lista.'); }
    } else {
      const targetId = existingSelect?.value ?? '';
      const target = userLists.find((l) => l.id === targetId);
      if (!target) return;
      try {
        const items = [...(target.items ?? []), item];
        await saveUserList(
          currentUid,
          { nombre: target.nombre, ciudad: target.ciudad || 'bogota', items },
          target.id,
          { displayName: currentUser.displayName, email: currentUser.email },
        );
        showSuccess(`¡Producto guardado en «${target.nombre}»!`);
      } catch (err: any) { alert(err.message || 'Error al guardar.'); }
    }
  });

  // Auth no-lists: create first list
  document.getElementById('add-modal-submit-first')?.addEventListener('click', async () => {
    if (!pending || !currentUid || !currentUser) return;
    const name = firstNameInput?.value.trim() ?? '';
    if (!name) { alert('Escribe un nombre para tu lista'); return; }
    try {
      await saveUserList(
        currentUid,
        { nombre: name, ciudad: 'bogota', items: [makeItem()] },
        undefined,
        { displayName: currentUser.displayName, email: currentUser.email },
      );
      userLists = await getUserLists(currentUid, currentUser.email ?? undefined);
      showSuccess(`¡Lista «${name}» creada!`);
    } catch (err: any) { alert(err.message || 'Error al crear la lista.'); }
  });
}

// Subscribe to auth state and init listeners when DOM ready
subscribeAuth(async (user) => {
  currentUid = user?.uid ?? null;
  currentUser = user ?? null;
  if (currentUid) {
    userLists = await getUserLists(currentUid, user?.email ?? undefined);
  } else {
    userLists = [];
  }
});

document.addEventListener('DOMContentLoaded', initListeners);
