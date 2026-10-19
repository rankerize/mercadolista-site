import type { APIRoute } from 'astro';
import { findCity } from '../../lib/cities';
import { searchStores } from '../../lib/providers';
import { buildUnitReport } from '../../lib/units';
import { checkRateLimit, rateLimitResponse } from '../../lib/rateLimit';

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
  const query = q.trim().replace(/\s+/g, ' ');

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
    const report = buildUnitReport(query, outcomes);
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
