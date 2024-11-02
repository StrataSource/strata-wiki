/** I PROMISE ill remove this - baguettery */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import fs from "fs";
import { parseMarkdown } from "./markdown.server";
import { reportLint } from "$lib/linter.server";
import * as Typedoc from "./panorama/typedoc";

// TODO: DUMB!!!! IDIOT!!!
const pageToIdCache: Record<string, number> = {};
const sourceCache: Record<string, any> = {};
let panoArticles: MenuArticle[]|null = null;

/** Provides the contents of a page with the given path and pageName. */
export function parsePanorama(path: string, pageName: string) {
	const element = sourceCache[pageToIdCache[pageName]];
	const out: string[] = [];

	for (const child of element.children) {
		out.push(Typedoc.parseDeclaration(child));
	}

	return parseMarkdown(out.join('\n\n'), `${path}/${pageName}`);
}

/** Provides a list of pages to render and display in the sidebar. Called VERY OFTEN! */
export function getPanoramaTopic() {
	// TODO: REMOVE ME!!!!
	if (!panoArticles) {
		const jsonRaw = fs.readFileSync('../docs/panorama/reference/panorama.json', 'utf-8');
		const jsonObj = JSON.parse(jsonRaw);
		Typedoc.generateCache(jsonObj, sourceCache);
		panoArticles = Typedoc.parseNamespace(jsonObj, true, pageToIdCache);
	}
	return panoArticles;
}

/** Slower variant of the above function. Called on page load, providing a list of features. */
export function getPanoramaPageMeta(pageName: string) {
	const meta: ArticleMeta = {
		id: pageName,
		title: pageName,
		features: []
	};

	return meta;
}
