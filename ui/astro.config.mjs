// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
// site and base are auto-injected by withastro/action@v5 during GitHub Pages deployment
export default defineConfig({
  output: 'static',
  site: 'https://hnrq.github.io',
  base: '/OpenCoach',
  vite: {
    plugins: [tailwindcss()],
  },
});
