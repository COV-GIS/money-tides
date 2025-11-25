// https://vitejs.dev/config/

import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  server: {
    open: true,
  },
  build: {
    outDir: './../dist',
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/c-[name]-[hash].js',
      },
    },
  },
  esbuild: {
    jsxFactory: 'tsx',
  },
});
