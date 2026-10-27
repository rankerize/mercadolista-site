import type { APIRoute } from 'astro';
import { checkRateLimit, rateLimitResponse } from '../../lib/rateLimit';
import { getSuggestions } from '../../lib/suggestions';

export const GET: APIRoute = async ({ request, url }) => {
  // Cada tecla dispara una consulta: el límite es más alto que el de /api/buscar
  const limit = checkRateLimit(request, {
    prefix: 'api-sugerencias',
    windowMs: 60_000,
    max: 120,
  });
  if (!limit.allowed) {
    return rateLimitResponse(limit);
  }

  const query = (url.searchParams.get('q') || '').trim().replace(/\s+/g, ' ');

  return new Response(
    JSON.stringify({ query, suggestions: getSuggestions(query) }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    }
  );
};
