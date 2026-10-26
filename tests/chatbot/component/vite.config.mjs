import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'test-results/component-dist',
    rollupOptions: { input: fileURLToPath(new URL('./index.html', import.meta.url)) },
  },
});
