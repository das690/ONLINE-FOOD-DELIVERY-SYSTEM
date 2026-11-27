import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react') || id.includes('canvas-confetti')) {
              return 'ui';
            }
            if (id.includes('react') || id.includes('redux')) {
              return 'vendor';
            }
          }
        }
      }
    }
  }
});
