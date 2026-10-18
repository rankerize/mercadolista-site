import { describe, it, expect } from 'vitest';
import {
  parseCop,
  cleanEan,
  cop,
  relevance,
  unitPrice,
  saleMeasure,
} from '../src/lib/normalize';
import { findCity } from '../src/lib/cities';
import { storeCatalog } from '../src/lib/providers';
import { buildReport } from '../src/lib/ranking';
import { buildUnitReport } from '../src/lib/units';
import type { Offer, StoreOutcome } from '../src/lib/types';

describe('Comparador Core Normalization Tests', () => {
  it('parses COP currency and validates EAN barcodes', () => {
    expect(parseCop('3.999.900')).toBe(3999900);
    expect(parseCop('$ 2.190')).toBe(2190);
    expect(cleanEan('7702129001052')).toBe('7702129001052');
    expect(cleanEan('123')).toBeNull();
    expect(cop(2190)).toBe('$ 2.190');
  });

  it('matches synonyms like televisor and tv', () => {
    const score = relevance('televisor 55', 'TV TCL 55" Pulgadas QLED', 'TCL');
    expect(score).toBe(1);
  });

  it('calculates unit prices for liquids and multipacks', () => {
    const single = unitPrice('Leche Entera Colanta x200ml', 2000);
    expect(single?.per).toBe('L');
    expect(single?.amount).toBe(10000);

    const pack = unitPrice('Leche Alqueria 1.3L x 6 unds', 7800);
    expect(pack?.per).toBe('L');
    expect(pack?.amount).toBe(1000);
  });

  it('measures count and weight accurately', () => {
    const eggs = saleMeasure('Huevos AA x 30 unds', 15000);
    expect(eggs?.basis).toBe('unidad');
    expect(eggs?.quantity).toBe(30);
    expect(eggs?.amount).toBe(500);

    const rice = saleMeasure('Arroz Roa 1000g', 4500);
    expect(rice?.basis).toBe('gramo');
    expect(rice?.quantity).toBe(1000);
    expect(rice?.amount).toBe(4.5);
  });
});

describe('Catalogs and Reports', () => {
  it('loads city and store catalogs', () => {
    const city = findCity('bogota');
    expect(city.name).toBe('Bogotá');
    const stores = storeCatalog();
    expect(stores.length).toBeGreaterThan(5);
  });

  it('builds standard comparison report', () => {
    const mockOffer: Offer = {
      store_id: 'jumbo',
      store_name: 'Jumbo',
      name: 'Leche entera Colanta 1100 ml',
      brand: 'Colanta',
      price: 4500,
      url: 'https://www.jumbocolombia.com/leche/p',
      ean: '7702129001052',
      categories: ['Mercado', 'Lacteos'],
    };

    const outcome: StoreOutcome = {
      store_id: 'jumbo',
      store_name: 'Jumbo',
      kind: 'supermercado',
      offers: [mockOffer],
    };

    const report = buildReport('leche colanta', [outcome]);
    expect(report.verdict).toBeDefined();
    expect(report.verdict.store_name).toBe('Jumbo');
    expect(report.verdict.price).toBe(4500);
  });
});
