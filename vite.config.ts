import { defineConfig } from "vite"
import preact from "@preact/preset-vite"
import topLevelAwait from "vite-plugin-top-level-await"
import { isCI } from 'std-env'

import { PROD_BASE_URL } from './src/constant'

export default defineConfig({
	base: isCI ? PROD_BASE_URL: '/',
	plugins: [
		preact(),
		topLevelAwait()
	],
	optimizeDeps: {
		entries: ["shiki", "remark-inline-links", "remark-gh-alerts"]
	}
})
