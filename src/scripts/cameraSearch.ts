// src/scripts/cameraSearch.ts
import type { ImageIdentifyResult } from '../pages/api/identificar-imagen';
import type { BarcodeResult } from '../pages/api/buscar-barcode';
import { escapeHtml } from '../lib/normalize';

// Declaración global para BarcodeDetector de la API Web Shape Detection
declare global {
  interface Window {
    BarcodeDetector?: any;
  }
}

export function initCameraSearch(options?: {
  onSearchSelected?: (query: string) => void;
  onAddToListSelected?: (item: { nombre: string; marca?: string; formato: 'gramos' | 'mililitros' | 'unidades'; cantidad: number }) => void;
}) {
  const modal = document.getElementById('camera-search-modal');
  const closeBtn = document.getElementById('camera-modal-close');
  if (!modal) return { open: () => {}, close: () => {} };

  // Botones de pestañas
  const tabPhoto = document.getElementById('tab-cam-photo') as HTMLButtonElement | null;
  const tabBarcode = document.getElementById('tab-cam-barcode') as HTMLButtonElement | null;
  const panelPhoto = document.getElementById('panel-cam-photo');
  const panelBarcode = document.getElementById('panel-cam-barcode');

  // Elementos de Foto / IA
  const fileInput = document.getElementById('camera-file-input') as HTMLInputElement | null;
  const btnTriggerFile = document.getElementById('btn-trigger-file');
  const dropzone = document.getElementById('camera-dropzone');
  const photoLoading = document.getElementById('camera-loading');
  const photoError = document.getElementById('camera-error');
  const photoErrorMsg = document.getElementById('camera-error-msg');
  const btnRetryPhoto = document.getElementById('btn-retry-photo');
  const photoResult = document.getElementById('camera-result');
  const photoResultImg = document.getElementById('camera-result-img') as HTMLImageElement | null;
  const photoResultCategory = document.getElementById('camera-result-category');
  const photoResultName = document.getElementById('camera-result-name');
  const photoResultMeta = document.getElementById('camera-result-meta');
  const photoResultQuery = document.getElementById('camera-result-query');
  const btnSearchDetected = document.getElementById('btn-search-detected');
  const btnAddToListDetected = document.getElementById('btn-add-to-list-detected');
  const btnAnotherPhoto = document.getElementById('btn-another-photo');

  // Elementos de Código de Barras
  const barcodeVideo = document.getElementById('barcode-video') as HTMLVideoElement | null;
  const btnStartScanner = document.getElementById('btn-start-scanner');
  const btnStopScanner = document.getElementById('btn-stop-scanner');
  const barcodeManualInput = document.getElementById('barcode-manual-input') as HTMLInputElement | null;
  const btnLookupBarcode = document.getElementById('btn-lookup-barcode');
  const barcodeStatus = document.getElementById('barcode-status');
  const barcodeStatusText = document.getElementById('barcode-status-text');
  const barcodeResult = document.getElementById('barcode-result');
  const barcodeResultName = document.getElementById('barcode-result-name');
  const barcodeResultMeta = document.getElementById('barcode-result-meta');
  const btnSearchBarcode = document.getElementById('btn-search-barcode');
  const btnAddBarcodeList = document.getElementById('btn-add-barcode-list');
  const btnScanAnother = document.getElementById('btn-scan-another');

  let activeStream: MediaStream | null = null;
  let isScanningBarcode = false;
  let barcodeDetectorInstance: any = null;
  let barcodeScanTimer: any = null;

  let currentPhotoData: ImageIdentifyResult | null = null;
  let currentBarcodeData: BarcodeResult | null = null;

  // -------------------------------------------------------------
  // Abrir / Cerrar Modal
  // -------------------------------------------------------------
  function openModal(defaultTab: 'photo' | 'barcode' = 'photo') {
    modal?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    switchTab(defaultTab);
  }

  function closeModal() {
    modal?.classList.remove('is-open');
    document.body.style.overflow = '';
    stopBarcodeScanner();
  }

  closeBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('is-open')) closeModal();
  });

  // -------------------------------------------------------------
  // Cambio de Pestañas
  // -------------------------------------------------------------
  function switchTab(tab: 'photo' | 'barcode') {
    if (tab === 'photo') {
      tabPhoto?.classList.add('is-active');
      tabPhoto?.setAttribute('aria-selected', 'true');
      tabBarcode?.classList.remove('is-active');
      tabBarcode?.setAttribute('aria-selected', 'false');
      if (panelPhoto) panelPhoto.hidden = false;
      if (panelBarcode) panelBarcode.hidden = true;
      stopBarcodeScanner();
    } else {
      tabBarcode?.classList.add('is-active');
      tabBarcode?.setAttribute('aria-selected', 'true');
      tabPhoto?.classList.remove('is-active');
      tabPhoto?.setAttribute('aria-selected', 'false');
      if (panelBarcode) panelBarcode.hidden = false;
      if (panelPhoto) panelPhoto.hidden = true;
    }
  }

  tabPhoto?.addEventListener('click', () => switchTab('photo'));
  tabBarcode?.addEventListener('click', () => switchTab('barcode'));

  // -------------------------------------------------------------
  // Pestaña 1: FOTO CON IA (Compresión en cliente y API)
  // -------------------------------------------------------------
  btnTriggerFile?.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput?.click();
  });

  dropzone?.addEventListener('click', (e) => {
    if (e.target !== fileInput) {
      fileInput?.click();
    }
  });

  // Soporte Drag & Drop
  if (dropzone) {
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('is-dragover');
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('is-dragover');
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('is-dragover');
      const files = e.dataTransfer?.files;
      if (files && files.length > 0 && files[0].type.startsWith('image/')) {
        processImageFile(files[0]);
      }
    });
  }

  // Soporte Pegar imagen con Ctrl+V / Cmd+V
  window.addEventListener('paste', (e) => {
    if (!modal?.classList.contains('is-open')) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          switchTab('photo');
          processImageFile(file);
          break;
        }
      }
    }
  });

  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) {
      processImageFile(file);
    }
  });

  function resetPhotoViews() {
    if (dropzone) dropzone.hidden = false;
    if (photoLoading) photoLoading.hidden = true;
    if (photoError) photoError.hidden = true;
    if (photoResult) photoResult.hidden = true;
    if (fileInput) fileInput.value = '';
    currentPhotoData = null;
  }

  btnRetryPhoto?.addEventListener('click', resetPhotoViews);
  btnAnotherPhoto?.addEventListener('click', resetPhotoViews);

  async function processImageFile(file: File) {
    if (dropzone) dropzone.hidden = true;
    if (photoError) photoError.hidden = true;
    if (photoResult) photoResult.hidden = true;
    if (photoLoading) photoLoading.hidden = false;

    try {
      // Comprimir imagen en el cliente para que pese menos de 400KB
      const base64DataUrl = await compressImage(file, 1200, 0.82);

      const res = await fetch('/api/identificar-imagen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64DataUrl }),
      });

      const data: ImageIdentifyResult & { error?: string; isMissingKey?: boolean } = await res.json();

      if (!res.ok || !data.ok) {
        if (data.isMissingKey) {
          throw new Error('Falta configurar tu GEMINI_API_KEY en el archivo .env local. Mientras tanto, puedes usar la pestaña de "Código de barras", que funciona de inmediato sin claves.');
        }
        throw new Error(data.error || 'No se pudo identificar el producto en la imagen.');
      }

      currentPhotoData = data;
      renderPhotoResult(data, base64DataUrl);
    } catch (err: any) {
      if (photoLoading) photoLoading.hidden = true;
      if (photoError) photoError.hidden = false;
      if (photoErrorMsg) photoErrorMsg.textContent = err.message || 'Error al procesar la imagen.';
    }
  }

  function renderPhotoResult(data: ImageIdentifyResult, previewUrl: string) {
    if (photoLoading) photoLoading.hidden = true;
    if (photoResult) photoResult.hidden = false;

    if (photoResultImg) photoResultImg.src = previewUrl;
    if (photoResultCategory) {
      photoResultCategory.textContent = data.categoria || 'Supermercado';
    }
    if (photoResultName) {
      photoResultName.textContent = data.producto;
    }
    if (photoResultMeta) {
      const parts = [];
      if (data.marca) parts.push(`Marca: ${escapeHtml(data.marca)}`);
      if (data.presentacion) parts.push(`Presentación: ${escapeHtml(data.presentacion)}`);
      if (data.codigo_barras) parts.push(`EAN: ${escapeHtml(data.codigo_barras)}`);
      photoResultMeta.innerHTML = parts.join(' · ') || 'Producto reconocido';
    }
    if (photoResultQuery) {
      photoResultQuery.textContent = data.query_optima;
    }
  }

  function compressImage(file: File, maxDimension: number, quality: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(reader.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // -------------------------------------------------------------
  // Pestaña 2: ESCÁNER DE CÓDIGO DE BARRAS (BarcodeDetector + Fallback)
  // -------------------------------------------------------------
  async function startBarcodeScanner() {
    if (!barcodeVideo) return;
    try {
      if (btnStartScanner) btnStartScanner.hidden = true;
      if (btnStopScanner) btnStopScanner.hidden = false;

      activeStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      barcodeVideo.srcObject = activeStream;
      await barcodeVideo.play();

      isScanningBarcode = true;
      initBarcodeDetectionLoop();
    } catch (err: any) {
      console.warn('Error al acceder a la cámara:', err);
      alert('No se pudo acceder a la cámara. Por favor permite los permisos o ingresa el código manualmente.');
      stopBarcodeScanner();
    }
  }

  function stopBarcodeScanner() {
    isScanningBarcode = false;
    if (barcodeScanTimer) {
      clearInterval(barcodeScanTimer);
      barcodeScanTimer = null;
    }
    if (activeStream) {
      activeStream.getTracks().forEach((track) => track.stop());
      activeStream = null;
    }
    if (barcodeVideo) {
      barcodeVideo.srcObject = null;
    }
    if (btnStartScanner) btnStartScanner.hidden = false;
    if (btnStopScanner) btnStopScanner.hidden = true;
  }

  btnStartScanner?.addEventListener('click', startBarcodeScanner);
  btnStopScanner?.addEventListener('click', stopBarcodeScanner);

  async function initBarcodeDetectionLoop() {
    if ('BarcodeDetector' in window) {
      try {
        if (!barcodeDetectorInstance) {
          barcodeDetectorInstance = new (window as any).BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'],
          });
        }
      } catch (e) {
        console.warn('BarcodeDetector no soportó formatos seleccionados:', e);
      }
    }

    barcodeScanTimer = setInterval(async () => {
      if (!isScanningBarcode || !barcodeVideo || barcodeVideo.readyState < 2) return;

      if (barcodeDetectorInstance) {
        try {
          const barcodes = await barcodeDetectorInstance.detect(barcodeVideo);
          if (barcodes && barcodes.length > 0) {
            const code = barcodes[0].rawValue;
            if (code) {
              onBarcodeFound(code);
            }
          }
        } catch (err) {
          // Frame skip
        }
      }
    }, 280);
  }

  function onBarcodeFound(code: string) {
    stopBarcodeScanner();
    // Vibración háptica en móviles si está disponible
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    lookupBarcode(code);
  }

  async function lookupBarcode(rawCode: string) {
    const code = rawCode.trim();
    if (!code) return;

    if (barcodeStatus) barcodeStatus.hidden = false;
    if (barcodeStatusText) barcodeStatusText.textContent = `Consultando código ${code}...`;
    if (barcodeResult) barcodeResult.hidden = true;

    try {
      const res = await fetch(`/api/buscar-barcode?code=${encodeURIComponent(code)}`);
      const data: BarcodeResult = await res.json();

      if (barcodeStatus) barcodeStatus.hidden = true;
      if (barcodeResult) barcodeResult.hidden = false;

      currentBarcodeData = data;
      renderBarcodeResult(data);
    } catch (err: any) {
      if (barcodeStatus) barcodeStatus.hidden = true;
      alert(`Error al consultar el código: ${err.message || 'Intenta de nuevo'}`);
    }
  }

  function renderBarcodeResult(data: BarcodeResult) {
    if (barcodeResultName) {
      barcodeResultName.textContent = data.producto || `Código: ${data.codigo}`;
    }
    if (barcodeResultMeta) {
      const parts = [`Código: ${escapeHtml(data.codigo)}`];
      if (data.marca) parts.push(`Marca: ${escapeHtml(data.marca)}`);
      if (data.presentacion) parts.push(`Presentación: ${escapeHtml(data.presentacion)}`);
      barcodeResultMeta.innerHTML = parts.join(' · ');
    }
  }

  btnLookupBarcode?.addEventListener('click', () => {
    const code = barcodeManualInput?.value.trim();
    if (code) lookupBarcode(code);
  });

  barcodeManualInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = barcodeManualInput?.value.trim();
      if (code) lookupBarcode(code);
    }
  });

  btnScanAnother?.addEventListener('click', () => {
    if (barcodeResult) barcodeResult.hidden = true;
    if (barcodeManualInput) barcodeManualInput.value = '';
    currentBarcodeData = null;
    startBarcodeScanner();
  });

  // -------------------------------------------------------------
  // ACCIONES FINALES: Comparar Precios o Añadir a Lista
  // -------------------------------------------------------------
  btnSearchDetected?.addEventListener('click', () => {
    if (!currentPhotoData) return;
    const query = currentPhotoData.query_optima || currentPhotoData.producto;
    closeModal();
    if (options?.onSearchSelected) {
      options.onSearchSelected(query);
    } else {
      executeSearchInPage(query);
    }
  });

  btnSearchBarcode?.addEventListener('click', () => {
    if (!currentBarcodeData) return;
    const query = currentBarcodeData.query_optima || currentBarcodeData.producto || currentBarcodeData.codigo;
    closeModal();
    if (options?.onSearchSelected) {
      options.onSearchSelected(query);
    } else {
      executeSearchInPage(query);
    }
  });

  btnAddToListDetected?.addEventListener('click', () => {
    if (!currentPhotoData) return;
    const item = {
      nombre: currentPhotoData.producto,
      marca: currentPhotoData.marca || 'TODAS',
      formato: currentPhotoData.formato || 'unidades',
      cantidad: currentPhotoData.cantidad || 1,
    };
    closeModal();
    if (options?.onAddToListSelected) {
      options.onAddToListSelected(item);
    } else {
      addItemToShoppingList(item);
    }
  });

  btnAddBarcodeList?.addEventListener('click', () => {
    if (!currentBarcodeData) return;
    const item = {
      nombre: currentBarcodeData.producto || `Producto ${currentBarcodeData.codigo}`,
      marca: currentBarcodeData.marca || 'TODAS',
      formato: currentBarcodeData.formato || 'unidades',
      cantidad: currentBarcodeData.cantidad || 1,
    };
    closeModal();
    if (options?.onAddToListSelected) {
      options.onAddToListSelected(item);
    } else {
      addItemToShoppingList(item);
    }
  });

  function executeSearchInPage(query: string) {
    const mainQueryInput = document.querySelector<HTMLInputElement>('#query');
    const navQueryInput = document.querySelector<HTMLInputElement>('#ml-nav-q');
    const form = document.querySelector<HTMLFormElement>('#search-form');

    if (mainQueryInput && form) {
      mainQueryInput.value = query;
      // Scroll al buscador si es necesario
      mainQueryInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    } else if (navQueryInput) {
      navQueryInput.value = query;
      window.location.href = `/?q=${encodeURIComponent(query)}`;
    } else {
      window.location.href = `/?q=${encodeURIComponent(query)}`;
    }
  }

  function addItemToShoppingList(item: { nombre: string; marca: string; formato: 'gramos' | 'mililitros' | 'unidades'; cantidad: number }) {
    const LIST_KEY = 'comparador-lista';
    try {
      const currentList = JSON.parse(localStorage.getItem(LIST_KEY) || '[]');
      currentList.push({
        nombre: item.nombre,
        marca: item.marca,
        formato: item.formato,
        cantidad: item.cantidad,
      });
      localStorage.setItem(LIST_KEY, JSON.stringify(currentList));

      // Si estamos en la página principal, actualizar la UI de la lista
      const tabList = document.querySelector<HTMLButtonElement>('#tab-list');
      if (tabList) {
        tabList.click();
        // Disparar evento de almacenamiento para que app.ts refresque
        window.dispatchEvent(new Event('storage'));
      }

      // Notificación discreta
      const toast = document.createElement('div');
      toast.className = 'camera-toast-notification';
      toast.textContent = `✓ «${item.nombre}» añadido a tu lista de compras`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);
    } catch (err) {
      console.warn('Error al añadir a localStorage:', err);
    }
  }

  return {
    open: openModal,
    close: closeModal,
  };
}
