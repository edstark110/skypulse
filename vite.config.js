import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ATLAS — Vite config.
// Output goes to dist/. Vercel auto-detects vite and runs `vite build`.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          motion: ['framer-motion'],
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
