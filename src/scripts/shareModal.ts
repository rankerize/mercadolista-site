import { shareListWithEmail } from '../lib/firebaseAuth';

export interface ShareModalOptions {
  listId: string;
  listName: string;
}

export function initShareModal(): (options: ShareModalOptions) => void {
  const modal = document.querySelector<HTMLElement>('#share-modal');
  if (!modal) return () => {};

  const modalClose = modal.querySelector<HTMLButtonElement>('#share-modal-close')!;
  const title = modal.querySelector<HTMLElement>('#share-modal-title')!;
  const countrySelect = modal.querySelector<HTMLSelectElement>('#share-country')!;
  const phoneInput = modal.querySelector<HTMLInputElement>('#share-phone')!;
  const sendWhatsappBtn = modal.querySelector<HTMLButtonElement>('#share-send-whatsapp')!;
  const whatsappEmptyLink = modal.querySelector<HTMLAnchorElement>('#share-whatsapp-empty')!;
  const linkInput = modal.querySelector<HTMLInputElement>('#share-link-input')!;
  const copyBtn = modal.querySelector<HTMLButtonElement>('#share-copy-btn')!;
  const emailInput = modal.querySelector<HTMLInputElement>('#share-email-input')!;
  const emailBtn = modal.querySelector<HTMLButtonElement>('#share-email-btn')!;
  const emailFeedback = modal.querySelector<HTMLElement>('#share-email-feedback')!;

  let currentListId = '';
  let currentListName = '';

  function closeModal() {
    modal?.classList.remove('is-open');
    if (emailFeedback) {
      emailFeedback.hidden = true;
      emailFeedback.textContent = '';
    }
    if (copyBtn) {
      copyBtn.textContent = 'Copiar';
    }
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  // Copiar link
  copyBtn.addEventListener('click', async () => {
    if (!linkInput.value) return;
    try {
      await navigator.clipboard.writeText(linkInput.value);
      copyBtn.textContent = '¡Copiado! ✓';
      setTimeout(() => {
        copyBtn.textContent = 'Copiar';
      }, 2500);
    } catch {
      linkInput.select();
      document.execCommand('copy');
      copyBtn.textContent = '¡Copiado! ✓';
    }
  });

  // Enviar WhatsApp con número
  sendWhatsappBtn.addEventListener('click', () => {
    const rawPhone = phoneInput.value.replace(/[^0-9]/g, '');
    const code = countrySelect.value;
    const fullPhone = rawPhone ? `${code}${rawPhone}` : '';
    const shareUrl = `${window.location.origin}/?listaId=${currentListId}`;
    const msg = `🛒 ¡Hola! Te comparto nuestra lista de compras «${currentListName}» para comparar precios y editarla juntos:\n${shareUrl}`;

    const target = fullPhone
      ? `https://api.whatsapp.com/send?phone=${encodeURIComponent(fullPhone)}&text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;

    window.open(target, '_blank');
  });

  // Abrir WhatsApp sin número (elegir chat)
  whatsappEmptyLink.addEventListener('click', (e) => {
    e.preventDefault();
    const shareUrl = `${window.location.origin}/?listaId=${currentListId}`;
    const msg = `🛒 ¡Hola! Te comparto nuestra lista de compras «${currentListName}» para comparar precios y editarla juntos:\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  });

  // Invitar por correo
  emailBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    if (!email || !email.includes('@')) {
      if (emailFeedback) {
        emailFeedback.style.color = 'var(--clay)';
        emailFeedback.textContent = 'Por favor ingresa un correo válido.';
        emailFeedback.hidden = false;
      }
      emailInput.focus();
      return;
    }

    emailBtn.disabled = true;
    try {
      await shareListWithEmail(currentListId, email);
      if (emailFeedback) {
        emailFeedback.style.color = 'var(--pine)';
        emailFeedback.textContent = `¡Listo! Lista compartida con ${email}.`;
        emailFeedback.hidden = false;
      }
      emailInput.value = '';
    } catch (err: any) {
      if (emailFeedback) {
        emailFeedback.style.color = 'var(--clay)';
        emailFeedback.textContent = err.message || 'Error al compartir la lista.';
        emailFeedback.hidden = false;
      }
    } finally {
      emailBtn.disabled = false;
    }
  });

  return function openModal({ listId, listName }: ShareModalOptions) {
    currentListId = listId;
    currentListName = listName;
    title.textContent = `Compartir «${listName}»`;
    const shareUrl = `${window.location.origin}/?listaId=${listId}`;
    linkInput.value = shareUrl;
    phoneInput.value = '';
    emailInput.value = '';
    if (emailFeedback) emailFeedback.hidden = true;
    modal.classList.add('is-open');
    phoneInput.focus();
  };
}
