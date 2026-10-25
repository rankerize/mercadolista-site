import type { APIRoute } from 'astro';
import { CATEGORIES } from '../../lib/catalog';
import { findCity } from '../../lib/cities';
import { searchStores } from '../../lib/providers';
import { buildUnitReport, type UnitFilters } from '../../lib/units';
import { checkRateLimit, rateLimitResponse } from '../../lib/rateLimit';

const UNIT_OPTIONS = new Set(['todas', 'gramos', 'mililitros', 'unidades']);
const CATEGORY_OPTIONS = new Set(['todas', ...CATEGORIES.map((category) => category.id)]);

export const GET: APIRoute = async ({ request, url }) => {
  // Limitar a máximo 30 búsquedas por minuto por IP
  const limit = checkRateLimit(request, {
    prefix: 'api-unidad',
    windowMs: 60_000,
    max: 30,
  });
  if (!limit.allowed) {
    return rateLimitResponse(limit);
  }

  const q = url.searchParams.get('q') || '';
  const ciudadParam = url.searchParams.get('ciudad') || 'bogota';
  const unidad = url.searchParams.get('unidad') || 'todas';
  const categoria = url.searchParams.get('categoria') || 'todas';
  const minimoRaw = (url.searchParams.get('minimo') || '').trim().replace(',', '.');
  const query = q.trim().replace(/\s+/g, ' ');
  let minimo: number | null = null;

  if (minimoRaw) {
    minimo = Number(minimoRaw);
    if (!Number.isFinite(minimo) || minimo <= 0 || minimo > 1_000_000) {
      return new Response(
        JSON.stringify({ detail: 'La cantidad mínima debe ser un número mayor que cero' }),
        {
          status: 422,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  if (!UNIT_OPTIONS.has(unidad) || !CATEGORY_OPTIONS.has(categoria)) {
    return new Response(
      JSON.stringify({ detail: 'Unidad o categoría no válida' }),
      {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (query.length < 2) {
    return new Response(
      JSON.stringify({ detail: 'Escribe al menos 2 caracteres' }),
      {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const city = findCity(ciudadParam);
    const outcomes = await searchStores(query, city);
    const filters: UnitFilters = {
      basis: unidad as UnitFilters['basis'],
      categoryId: categoria,
      minQuantity: unidad === 'todas' ? null : minimo,
    };
    const report = buildUnitReport(query, outcomes, filters);
    report.city = { id: city.id, name: city.name };

    return new Response(JSON.stringify(report), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ detail: err.message || 'Error al buscar por unidad' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
