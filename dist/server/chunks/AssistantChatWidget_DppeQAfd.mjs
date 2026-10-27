import { e as createAstro, f as createComponent, m as maybeRenderHead, r as renderTemplate, n as renderScript } from './astro/server_zl8i4EZZ.mjs';
import 'piccolore';
import 'clsx';
/* empty css                         */

const $$Astro = createAstro("https://mercadolista.com");
const $$AssistantChatWidget = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$AssistantChatWidget;
  const pathname = Astro2.url.pathname;
  const isAssistantPage = pathname === "/asistente";
  return renderTemplate`${!isAssistantPage && renderTemplate`${maybeRenderHead()}<div class="assistant-widget-root" id="assistant-widget-root" data-astro-cid-lflduogh><!-- Teaser Bubble emergente temporal --><div class="assistant-widget-teaser" id="assistant-widget-teaser" role="status" data-astro-cid-lflduogh><div class="assistant-teaser-text" data-astro-cid-lflduogh><strong data-astro-cid-lflduogh>👋 ¿Qué quieres cocinar hoy?</strong><span data-astro-cid-lflduogh>Pregúntame una receta o lista de compras</span></div><button type="button" class="assistant-teaser-close" id="assistant-teaser-close" aria-label="Cerrar sugerencia" data-astro-cid-lflduogh>✕</button></div><!-- Ventana flotante de Chat / Asistente --><div class="assistant-chat-window" id="assistant-chat-window" hidden aria-modal="false" role="region" aria-label="Chat con el Asistente IA" data-astro-cid-lflduogh><div class="assistant-chat-header" data-astro-cid-lflduogh><div class="assistant-chat-header-info" data-astro-cid-lflduogh><div class="assistant-avatar" data-astro-cid-lflduogh>🧑‍🍳</div><div data-astro-cid-lflduogh><h3 class="assistant-chat-title" data-astro-cid-lflduogh>Asesor de Compras IA</h3><span class="assistant-chat-status" data-astro-cid-lflduogh><span class="assistant-status-dot" data-astro-cid-lflduogh></span> En línea · D1, Éxito, Jumbo…
</span></div></div><button type="button" class="assistant-chat-close-btn" id="assistant-chat-close-btn" aria-label="Cerrar chat" data-astro-cid-lflduogh>✕</button></div><div class="assistant-chat-body" data-astro-cid-lflduogh><div class="assistant-bubble assistant-bubble-bot" data-astro-cid-lflduogh><p data-astro-cid-lflduogh>
¡Hola! 👋 Soy tu asesor de compras y recetas con IA en Colombia.
</p><p data-astro-cid-lflduogh>
Dime qué comida o receta quieres preparar y te armo la lista con porciones y los precios más bajos.
</p></div><div class="assistant-quick-prompts" data-astro-cid-lflduogh><span class="assistant-quick-title" data-astro-cid-lflduogh>Sugerencias rápidas:</span><button type="button" class="assistant-quick-chip" data-q="Quiero hacer una pasta boloñesa para 2 personas" data-astro-cid-lflduogh>
🍝 Pasta boloñesa (2 pers.)
</button><button type="button" class="assistant-quick-chip" data-q="Noche de tacos caseros para 4 personas" data-astro-cid-lflduogh>
🌮 Noche de tacos (4 pers.)
</button><button type="button" class="assistant-quick-chip" data-q="Asado de domingo con carne y papas para 6 personas" data-astro-cid-lflduogh>
🥩 Asado colombiano (6 pers.)
</button><button type="button" class="assistant-quick-chip" data-q="Ajiaco santafereño típico para 4 personas" data-astro-cid-lflduogh>
🍲 Ajiaco santafereño (4 pers.)
</button></div></div><form id="assistant-chat-form" class="assistant-chat-footer" data-astro-cid-lflduogh><input type="text" id="assistant-chat-input" class="assistant-chat-input" placeholder="Ej. Quiero hacer una pasta boloñesa…" autocomplete="off" required data-astro-cid-lflduogh><button type="submit" class="assistant-chat-send" title="Consultar al Asistente IA" aria-label="Enviar" data-astro-cid-lflduogh><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-lflduogh><line x1="22" y1="2" x2="11" y2="13" data-astro-cid-lflduogh></line><polygon points="22 2 15 22 11 13 2 9 22 2" data-astro-cid-lflduogh></polygon></svg></button></form><a href="/asistente" class="assistant-chat-expand-link" data-astro-cid-lflduogh>
Abrir Asistente completo con selector de comensales ↗
</a></div><!-- Botón flotante disparador --><button type="button" id="assistant-widget-trigger" class="assistant-widget-trigger" aria-expanded="false" aria-controls="assistant-chat-window" title="Abrir Asistente de Compras & Recetas con IA" data-astro-cid-lflduogh><span class="assistant-trigger-badge" data-astro-cid-lflduogh>Nuevo</span><span class="assistant-trigger-icon" data-astro-cid-lflduogh>🧑‍🍳</span><span class="assistant-trigger-text" data-astro-cid-lflduogh>Asistente IA</span><span class="assistant-trigger-beacon" data-astro-cid-lflduogh></span></button></div>`}${renderScript($$result, "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/components/AssistantChatWidget.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/cesarandresjimenezarci/Documents/Clientes/Comparador de precios/src/components/AssistantChatWidget.astro", void 0);

export { $$AssistantChatWidget as $ };
