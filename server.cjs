'use strict';
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

process.env.HOST = process.env.HOST || '0.0.0.0';
if (!process.env.PORT && process.env.SERVER_PORT) {
  process.env.PORT = process.env.SERVER_PORT;
}
process.env.PORT = process.env.PORT || '3000';

const candidates = [
  path.join(__dirname, 'server', 'entry.mjs'),
  path.join(__dirname, 'dist', 'server', 'entry.mjs'),
  path.join(__dirname, '.astro', 'entry.mjs'),
];

const entryFile = candidates.find((f) => fs.existsSync(f));

if (!entryFile) {
  console.error('[MercadoLista] Error: No se encontró server/entry.mjs ni dist/server/entry.mjs.');
  console.error('[MercadoLista] Asegúrate de haber ejecutado: npm run build');
  process.exit(1);
}

console.log('[MercadoLista] Servidor arrancando desde: ' + entryFile);
console.log('[MercadoLista] Escuchando en ' + process.env.HOST + ':' + process.env.PORT);

import(pathToFileURL(entryFile).href).catch(function (err) {
  console.error('[MercadoLista] Error al iniciar el servidor:', err);
  process.exit(1);
});
