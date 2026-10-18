import { describe, it, expect } from 'vitest';
import { cleanEan, cop, parseCop, relevance, saleMeasure, unitPrice } from '../src/lib/normalize';
import { findCity, cityCatalog } from '../src/lib/cities';
import { vtexSegment, parseAlgoliaConfig } from '../src/lib/providers/vtex';
import { buildReport } from '../src/lib/ranking';
import { buildUnitReport } from '../src/lib/units';
import { makeItem, buildListReport } from '../src/lib/shopping';
import type { Offer, StoreOutcome } from '../src/lib/types';

describe('Normalize and parsing', () => {
  it('parses cop and ean correctly', () => {
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

  it('calculates unit price for milliliters and pack', () => {
    const single = unitPrice('Leche Entera Colanta x200ml', 2000);
    expect(single?.per).toBe('L');
    expect(single?.amount).toBe(10000);

    const pack = unitPrice('Leche Alqueria 1.3L x 6 unds', 7800);
    expect(pack?.per).toBe('L');
    expect(pack?.amount).toBe(1000);
  });

  it('counts units and grams in saleMeasure', () => {
    const eggs = saleMeasure('Canasta de 30 huevos', 15000);
    expect(eggs?.per).toBe('unidad');
    expect(eggs?.amount).toBe(500);

    const rice = saleMeasure('Arroz Roa 500 g', 2500);
    expect(rice?.per).toBe('gramo');
    expect(rice?.amount).toBe(5);

    const kilo = saleMeasure('Arroz Roa 1 kg', 4000);
    expect(kilo?.amount).toBe(4);
  });

  it('finds cities and catalogs', () => {
    expect(findCity('medellin').name).toBe('Medellín');
    expect(findCity('desconocida').name).toBe('Bogotá');
    expect(cityCatalog().length).toBeGreaterThan(5);
  });
});
