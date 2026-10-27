import { c as cleanEan } from '../../chunks/normalize_DA1X8QDr.mjs';
import { c as checkRateLimit, r as rateLimitResponse } from '../../chunks/rateLimit_BX5-YUpX.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ request, url }) => {
  const limit = checkRateLimit(request, {
    prefix: "api-buscar-barcode",
    windowMs: 6e4,
    max: 40
  });
  if (!limit.allowed) {
    return rateLimitResponse(limit);
  }
  const rawCode = url.searchParams.get("code") || "";
  const digits = rawCode.replace(/\D/g, "");
  if (digits.length < 6 || digits.length > 14) {
    return new Response(
      JSON.stringify({ ok: false, error: "Código de barras inválido (debe tener entre 6 y 14 dígitos)" }),
      { status: 422, headers: { "Content-Type": "application/json" } }
    );
  }
  const validEan = cleanEan(digits, 6) || digits;
  try {
    const offController = new AbortController();
    const offTimer = setTimeout(() => offController.abort(), 3500);
    const offUrl = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(validEan)}.json?fields=product_name,product_name_es,brands,quantity,image_front_url,image_url,categories_tags,serving_size`;
    const offRes = await fetch(offUrl, {
      signal: offController.signal,
      headers: {
        "User-Agent": "MercadoLista - Comparador de precios Colombia - info@mercadolista.com"
      }
    });
    clearTimeout(offTimer);
    if (offRes.ok) {
      const data = await offRes.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        const nombre = p.product_name_es || p.product_name || "";
        const marca = p.brands ? p.brands.split(",")[0].trim() : "";
        const cantidadStr = p.quantity || "";
        const imagen = p.image_front_url || p.image_url || void 0;
        let formato = "unidades";
        let cantidadNum = 1;
        const matchGramos = cantidadStr.match(/(\d+(?:[.,]\d+)?)\s*(?:g|gr|gramos|kg|kilos)/i);
        const matchMl = cantidadStr.match(/(\d+(?:[.,]\d+)?)\s*(?:ml|mililitros|l|lt|litros)/i);
        if (matchMl) {
          formato = "mililitros";
          const n = parseFloat(matchMl[1].replace(",", "."));
          cantidadNum = cantidadStr.toLowerCase().includes("l") && !cantidadStr.toLowerCase().includes("ml") ? Math.round(n * 1e3) : Math.round(n);
        } else if (matchGramos) {
          formato = "gramos";
          const n = parseFloat(matchGramos[1].replace(",", "."));
          cantidadNum = cantidadStr.toLowerCase().includes("kg") || cantidadStr.toLowerCase().includes("kilo") ? Math.round(n * 1e3) : Math.round(n);
        }
        const queryOptima = [nombre, marca, cantidadStr].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
        const result = {
          ok: true,
          encontrado: true,
          codigo: validEan,
          producto: nombre || `Producto (${validEan})`,
          marca: marca || void 0,
          presentacion: cantidadStr || void 0,
          cantidad: cantidadNum,
          formato,
          imagen,
          query_optima: queryOptima || validEan,
          fuente: "openfoodfacts"
        };
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=86400"
          }
        });
      }
    }
  } catch (err) {
    console.warn("OpenFoodFacts query skipped:", err);
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const gController = new AbortController();
      const gTimer = setTimeout(() => gController.abort(), 4e3);
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
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: gController.signal,
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 250 }
          })
        }
      );
      clearTimeout(gTimer);
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
          const parsed = JSON.parse(clean);
          if (parsed.conoce && parsed.producto) {
            const result = {
              ok: true,
              encontrado: true,
              codigo: validEan,
              producto: parsed.producto,
              marca: parsed.marca,
              presentacion: parsed.presentacion,
              cantidad: parsed.cantidad || 1,
              formato: parsed.formato || "unidades",
              query_optima: parsed.query_optima || parsed.producto,
              fuente: "gemini"
            };
            return new Response(JSON.stringify(result), {
              status: 200,
              headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=86400" }
            });
          }
        }
      }
    } catch (err) {
      console.warn("Gemini barcode lookup skipped:", err);
    }
  }
  const fallbackResult = {
    ok: true,
    encontrado: false,
    codigo: validEan,
    query_optima: validEan,
    fuente: "directo",
    mensaje: `Código ${validEan} detectado. Puedes buscarlo directamente en las tiendas o escribir el nombre.`
  };
  return new Response(JSON.stringify(fallbackResult), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
