import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // Force single instance of strudel packages to prevent
      // "loaded more than once" issues with @strudel/soundfonts
      '@strudel/core': path.resolve(__dirname, 'node_modules/@strudel/core'),
      '@strudel/webaudio': path.resolve(__dirname, 'node_modules/@strudel/webaudio'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
