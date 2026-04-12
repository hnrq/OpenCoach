// @ts-check

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  output: "static",

  vite: {
      plugins: [tailwindcss()],
	},

  adapter: netlify(),
});