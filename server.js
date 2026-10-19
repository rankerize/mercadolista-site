import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configurar host y puerto para Hostinger / cPanel
process.env.HOST = process.env.HOST || '0.0.0.0';
if (!process.env.PORT && process.env.SERVER_PORT) {
  process.env.PORT = process.env.SERVER_PORT;
}
process.env.PORT = process.env.PORT || '3000';

// Buscar el archivo entrypoint generado por Astro
const candidates = [
  path.join(__dirname, 'dist', 'server', 'entry.mjs'),
  path.join(__dirname, 'server', 'entry.mjs'),
  path.join(__dirname, '.astro', 'entry.mjs')
];

const entryFile = candidates.find((filePath) => fs.existsSync(filePath));

if (!entryFile) {
  console.error('[MercadoLista] Error: No se encontró el entrypoint de Astro (dist/server/entry.mjs ni server/entry.mjs).');
  console.error('[MercadoLista] Asegúrate de haber ejecutado: npm run build');
  process.exit(1);
}

console.log(`[MercadoLista] Servidor arrancando desde: ${entryFile}`);
console.log(`[MercadoLista] Escuchando en ${process.env.HOST}:${process.env.PORT}`);

// Importar y ejecutar el servidor standalone de Astro
await import(pathToFileURL(entryFile).href);
