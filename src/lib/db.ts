import pg from 'pg';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const { Pool } = pg;

export class DatabaseUnavailable extends Error {
  constructor(message = 'Base de datos no disponible') {
    super(message);
    this.name = 'DatabaseUnavailable';
  }
}

export class Conflict extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Conflict';
  }
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL CHECK (char_length(nombre) BETWEEN 2 AND 60),
    correo TEXT UNIQUE,
    telefono TEXT UNIQUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (correo IS NOT NULL OR telefono IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS sesiones (
    token_hash TEXT PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS listas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL CHECK (char_length(nombre) BETWEEN 1 AND 60),
    ciudad TEXT NOT NULL DEFAULT 'bogota',
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (usuario_id, nombre)
);

CREATE TABLE IF NOT EXISTS lista_productos (
    id BIGSERIAL PRIMARY KEY,
    lista_id BIGINT NOT NULL REFERENCES listas(id) ON DELETE CASCADE,
    posicion SMALLINT NOT NULL,
    nombre TEXT NOT NULL,
    marca TEXT NOT NULL DEFAULT 'TODAS',
    formato TEXT NOT NULL CHECK (formato IN ('gramos', 'mililitros', 'unidades')),
    cantidad DOUBLE PRECISION NOT NULL CHECK (cantidad > 0),
    UNIQUE (lista_id, posicion)
);

CREATE INDEX IF NOT EXISTS listas_usuario_idx ON listas (usuario_id);
CREATE INDEX IF NOT EXISTS sesiones_usuario_idx ON sesiones (usuario_id);
`;

const MAX_LISTS_PER_USER = 30;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

let pool: pg.Pool | null = null;
let schemaInitialized = false;

function readEnvFile(): Record<string, string> {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const values: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [k, ...v] = trimmed.split('=');
    values[k.trim()] = v.join('=').trim();
  }
  return values;
}

export function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL || readEnvFile()['DATABASE_URL'];
}

export async function getPool(): Promise<pg.Pool> {
  if (pool) return pool;
  const url = databaseUrl();
  if (!url) {
    throw new DatabaseUnavailable('Falta DATABASE_URL');
  }

  const newPool = new Pool({
    connectionString: url,
    connectionTimeoutMillis: 4000,
  });

  try {
    const client = await newPool.connect();
    try {
      if (!schemaInitialized) {
        await client.query(SCHEMA);
        schemaInitialized = true;
      }
    } finally {
      client.release();
    }
  } catch (err: any) {
    throw new DatabaseUnavailable(err.message || String(err));
  }

  pool = newPool;
  return pool;
}

export function parseContact(raw: string): ['correo' | 'telefono', string] {
  const value = raw.trim();
  if (value.includes('@')) {
    const email = value.toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 120) {
      throw new Error('Ese correo no parece válido');
    }
    return ['correo', email];
  }
  let digits = value.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('57')) {
    digits = digits.slice(2);
  }
  if (digits.length < 7 || digits.length > 15) {
    throw new Error('Escribe un correo o un teléfono de 7 a 15 dígitos');
  }
  return ['telefono', digits];
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

async function newSession(client: pg.PoolClient | pg.Pool, userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString('base64url');
  await client.query(
    'INSERT INTO sesiones (token_hash, usuario_id) VALUES ($1, $2)',
    [hashToken(token), userId]
  );
  return token;
}

function userRecord(row: any): Record<string, any> {
  return {
    id: Number(row.id),
    nombre: row.nombre,
    correo: row.correo,
    telefono: row.telefono,
  };
}

export async function register(name: string, contact: string): Promise<[Record<string, any>, string]> {
  const [kind, value] = parseContact(contact);
  const p = await getPool();
  const client = await p.connect();
  try {
    await client.query('BEGIN');
    const cleanName = name.trim().replace(/\s+/g, ' ');
    const query = `INSERT INTO usuarios (nombre, ${kind}) VALUES ($1, $2) RETURNING *`;
    let res: pg.QueryResult;
    try {
      res = await client.query(query, [cleanName, value]);
    } catch (err: any) {
      await client.query('ROLLBACK');
      if (err.code === '23505') {
        const label = kind === 'correo' ? 'ese correo' : 'ese teléfono';
        throw new Conflict(`Ya hay una cuenta con ${label}. Usa Entrar.`);
      }
      throw err;
    }
    const user = userRecord(res.rows[0]);
    const token = await newSession(client, user.id);
    await client.query('COMMIT');
    return [user, token];
  } finally {
    client.release();
  }
}

export async function login(contact: string): Promise<[Record<string, any>, string] | null> {
  const [kind, value] = parseContact(contact);
  const p = await getPool();
  const res = await p.query(`SELECT * FROM usuarios WHERE ${kind} = $1`, [value]);
  if (res.rows.length === 0) return null;
  const user = userRecord(res.rows[0]);
  const token = await newSession(p, user.id);
  return [user, token];
}

export async function userForToken(token?: string | null): Promise<Record<string, any> | null> {
  if (!token) return null;
  const p = await getPool();
  const res = await p.query(
    'SELECT u.* FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id WHERE s.token_hash = $1',
    [hashToken(token)]
  );
  return res.rows.length > 0 ? userRecord(res.rows[0]) : null;
}

export async function logout(token?: string | null): Promise<void> {
  if (!token) return;
  const p = await getPool();
  await p.query('DELETE FROM sesiones WHERE token_hash = $1', [hashToken(token)]);
}

function listRecord(row: any, items: any[]): Record<string, any> {
  return {
    id: Number(row.id),
    nombre: row.nombre,
    ciudad: row.ciudad,
    actualizado_en: new Date(row.actualizado_en).toISOString(),
    items: items.map((item) => ({
      nombre: item.nombre,
      marca: item.marca,
      formato: item.formato,
      cantidad: Number(item.cantidad),
    })),
  };
}

export async function userLists(userId: number): Promise<Record<string, any>[]> {
  const p = await getPool();
  const listsRes = await p.query(
    'SELECT * FROM listas WHERE usuario_id = $1 ORDER BY actualizado_en DESC',
    [userId]
  );
  const itemsRes = await p.query(
    `SELECT p.* FROM lista_productos p JOIN listas l ON l.id = p.lista_id
     WHERE l.usuario_id = $1 ORDER BY p.lista_id, p.posicion`,
    [userId]
  );

  const byList = new Map<number, any[]>();
  for (const item of itemsRes.rows) {
    const listId = Number(item.lista_id);
    if (!byList.has(listId)) byList.set(listId, []);
    byList.get(listId)!.push(item);
  }

  return listsRes.rows.map((row) => listRecord(row, byList.get(Number(row.id)) || []));
}

async function writeItems(client: pg.PoolClient, listId: number, items: any[]): Promise<void> {
  await client.query('DELETE FROM lista_productos WHERE lista_id = $1', [listId]);
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    await client.query(
      `INSERT INTO lista_productos (lista_id, posicion, nombre, marca, formato, cantidad)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [listId, i, item.nombre, item.marca, item.formato, item.cantidad]
    );
  }
}

export async function saveList(
  userId: number,
  name: string,
  city: string,
  items: any[],
  listId?: number | null
): Promise<Record<string, any> | null> {
  const p = await getPool();
  const client = await p.connect();
  const cleanName = name.trim().replace(/\s+/g, ' ');

  try {
    await client.query('BEGIN');
    let listRow: any;

    if (listId == null) {
      const countRes = await client.query('SELECT count(*) FROM listas WHERE usuario_id = $1', [userId]);
      if (parseInt(countRes.rows[0].count, 10) >= MAX_LISTS_PER_USER) {
        throw new Conflict(`Puedes guardar hasta ${MAX_LISTS_PER_USER} listas`);
      }
      try {
        const res = await client.query(
          'INSERT INTO listas (usuario_id, nombre, ciudad) VALUES ($1, $2, $3) RETURNING *',
          [userId, cleanName, city]
        );
        listRow = res.rows[0];
      } catch (err: any) {
        if (err.code === '23505') {
          throw new Conflict(`Ya tienes una lista llamada ${cleanName}`);
        }
        throw err;
      }
    } else {
      try {
        const res = await client.query(
          `UPDATE listas SET nombre = $3, ciudad = $4, actualizado_en = now()
           WHERE id = $1 AND usuario_id = $2 RETURNING *`,
          [listId, userId, cleanName, city]
        );
        if (res.rows.length === 0) {
          await client.query('ROLLBACK');
          return null;
        }
        listRow = res.rows[0];
      } catch (err: any) {
        if (err.code === '23505') {
          throw new Conflict(`Ya tienes una lista llamada ${cleanName}`);
        }
        throw err;
      }
    }

    await writeItems(client, Number(listRow.id), items);
    const savedItemsRes = await client.query(
      'SELECT * FROM lista_productos WHERE lista_id = $1 ORDER BY posicion',
      [listRow.id]
    );
    await client.query('COMMIT');
    return listRecord(listRow, savedItemsRes.rows);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteList(userId: number, listId: number): Promise<boolean> {
  const p = await getPool();
  const res = await p.query('DELETE FROM listas WHERE id = $1 AND usuario_id = $2', [listId, userId]);
  return (res.rowCount ?? 0) > 0;
}
