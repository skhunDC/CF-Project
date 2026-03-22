import { cloudflare } from '@cloudflare/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  plugins: [mode === 'test' ? null : cloudflare(), react()].filter(Boolean),
  server: {
    port: 5173,
  },
  build: {
    sourcemap: true,
  },
}));
