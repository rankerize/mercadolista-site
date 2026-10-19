import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://mercadolista.com',
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  server: {
    port: Number(process.env.PORT) || 8765,
    host: process.env.HOST || '0.0.0.0',
  },
});
