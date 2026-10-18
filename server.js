import fs from 'node:fs';
import { execSync } from 'node:child_process';

const entryPath = './dist/server/entry.mjs';
if (!fs.existsSync(entryPath)) {
  console.log('[Hostinger] dist/server/entry.mjs no encontrado. Ejecutando npm run build...');
  execSync('npm run build', { stdio: 'inherit' });
}

await import(entryPath);
