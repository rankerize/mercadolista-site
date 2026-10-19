import { c as checkRateLimit, r as rateLimitResponse } from '../../chunks/rateLimit_BX5-YUpX.mjs';
export { renderers } from '../../renderers.mjs';

const RECIPE_CATALOG = [
  {
    keywords: ["pasta bolonesa", "pasta boloñesa", "espaguetis bolonesa", "espagueti bolonesa", "bolognese", "boloñesa"],
    receta: "Pasta Boloñesa Casera",
    descripcion: "Espaguetis en salsa boloñesa tradicional con carne de res, tomate y queso parmesano.",
    basePorciones: 2,
    consejo: "Para una salsa más jugosa, sofríe la carne con un toque de cebolla y ajo antes de agregar la salsa de tomate.",
    ingredientes: [
      { nombre: "Pasta espagueti", cantidadBase: 250, formato: "gramos", notas: "Pasta tradicional" },
      { nombre: "Carne molida de res", cantidadBase: 350, formato: "gramos", notas: "Carne magra molida" },
      { nombre: "Pasta de tomate", cantidadBase: 200, formato: "gramos", notas: "Base de salsa" },
      { nombre: "Cebolla cabezona", cantidadBase: 1, formato: "unidades", notas: "Para el sofrito" },
      { nombre: "Diente de ajo", cantidadBase: 2, formato: "unidades" },
      { nombre: "Queso parmesano", cantidadBase: 50, formato: "gramos", notas: "Para espolvorear" },
      { nombre: "Aceite vegetal", cantidadBase: 50, formato: "mililitros" }
    ]
  },
  {
    keywords: ["carbonara", "pasta carbonara", "espagueti carbonara", "alfredo"],
    receta: "Pasta Carbonara Cremosa",
    descripcion: "Espaguetis con tocineta crocante, huevo, crema de leche y queso parmesano.",
    basePorciones: 2,
    consejo: "Dora la tocineta a fuego medio sin aceite extra para que suelte su propia grasa natural.",
    ingredientes: [
      { nombre: "Pasta espagueti", cantidadBase: 250, formato: "gramos" },
      { nombre: "Tocineta ahumada", cantidadBase: 150, formato: "gramos" },
      { nombre: "Crema de leche", cantidadBase: 200, formato: "mililitros" },
      { nombre: "Huevos AA", cantidadBase: 2, formato: "unidades" },
      { nombre: "Queso parmesano", cantidadBase: 50, formato: "gramos" }
    ]
  },
  {
    keywords: ["tacos", "fajitas", "burritos", "mexicana", "tacos de carne"],
    receta: "Noche de Tacos Caseros",
    descripcion: "Tacos con carne sazonada, queso fundido, pico de gallo y guacamole fresco.",
    basePorciones: 2,
    consejo: "Calienta las tortillas en una sartén seca durante 20 segundos por lado para que queden suaves y flexibles.",
    ingredientes: [
      { nombre: "Tortillas de trigo", cantidadBase: 8, formato: "unidades" },
      { nombre: "Carne molida de res", cantidadBase: 350, formato: "gramos" },
      { nombre: "Queso mozzarella tajado", cantidadBase: 150, formato: "gramos" },
      { nombre: "Aguacate hass", cantidadBase: 2, formato: "unidades" },
      { nombre: "Tomate chonto", cantidadBase: 2, formato: "unidades" },
      { nombre: "Cebolla morada", cantidadBase: 1, formato: "unidades" },
      { nombre: "Limón", cantidadBase: 2, formato: "unidades" }
    ]
  },
  {
    keywords: ["asado", "bbq", "parrillada", "carne asada"],
    receta: "Asado / Parrillada Colombiana",
    descripcion: "Cortes de carne para asar, costilla, chorizo santarrosano, papas saladas y plátano maduro.",
    basePorciones: 2,
    consejo: "Sazona la carne solo con sal gruesa 10 minutos antes de ponerla a la parrilla para conservar todos sus jugos.",
    ingredientes: [
      { nombre: "Carne de res para asar", cantidadBase: 500, formato: "gramos" },
      { nombre: "Costilla de cerdo", cantidadBase: 400, formato: "gramos" },
      { nombre: "Chorizo", cantidadBase: 4, formato: "unidades" },
      { nombre: "Papa criolla", cantidadBase: 500, formato: "gramos" },
      { nombre: "Plátano maduro", cantidadBase: 2, formato: "unidades" },
      { nombre: "Aguacate", cantidadBase: 1, formato: "unidades" }
    ]
  },
  {
    keywords: ["ajiaco", "ajiaco santafereño"],
    receta: "Ajiaco Santafereño Típico",
    descripcion: "Sopa tradicional bogotana con pechuga de pollo, tres tipos de papa, mazorca, alcaparras y crema.",
    basePorciones: 2,
    consejo: "La papa criolla debe cocinarse hasta deshacerse para darle el espesor cremoso característico al ajiaco.",
    ingredientes: [
      { nombre: "Pechuga de pollo", cantidadBase: 500, formato: "gramos" },
      { nombre: "Papa criolla", cantidadBase: 500, formato: "gramos" },
      { nombre: "Papa pastusa", cantidadBase: 500, formato: "gramos" },
      { nombre: "Mazorca", cantidadBase: 2, formato: "unidades" },
      { nombre: "Crema de leche", cantidadBase: 200, formato: "mililitros" },
      { nombre: "Alcaparras", cantidadBase: 100, formato: "gramos" },
      { nombre: "Aguacate", cantidadBase: 1, formato: "unidades" }
    ]
  },
  {
    keywords: ["arroz con pollo"],
    receta: "Arroz con Pollo Criollo",
    descripcion: "Arroz sazonado con pechuga de pollo desmechada, verduras campesinas y pasta de tomate.",
    basePorciones: 2,
    consejo: "Usa el mismo caldo en el que cocinaste la pechuga de pollo para cocinar el arroz y triplicar el sabor.",
    ingredientes: [
      { nombre: "Pechuga de pollo", cantidadBase: 400, formato: "gramos" },
      { nombre: "Arroz blanco", cantidadBase: 350, formato: "gramos" },
      { nombre: "Verduras campesina mixta", cantidadBase: 250, formato: "gramos" },
      { nombre: "Pimentón rojo", cantidadBase: 1, formato: "unidades" },
      { nombre: "Cebolla cabezona", cantidadBase: 1, formato: "unidades" },
      { nombre: "Pasta de tomate", cantidadBase: 100, formato: "gramos" }
    ]
  },
  {
    keywords: ["hamburguesas", "hamburguesa"],
    receta: "Hamburguesas Caseras Gourmet",
    descripcion: "Hamburguesas con carne de res jugosa, tocineta crocante, queso cheddar, lechuga y tomate fresco.",
    basePorciones: 2,
    consejo: "No aplastes la carne mientras se cocina en la sartén para evitar que pierda sus jugos.",
    ingredientes: [
      { nombre: "Pan de hamburguesa", cantidadBase: 2, formato: "unidades" },
      { nombre: "Carne para hamburguesa", cantidadBase: 300, formato: "gramos" },
      { nombre: "Queso cheddar tajado", cantidadBase: 100, formato: "gramos" },
      { nombre: "Tocineta ahumada", cantidadBase: 100, formato: "gramos" },
      { nombre: "Tomate chonto", cantidadBase: 1, formato: "unidades" },
      { nombre: "Lechuga crespa", cantidadBase: 1, formato: "unidades" },
      { nombre: "Salsa de tomate", cantidadBase: 200, formato: "gramos" }
    ]
  },
  {
    keywords: ["desayuno fit", "desayuno saludable", "desayuno", "fit"],
    receta: "Desayuno Saludable & Fit",
    descripcion: "Desayuno balanceado con huevos revueltos, tostadas o arepas, aguacate y avena.",
    basePorciones: 2,
    consejo: "Acompaña con fruta fresca de temporada para obtener energía limpia durante toda la mañana.",
    ingredientes: [
      { nombre: "Huevos AA", cantidadBase: 4, formato: "unidades" },
      { nombre: "Arepa de maíz", cantidadBase: 4, formato: "unidades" },
      { nombre: "Aguacate hass", cantidadBase: 1, formato: "unidades" },
      { nombre: "Avena en hojuelas", cantidadBase: 250, formato: "gramos" },
      { nombre: "Leche deslactosada", cantidadBase: 1e3, formato: "mililitros" },
      { nombre: "Banano", cantidadBase: 3, formato: "unidades" }
    ]
  },
  {
    keywords: ["lentejas", "sopa de lentejas"],
    receta: "Lentejas Caseras con Arroz",
    descripcion: "Lentejas guisadas con plátano maduro, tocino o chorizo, acompañadas de arroz blanco.",
    basePorciones: 2,
    consejo: "Remoja las lentejas 30 minutos antes para que se cocinen más rápido y queden perfectamente tiernas.",
    ingredientes: [
      { nombre: "Lentejas", cantidadBase: 250, formato: "gramos" },
      { nombre: "Arroz blanco", cantidadBase: 250, formato: "gramos" },
      { nombre: "Plátano maduro", cantidadBase: 1, formato: "unidades" },
      { nombre: "Tomate chonto", cantidadBase: 2, formato: "unidades" },
      { nombre: "Cebolla cabezona", cantidadBase: 1, formato: "unidades" },
      { nombre: "Chorizo", cantidadBase: 2, formato: "unidades" }
    ]
  },
  {
    keywords: ["ceviche", "ceviche de camaron", "camarones"],
    receta: "Ceviche de Camarón Colombiano",
    descripcion: "Camarones en salsa rosada con cebolla morada, limón y cilantro, acompañados de galletas de soda.",
    basePorciones: 2,
    consejo: "Pasa la cebolla morada por agua tibia con sal antes de mezclarla para quitarle el picor fuerte.",
    ingredientes: [
      { nombre: "Camarones precocidos", cantidadBase: 350, formato: "gramos" },
      { nombre: "Salsa de tomate", cantidadBase: 150, formato: "gramos" },
      { nombre: "Mayonesa", cantidadBase: 100, formato: "gramos" },
      { nombre: "Limón", cantidadBase: 3, formato: "unidades" },
      { nombre: "Cebolla morada", cantidadBase: 1, formato: "unidades" },
      { nombre: "Galletas de soda saltinas", cantidadBase: 1, formato: "unidades" }
    ]
  },
  {
    keywords: ["ensalada cesar", "ensalada césar", "ensalada de pollo", "ensalada"],
    receta: "Ensalada César con Pollo",
    descripcion: "Lechuga fresca, filetes de pechuga dorada, queso parmesano y aderezo césar.",
    basePorciones: 2,
    consejo: "Dora la pechuga a la plancha con pimienta y córtala en tiras una vez tibia para que no se seque.",
    ingredientes: [
      { nombre: "Pechuga de pollo", cantidadBase: 350, formato: "gramos" },
      { nombre: "Lechuga crespa", cantidadBase: 1, formato: "unidades" },
      { nombre: "Queso parmesano", cantidadBase: 60, formato: "gramos" },
      { nombre: "Pan tajado blanco", cantidadBase: 4, formato: "unidades", notas: "Para croutons" },
      { nombre: "Aceite de oliva", cantidadBase: 50, formato: "mililitros" }
    ]
  },
  {
    keywords: ["bandeja paisa", "frijoles", "frijolada"],
    receta: "Bandeja Paisa Tradicional",
    descripcion: "Fríjoles con carne molida, chicharrón, huevo frito, arroz blanco, tajada de maduro y aguacate.",
    basePorciones: 2,
    consejo: "Añade una pizca de panela y comino a los fríjoles durante la cocción para lograr el toque paisa auténtico.",
    ingredientes: [
      { nombre: "Frijol rojo cargamanto", cantidadBase: 350, formato: "gramos" },
      { nombre: "Carne molida de res", cantidadBase: 300, formato: "gramos" },
      { nombre: "Arroz blanco", cantidadBase: 300, formato: "gramos" },
      { nombre: "Huevos AA", cantidadBase: 2, formato: "unidades" },
      { nombre: "Plátano maduro", cantidadBase: 2, formato: "unidades" },
      { nombre: "Aguacate", cantidadBase: 1, formato: "unidades" },
      { nombre: "Arepa de maíz", cantidadBase: 2, formato: "unidades" }
    ]
  }
];
function extractPersonasFromPrompt(prompt, fallbackPersonas = 2) {
  const match = prompt.match(/(?:para|de|somos)?\s*(\d+)\s*(?:personas?|comensales?|amigos?|invitados?|pax)/i);
  if (match && match[1]) {
    const parsed = parseInt(match[1], 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 30) {
      return parsed;
    }
  }
  return Math.max(1, Math.min(20, fallbackPersonas));
}
function normalizeStr(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}
function resolveWithLocalEngine(prompt, personas) {
  const normPrompt = normalizeStr(prompt);
  let matchedTemplate = null;
  let maxMatchedScore = 0;
  for (const template of RECIPE_CATALOG) {
    for (const kw of template.keywords) {
      const normKw = normalizeStr(kw);
      if (normPrompt.includes(normKw)) {
        const score = normKw.length;
        if (score > maxMatchedScore) {
          maxMatchedScore = score;
          matchedTemplate = template;
        }
      }
    }
  }
  if (matchedTemplate) {
    const multiplier = personas / matchedTemplate.basePorciones;
    const scaledIngredients = matchedTemplate.ingredientes.map((ing) => {
      let scaledQty;
      if (ing.formato === "unidades") {
        scaledQty = Math.max(1, Math.round(ing.cantidadBase * multiplier));
      } else if (ing.formato === "gramos") {
        scaledQty = Math.round(ing.cantidadBase * multiplier / 25) * 25;
      } else {
        scaledQty = Math.round(ing.cantidadBase * multiplier / 50) * 50;
      }
      return {
        nombre: ing.nombre,
        cantidad: scaledQty,
        formato: ing.formato,
        notas: ing.notas
      };
    });
    return {
      receta: `${matchedTemplate.receta} (para ${personas} personas)`,
      descripcion: matchedTemplate.descripcion,
      porciones: personas,
      ingredientes: scaledIngredients,
      consejo: matchedTemplate.consejo,
      origen: "catalogo_inteligente"
    };
  }
  const words = prompt.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ").split(/\s+/).map((w) => w.trim()).filter((w) => w.length >= 3 && !["quiero", "hacer", "para", "personas", "lista", "con", "los", "las", "que", "una", "uno", "unos", "unas", "precios", "mejores", "favor", "como"].includes(w.toLowerCase()));
  const fallbackItems = words.slice(0, 6).map((word) => ({
    nombre: word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    cantidad: Math.max(1, Math.round(personas * 1)),
    formato: "unidades"
  }));
  if (fallbackItems.length === 0) {
    fallbackItems.push({ nombre: "Arroz blanco", cantidad: 500, formato: "gramos" });
    fallbackItems.push({ nombre: "Huevos AA", cantidad: Math.max(2, personas * 2), formato: "unidades" });
  }
  return {
    receta: `Receta Personalizada (${prompt.slice(0, 35)}…)`,
    descripcion: `Ingredientes recomendados para tu preparación pensada para ${personas} personas.`,
    porciones: personas,
    ingredientes: fallbackItems,
    consejo: "Compara entre las tiendas ganadoras para ver en cuál supermercado sale más barata tu preparación.",
    origen: "catalogo_inteligente"
  };
}
async function resolveWithGemini(prompt, personas) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const systemInstruction = `Actúa como un experto chef y asesor de compras en supermercados colombianos (Éxito, Jumbo, Carulla, D1, Olímpica, etc.).
El usuario te pedirá una comida, receta o necesidad de mercado.
Debes generar la lista exacta de ingredientes para comprar en el supermercado en Colombia, con cantidades realistas para ${personas} personas y unidades estándar ("gramos", "mililitros", "unidades").
Debes responder ÚNICAMENTE con un objeto JSON válido, sin bloques de código markdown (\`\`\`json) ni texto adicional.
Estructura requerida:
{
  "receta": "Nombre atractivo de la receta o plato",
  "descripcion": "Breve descripción apetitosa de la preparación",
  "porciones": ${personas},
  "ingredientes": [
    {
      "nombre": "Nombre del producto en supermercado colombiano (ej. Carne molida de res, Pasta espagueti, Salsa de tomate, Cebolla cabezona)",
      "cantidad": 500,
      "formato": "gramos" | "mililitros" | "unidades",
      "notas": "opcional, ej. 'Para la salsa'"
    }
  ],
  "consejo": "Consejo práctico de ahorro o de cocina colombiana para esta preparación"
}`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9e3);
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: `${systemInstruction}

Solicitud del usuario: "${prompt}". Número de personas: ${personas}.` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 900
        }
      })
    });
    clearTimeout(timer);
    if (!res.ok) {
      console.warn("Gemini API returned status:", res.status);
      return null;
    }
    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    if (!parsed.receta || !Array.isArray(parsed.ingredientes) || parsed.ingredientes.length === 0) {
      return null;
    }
    const cleanIngredients = parsed.ingredientes.slice(0, 12).map((ing) => {
      let fmt = "unidades";
      const rawFmt = String(ing.formato || "").toLowerCase();
      if (rawFmt.includes("g") || rawFmt.includes("gram")) fmt = "gramos";
      else if (rawFmt.includes("ml") || rawFmt.includes("mili") || rawFmt.includes("litr")) fmt = "mililitros";
      const qty = typeof ing.cantidad === "number" && ing.cantidad > 0 ? ing.cantidad : 1;
      return {
        nombre: String(ing.nombre || "").trim(),
        cantidad: qty,
        formato: fmt,
        notas: ing.notas ? String(ing.notas).trim() : void 0
      };
    });
    return {
      receta: String(parsed.receta).trim(),
      descripcion: String(parsed.descripcion || "").trim(),
      porciones: Number(parsed.porciones) || personas,
      ingredientes: cleanIngredients,
      consejo: parsed.consejo ? String(parsed.consejo).trim() : void 0,
      origen: "gemini"
    };
  } catch (err) {
    console.warn("Gemini request failed or timed out:", err);
    return null;
  }
}
const POST = async ({ request }) => {
  const limit = checkRateLimit(request, {
    prefix: "api-asistente",
    windowMs: 6e4,
    max: 15
  });
  if (!limit.allowed) {
    return rateLimitResponse(limit);
  }
  try {
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 5e4) {
      return new Response(
        JSON.stringify({ detail: "La solicitud excede el tamaño máximo permitido" }),
        { status: 413, headers: { "Content-Type": "application/json" } }
      );
    }
    const body = await request.json();
    const prompt = (body.prompt || "").trim();
    if (prompt.length < 2) {
      return new Response(
        JSON.stringify({ detail: "Por favor escribe qué comida o receta deseas preparar." }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }
    if (prompt.length > 500) {
      return new Response(
        JSON.stringify({ detail: "La consulta es demasiado larga (máximo 500 caracteres)." }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }
    const fallbackPersonas = typeof body.personas === "number" && body.personas >= 1 && body.personas <= 20 ? body.personas : 2;
    const personas = extractPersonasFromPrompt(prompt, fallbackPersonas);
    let result = await resolveWithGemini(prompt, personas);
    if (!result) {
      result = resolveWithLocalEngine(prompt, personas);
    }
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (err) {
    console.error("Error en /api/asistente:", err);
    return new Response(
      JSON.stringify({ detail: "Error interno al procesar tu solicitud con el asistente." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
