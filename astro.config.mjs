// @ts-check
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
    optimizeDeps: {
      include: ['mapbox-gl', 'p5'],
    },
    ssr: {
      noExternal: ['mapbox-gl'],
      external: ['p5'],
    },
  },

  integrations: [react()],
});
