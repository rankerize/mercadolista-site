import type { APIRoute } from 'astro';
import { storeCatalog } from '../../lib/providers';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(storeCatalog()), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
