import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Widget build configuration
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/widget/main.tsx'),
      name: 'ReviewWidget',
      fileName: (format) => `review-widget.${format}.js`,
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        extend: true,
        name: 'ReviewWidget',
        format: 'iife',
        globals: {}
      },
    },
    outDir: 'dist/widget',
    emptyOutDir: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
    cssCodeSplit: false,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});

