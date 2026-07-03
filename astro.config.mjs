// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import { publicStaticPlugin } from './vite-public-static.mjs';

// GitHub Pages プロジェクトサイト: BASE_PATH=/${リポジトリ名}/ を Actions で設定
// ユーザーサイト (username.github.io) の場合は BASE_PATH=/ または未設定
const base = process.env.BASE_PATH || '/';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  base,

  vite: {
    plugins: [publicStaticPlugin(), tailwindcss()],
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        'react/jsx-dev-runtime': fileURLToPath(
          new URL('./src/lib/react-jsx-dev-runtime-shim.ts', import.meta.url),
        ),
      },
    },
    oxc: {
      jsx: {
        development: false,
      },
    },
    optimizeDeps: {
      include: ['mapbox-gl', 'p5', 'react', 'react-dom', 'react/jsx-runtime'],
    },
    ssr: {
      noExternal: ['mapbox-gl'],
      external: ['p5'],
    },
  },

  integrations: [react()],
});
