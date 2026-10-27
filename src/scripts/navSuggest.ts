// Sugerencias del buscador del nav: categorías, colecciones, páginas y "Buscar X".
// El panel vive en <body> con posición fija para que el overflow del formulario no lo recorte.

interface Suggestion {
  type: 'buscar' | 'coleccion' | 'categoria' | 'pagina';
  label: string;
  sublabel?: string;
  icono: string;
  url: string;
}

const TYPE_BADGE: Record<Suggestion['type'], string> = {
  buscar: 'Búsqueda',
  coleccion: 'Colección',
  categoria: 'Categoría',
  pagina: 'Página',
};

const DEBOUNCE_MS = 150;

export function initNavSuggest(): void {
  const input = document.getElementById('ml-nav-q') as HTMLInputElement | null;
  const form = document.getElementById('ml-nav-search') as HTMLFormElement | null;
  if (!input || !form) return;

  const panel = document.createElement('div');
  panel.id = 'ml-nav-suggest';
  panel.className = 'autocomplete-dropdown ml-nav-suggest';
  panel.setAttribute('role', 'listbox');
  document.body.append(panel);

  let items: Suggestion[] = [];
  let active = -1;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let controller: AbortController | null = null;

  function place() {
    const rect = form!.getBoundingClientRect();
    panel.style.left = `${rect.left + window.scrollX}px`;
    panel.style.top = `${rect.bottom + window.scrollY + 6}px`;
    panel.style.width = `${rect.width}px`;
  }

  function close() {
    panel.classList.remove('is-open');
    panel.replaceChildren();
    items = [];
    active = -1;
  }

  function go(s: Suggestion) {
    close();
    window.location.href = s.url;
  }

  function highlight() {
    panel.querySelectorAll<HTMLElement>('.autocomplete-item').forEach((el, i) => {
      el.classList.toggle('is-selected', i === active);
    });
  }

  function render(list: Suggestion[]) {
    panel.replaceChildren();
    items = list;
    active = -1;
    if (!items.length) {
      close();
      return;
    }

    items.forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'autocomplete-item';
      row.setAttribute('role', 'option');
      row.dataset.index = String(i);

      const left = document.createElement('div');
      left.className = 'autocomplete-item-left';

      const icon = document.createElement('span');
      icon.className = 'autocomplete-item-icon';
      icon.textContent = s.icono;

      const text = document.createElement('span');
      text.className = 'autocomplete-item-text';
      const strong = document.createElement('strong');
      strong.textContent = s.label;
      text.append(strong);
      if (s.sublabel) {
        const em = document.createElement('em');
        em.className = 'autocomplete-item-sub';
        em.textContent = ` ${s.sublabel}`;
        text.append(em);
      }

      left.append(icon, text);

      const badge = document.createElement('span');
      badge.className = `autocomplete-item-cat autocomplete-type-${s.type}`;
      badge.textContent = TYPE_BADGE[s.type];

      row.append(left, badge);
      // mousedown (no click) para elegir antes de que el input pierda el foco
      row.addEventListener('mousedown', (e) => {
        e.preventDefault();
        go(s);
      });
      panel.append(row);
    });

    place();
    panel.classList.add('is-open');
  }

  async function fetchSuggestions(q: string) {
    controller?.abort();
    controller = new AbortController();
    try {
      const res = await fetch(`/api/sugerencias?q=${encodeURIComponent(q)}`, { signal: controller.signal });
      if (!res.ok) return close();
      const data = (await res.json()) as { suggestions: Suggestion[] };
      // Si el usuario ya cambió el texto, no mostramos resultados viejos
      if (input!.value.trim() !== q) return;
      render(data.suggestions);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') close();
    }
  }

  input.addEventListener('input', () => {
    const q = input.value.trim();
    if (timer) clearTimeout(timer);
    if (q.length < 2) {
      controller?.abort();
      close();
      return;
    }
    timer = setTimeout(() => fetchSuggestions(q), DEBOUNCE_MS);
  });

  input.addEventListener('keydown', (e) => {
    const open = panel.classList.contains('is-open') && items.length > 0;
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      active = (active + 1) % items.length;
      highlight();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      active = active <= 0 ? items.length - 1 : active - 1;
      highlight();
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      go(items[active]);
    } else if (e.key === 'Escape') {
      close();
    }
  });

  input.addEventListener('blur', () => setTimeout(close, 150));
  form.addEventListener('submit', close);
  window.addEventListener('resize', () => { if (panel.classList.contains('is-open')) place(); });
  window.addEventListener('scroll', () => { if (panel.classList.contains('is-open')) place(); }, { passive: true });
}
