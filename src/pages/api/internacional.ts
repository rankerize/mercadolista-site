import type { APIRoute } from 'astro';
import { buildInternationalReport, searchInternational } from '../../lib/international';
import { checkRateLimit, rateLimitResponse } from '../../lib/rateLimit';

export const GET: APIRoute = async ({ request, url }) => {
  // Limitar a máximo 20 búsquedas internacionales por minuto por IP
  const limit = checkRateLimit(request, {
    prefix: 'api-intl',
    windowMs: 60_000,
    max: 20,
  });
  if (!limit.allowed) {
    return rateLimitResponse(limit);
  }

  const q = url.searchParams.get('q') || '';
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
    const outcomes = await searchInternational(query);
    const report = buildInternationalReport(query, outcomes);

    return new Response(JSON.stringify(report), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ detail: err.message || 'Error en búsqueda internacional' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
