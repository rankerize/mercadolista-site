import type { APIRoute } from 'astro';
import { buildInternationalReport, searchInternational } from '../../lib/international';

export const GET: APIRoute = async ({ url }) => {
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
