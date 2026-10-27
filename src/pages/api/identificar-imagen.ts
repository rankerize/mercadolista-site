import type { APIRoute } from 'astro';
import { checkRateLimit, rateLimitResponse } from '../../lib/rateLimit';

export interface ImageIdentifyResult {
  ok: boolean;
  producto: string;
  marca?: string;
  presentacion?: string;
  cantidad?: number;
  formato?: 'gramos' | 'mililitros' | 'unidades';
  categoria?: string;
  codigo_barras?: string | null;
  query_optima: string;
  confianza: 'alta' | 'media' | 'baja';
  detalles?: string;
}

export const POST: APIRoute = async ({ request }) => {
  // Rate limit: 25 consultas por minuto por IP
  const limit = checkRateLimit(request, {
    prefix: 'api-identificar-imagen',
    windowMs: 60_000,
    max: 25,
  });
  if (!limit.allowed) {
    return rateLimitResponse(limit);
  }

  let body: { image?: string; mimeType?: string } = {};
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: 'JSON inválido o cuerpo de solicitud vacío' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const rawImage = body.image?.trim();
  if (!rawImage || rawImage.length < 100) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Se requiere una imagen válida en base64' }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Prevenir payloads excesivos (> 7 MB)
  if (rawImage.length > 7 * 1024 * 1024) {
    return new Response(
      JSON.stringify({ ok: false, error: 'La imagen excede el tamaño máximo permitido (5MB)' }),
      { status: 413, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Extraer MIME type y limpiar prefijo data:image/...;base64,
  let mimeType = body.mimeType || 'image/jpeg';
  let base64Data = rawImage;

  const dataUriMatch = rawImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/s);
  if (dataUriMatch) {
    mimeType = dataUriMatch[1];
    base64Data = dataUriMatch[2].trim();
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Si no hay API key configurada en local, devolver una respuesta de fallback informativa
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Servicio de reconocimiento visual no disponible (falta configurar GEMINI_API_KEY en las variables de entorno).',
        isMissingKey: true,
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const systemInstruction = `Eres un asistente de compras experto en supermercados y tiendas de Colombia (Éxito, Carulla, Jumbo, Olímpica, D1, Alkosto, Falabella, Ktronix).
Analiza con precisión la foto adjunta. El usuario ha tomado una foto de un producto, empaque de supermercado, tecnología o código de barras.

Tu misión es extraer y deducir:
1. "producto": Nombre genérico del producto en Colombia (ej. "Leche Deslactosada", "Arroz Blanco", "Detergente Líquido", "Televisor 55 Pulgadas", "Aceite Vegetal").
2. "marca": Marca visible o deducible (ej. "Colanta", "Roa", "Ariel", "Samsung", "Premier", "Diana"). Si no se distingue, déjalo vacío o null.
3. "presentacion": Tamaño o empaque visible (ej. "1000 ml", "1 kg", "500 g", "30 unidades", "6 unidades").
4. "cantidad": Número entero o decimal correspondiente a la presentación (ej. 1000 para 1000 ml, 500 para 500 g, 30 para 30 huevos). Si no se distingue, asigna 1.
5. "formato": Uno de estos 3 valores exactos: "gramos", "mililitros" o "unidades".
6. "categoria": Categoría aproximada (ej. "Lácteos", "Despensa", "Aseo", "Tecnología", "Bebidas", "Carnes", "Cuidado Personal").
7. "codigo_barras": Si en la imagen se observa con claridad un código de barras de 8 a 14 dígitos (EAN / UPC), pon los dígitos aquí. Si no es legible o no está, usa null.
8. "query_optima": La frase de búsqueda de texto MÁS CONCISA y EFECTIVA para comparar precios en supermercados colombianos (ej. "leche deslactosada colanta 1000ml", "arroz diana 1000g", "detergente ariel liquido 2000ml").
9. "confianza": "alta", "media" o "baja".
10. "detalles": Una breve frase descriptiva (ej. "Identificado: Leche Colanta Deslactosada bolsa de 1 Litro").

IMPORTANTE: Responde ÚNICAMENTE con un JSON válido, sin bloques de código markdown (\`\`\`json) ni explicaciones previas ni posteriores.`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: systemInstruction },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 600,
          },
        }),
      }
    );
    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text();
      console.warn('Gemini Vision API status:', res.status, errText.slice(0, 200));
      return new Response(
        JSON.stringify({ ok: false, error: `Error del motor de visión (HTTP ${res.status})` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await res.json();
    const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) {
      return new Response(
        JSON.stringify({ ok: false, error: 'No se pudo reconocer el producto en la imagen.' }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cleaned = rawContent
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    const formatNorm = (rawFmt: string): 'gramos' | 'mililitros' | 'unidades' => {
      const lower = String(rawFmt || '').toLowerCase();
      if (lower.includes('mili') || lower.includes('ml') || lower.includes('litr')) return 'mililitros';
      if (lower.includes('gram') || lower.includes('g') || lower.includes('kilo')) return 'gramos';
      return 'unidades';
    };

    const result: ImageIdentifyResult = {
      ok: true,
      producto: String(parsed.producto || 'Producto detectado').trim(),
      marca: parsed.marca ? String(parsed.marca).trim() : undefined,
      presentacion: parsed.presentacion ? String(parsed.presentacion).trim() : undefined,
      cantidad: typeof parsed.cantidad === 'number' && parsed.cantidad > 0 ? parsed.cantidad : 1,
      formato: formatNorm(parsed.formato),
      categoria: parsed.categoria ? String(parsed.categoria).trim() : undefined,
      codigo_barras: parsed.codigo_barras ? String(parsed.codigo_barras).replace(/\D/g, '') : null,
      query_optima: String(parsed.query_optima || parsed.producto || '').trim(),
      confianza: ['alta', 'media', 'baja'].includes(parsed.confianza) ? parsed.confianza : 'media',
      detalles: parsed.detalles ? String(parsed.detalles).trim() : undefined,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('Error al identificar imagen:', err);
    return new Response(
      JSON.stringify({ ok: false, error: err.message || 'Error interno al procesar la imagen' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
