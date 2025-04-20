import { defineConfig } from "vite"
import preact from "@preact/preset-vite"
import topLevelAwait from "vite-plugin-top-level-await"

export default defineConfig({
	plugins: [
		preact(),
		topLevelAwait()
	],
	optimizeDeps: {
		entries: ["shiki", "remark-inline-links", "remark-gh-alerts"]
	}
})
