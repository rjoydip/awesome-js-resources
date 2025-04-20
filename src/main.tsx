import { createRoot } from "preact/compat/client";
import { StrictMode } from "preact/compat";
import {
	createRootRoute,
	createRoute,
	createRouter,
	ErrorComponent,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Markdown from "react-markdown";
import remarkGemoji from "remark-gemoji";
import remarkGithubAlerts from "remark-gh-alerts";
import remarkGfm from "remark-gfm";
import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import theme from "@shikijs/themes/vitesse-light";
import { BuiltinLanguage } from "shiki";

import "remark-gh-alerts/styles/github-colors-light.css";

const highlighter = await createHighlighterCore({
	langs: [
		import("@shikijs/langs/javascript"),
		import("@shikijs/langs/typescript"),
	],
	themes: [
		import("@shikijs/themes/vitesse-light"),
	],
	engine: createJavaScriptRegexEngine(),
});

export function Renderer(
	{ content = "", filePath = "" }: {
		content?: string | null;
		filePath?: string;
	},
) {
	let lang: BuiltinLanguage = "markdown";

	if (
		filePath.includes(".js") || filePath.includes(".cjs") ||
		filePath.includes(".mjs")
	) {
		lang = "javascript";
	}

	if (
		filePath.includes(".ts") || filePath.includes(".cts") ||
		filePath.includes(".mts")
	) {
		lang = "typescript";
	}

	if (lang === "markdown") {
		return (
			<Markdown
				children={content}
				remarkPlugins={[
					remarkGfm,
					remarkGemoji,
					remarkGithubAlerts,
				]}
				rehypePlugins={[
					[rehypeShikiFromHighlighter, highlighter, {
						theme,
					}],
				]}
			/>
		);
	} else {
		const html = highlighter.codeToHtml(content ?? "", {
			lang,
			themes: {
				light: "vitesse-light",
			},
		});
		return <div dangerouslySetInnerHTML={{ __html: html }} />;
	}
}

const rootRoute = createRootRoute({
	component: () => (
		<>
			<Outlet />
			{import.meta.env.DEV && <TanStackRouterDevtools />}
		</>
	),
});

const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "*",
	loader: async ({ params }: any) => {
		const param = params["_splat"];
		console.log(">>>> [params]: ", params);
		const filePath = import.meta.env.PROD
			? `https://raw.githubusercontent.com/rjoydip/awesome-js-resources/refs/heads/main/${
				param === "awesome-js-resources"
					? "/README.md"
					: `/src/${param.replace("awesome-js-resources", "/")}`
			}`
			: param === ""
			? "/README.md"
			: param;

		console.log(">>>> [filePath]: ", filePath);

		try {
			if (filePath) {
				const response = await fetch(filePath);
				if (!response.ok) {
					throw new Error(
						`Failed to load markdown: ${response.status}`,
					);
				}
				const content = await response.text();
				return { content, filePath };
			} else {
				return { error: "File path is missing" };
			}
		} catch (error) {
			console.error("Error loading markdown:", error);
			return { error: (error as Error).message };
		}
	},
	errorComponent: ErrorComponent,
	component: function Index() {
		const { content, filePath } = indexRoute.useLoaderData();
		return <Renderer content={content} filePath={filePath} />;
	},
});

const routeTree = rootRoute.addChildren([indexRoute]);

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	scrollRestoration: true,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("app")!;
if (!rootElement.innerHTML) {
	const root = createRoot(rootElement);
	root.render(
		<StrictMode>
			<RouterProvider router={router} />
		</StrictMode>,
	);
}
