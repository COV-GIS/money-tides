// https://vitejs.dev/config/

import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  base: '/money-tides/',
  server: {
    open: true,
  },
  build: {
    outDir: './../dist',
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/money-tides-[name]-[hash].js',
      },
    },
  },
  esbuild: {
    jsxFactory: 'tsx',
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import'],
      },
    },
  },
});
