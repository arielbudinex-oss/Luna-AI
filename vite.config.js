import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5176, strictPort: true },
  // tools/poster adalah alat lokal, bukan halaman situs; jangan ikut dipindai.
  optimizeDeps: { entries: ['index.html'] },
  build: { outDir: 'dist' },
});
