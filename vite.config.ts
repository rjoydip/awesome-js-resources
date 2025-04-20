import { defineConfig } from "vite"
import preact from "@preact/preset-vite"
import topLevelAwait from "vite-plugin-top-level-await"
import { isCI } from 'std-env'

export default defineConfig({
	base: isCI ? '/awesome-js-resources/': '/',
	plugins: [
		preact(),
		topLevelAwait()
	],
	optimizeDeps: {
		entries: ["shiki", "remark-inline-links", "remark-gh-alerts"]
	}
})
