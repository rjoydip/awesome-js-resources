import { defineConfig } from "vite"
import preact from "@preact/preset-vite"
import topLevelAwait from "vite-plugin-top-level-await"

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		preact(),
		topLevelAwait()
	],
	optimizeDeps: {
		entries: ["shiki", "remark-inline-links", "remark-gh-alerts"]
	}
})
