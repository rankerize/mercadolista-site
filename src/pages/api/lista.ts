import type { APIRoute } from 'astro';
import { findCity } from '../../lib/cities';
import { makeItem, searchList, type ListItem } from '../../lib/shopping';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const ciudadParam = body.ciudad || 'bogota';
    const rawItems = Array.isArray(body.items) ? body.items : [];

    if (rawItems.length === 0 || rawItems.length > 15) {
      return new Response(
        JSON.stringify({ detail: 'La lista debe contener entre 1 y 15 productos' }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const items: ListItem[] = [];
    for (const row of rawItems) {
      const nombre = (row.nombre || '').trim();
      if (nombre.length < 2) {
        return new Response(
          JSON.stringify({ detail: 'Cada producto necesita un nombre de al menos 2 caracteres' }),
          { status: 422, headers: { 'Content-Type': 'application/json' } }
        );
      }
      const formato = row.formato || 'unidades';
      if (!['gramos', 'mililitros', 'unidades'].includes(formato)) {
        return new Response(
          JSON.stringify({ detail: `Formato inválido: ${formato}` }),
          { status: 422, headers: { 'Content-Type': 'application/json' } }
        );
      }
      const cantidad = Number(row.cantidad);
      if (isNaN(cantidad) || cantidad <= 0 || cantidad > 1000000) {
        return new Response(
          JSON.stringify({ detail: 'Cantidad inválida' }),
          { status: 422, headers: { 'Content-Type': 'application/json' } }
        );
      }
      items.push(makeItem(nombre, row.marca || 'TODAS', formato, cantidad));
    }

    const city = findCity(ciudadParam);
    const report = await searchList(items, city);

    return new Response(JSON.stringify(report), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ detail: err.message || 'Error al procesar la lista' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
