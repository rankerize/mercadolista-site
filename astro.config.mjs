import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://mercadolista.com',
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  server: {
    port: 8765,
    host: '127.0.0.1',
  },
});
