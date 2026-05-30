import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@app': new URL('./src/app', import.meta.url).pathname,
      '@features': new URL('./src/features', import.meta.url).pathname,
      '@shared': new URL('./src/shared', import.meta.url).pathname,
    },
  },
});
