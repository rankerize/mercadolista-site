import type { APIRoute } from 'astro';
import { cityCatalog } from '../../lib/cities';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(cityCatalog()), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
