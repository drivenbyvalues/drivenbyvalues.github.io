import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  // harfbuzzjs (complex-script shaping on /glass/) initialises its WebAssembly
  // with top-level await, which needs an ES2022 target.
  build: {
    target: 'es2022',
  },
  optimizeDeps: {
    exclude: ['lucide-react', 'harfbuzzjs'],
    esbuildOptions: { target: 'es2022' },
  },
});
