// @ts-check

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
// site and base are auto-injected by withastro/action@v5 during GitHub Pages deployment
export default defineConfig({
	output: "static",
	site: "https://hnrq.github.io",
	base: "/OpenCoach",
	vite: {
		plugins: [tailwindcss()],
	},
});
