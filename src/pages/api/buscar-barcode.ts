import type { APIRoute } from 'astro';
import { cleanEan } from '../../lib/normalize';
import { checkRateLimit, rateLimitResponse } from '../../lib/rateLimit';

export interface BarcodeResult {
  ok: boolean;
  encontrado: boolean;
  codigo: string;
  producto?: string;
  marca?: string;
  presentacion?: string;
  cantidad?: number;
  formato?: 'gramos' | 'mililitros' | 'unidades';
  imagen?: string;
  categoria?: string;
  query_optima: string;
  fuente?: 'openfoodfacts' | 'gemini' | 'directo';
  mensaje?: string;
}

export const GET: APIRoute = async ({ request, url }) => {
  // Rate limit: 40 consultas por minuto
  const limit = checkRateLimit(request, {
    prefix: 'api-buscar-barcode',
    windowMs: 60_000,
    max: 40,
  });
  if (!limit.allowed) {
    return rateLimitResponse(limit);
  }

  const rawCode = url.searchParams.get('code') || '';
  const digits = rawCode.replace(/\D/g, '');

  if (digits.length < 6 || digits.length > 14) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Código de barras inválido (debe tener entre 6 y 14 dígitos)' }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const validEan = cleanEan(digits, 6) || digits;

  // 1. Intentar consultar OpenFoodFacts
  try {
    const offController = new AbortController();
    const offTimer = setTimeout(() => offController.abort(), 3500);

    const offUrl = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(validEan)}.json?fields=product_name,product_name_es,brands,quantity,image_front_url,image_url,categories_tags,serving_size`;
    const offRes = await fetch(offUrl, {
      signal: offController.signal,
      headers: {
        'User-Agent': 'MercadoLista - Comparador de precios Colombia - info@mercadolista.com',
      },
    });
    clearTimeout(offTimer);

    if (offRes.ok) {
      const data = await offRes.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        const nombre = p.product_name_es || p.product_name || '';
        const marca = p.brands ? p.brands.split(',')[0].trim() : '';
        const cantidadStr = p.quantity || '';
        const imagen = p.image_front_url || p.image_url || undefined;

        // Deducir formato y cantidad
        let formato: 'gramos' | 'mililitros' | 'unidades' = 'unidades';
        let cantidadNum = 1;

        const matchGramos = cantidadStr.match(/(\d+(?:[.,]\d+)?)\s*(?:g|gr|gramos|kg|kilos)/i);
        const matchMl = cantidadStr.match(/(\d+(?:[.,]\d+)?)\s*(?:ml|mililitros|l|lt|litros)/i);

        if (matchMl) {
          formato = 'mililitros';
          const n = parseFloat(matchMl[1].replace(',', '.'));
          cantidadNum = cantidadStr.toLowerCase().includes('l') && !cantidadStr.toLowerCase().includes('ml') ? Math.round(n * 1000) : Math.round(n);
        } else if (matchGramos) {
          formato = 'gramos';
          const n = parseFloat(matchGramos[1].replace(',', '.'));
          cantidadNum = cantidadStr.toLowerCase().includes('kg') || cantidadStr.toLowerCase().includes('kilo') ? Math.round(n * 1000) : Math.round(n);
        }

        const queryOptima = [nombre, marca, cantidadStr]
          .filter(Boolean)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        const result: BarcodeResult = {
          ok: true,
          encontrado: true,
          codigo: validEan,
          producto: nombre || `Producto (${validEan})`,
          marca: marca || undefined,
          presentacion: cantidadStr || undefined,
          cantidad: cantidadNum,
          formato,
          imagen,
          query_optima: queryOptima || validEan,
          fuente: 'openfoodfacts',
        };

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=86400',
          },
        });
      }
    }
  } catch (err) {
    // Continuar al siguiente paso si OpenFoodFacts falla o hace timeout
    console.warn('OpenFoodFacts query skipped:', err);
  }

  // 2. Si hay Gemini API Key y no se encontró en OpenFoodFacts, consultar a Gemini
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const gController = new AbortController();
      const gTimer = setTimeout(() => gController.abort(), 4000);

      const prompt = `¿Conoces el producto correspondiente al código de barras EAN/UPC ${validEan} en Colombia o Latinoamérica?
Si lo conoces con certeza, responde con este JSON:
{
  "conoce": true,
  "producto": "Nombre del producto",
  "marca": "Marca",
  "presentacion": "Cantidad ej 1000 ml",
  "formato": "gramos" | "mililitros" | "unidades",
  "cantidad": 1000,
  "query_optima": "nombre y marca para buscar en supermercados"
}
Si NO lo conoces con total certeza, responde exactamente: {"conoce": false}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: gController.signal,
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 250 },
          }),
        }
      );
      clearTimeout(gTimer);

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
          const parsed = JSON.parse(clean);
          if (parsed.conoce && parsed.producto) {
            const result: BarcodeResult = {
              ok: true,
              encontrado: true,
              codigo: validEan,
              producto: parsed.producto,
              marca: parsed.marca,
              presentacion: parsed.presentacion,
              cantidad: parsed.cantidad || 1,
              formato: parsed.formato || 'unidades',
              query_optima: parsed.query_optima || parsed.producto,
              fuente: 'gemini',
            };
            return new Response(JSON.stringify(result), {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' },
            });
          }
        }
      }
    } catch (err) {
      console.warn('Gemini barcode lookup skipped:', err);
    }
  }

  // 3. Fallback: El código no está en la base de datos de nombres, pero el usuario puede buscarlo directamente
  const fallbackResult: BarcodeResult = {
    ok: true,
    encontrado: false,
    codigo: validEan,
    query_optima: validEan,
    fuente: 'directo',
    mensaje: `Código ${validEan} detectado. Puedes buscarlo directamente en las tiendas o escribir el nombre.`,
  };

  return new Response(JSON.stringify(fallbackResult), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
};
