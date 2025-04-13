import type { Root } from "mdast";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";

import fs from "fs";
import yaml from "js-yaml";
import { error } from "@sveltejs/kit";
import { dev } from "$app/environment";

import { getMenu } from "$lib/content.server";

const cache: { [id: string]: { content: Root; original: string } } = {};

export function parseMarkdown(doc: string, id?: string) {
    if (id && cache[id] && cache[id].original === doc) {
        return cache[id].content;
    }

    if (dev) {
        console.log("Cache miss, regenerating...", id);
    }

    const res = remark()
        .use(remarkFrontmatter, { type: "yaml", marker: "-" })
        .use(remarkGfm)
        .parse(doc);

    if (id) {
        cache[id] = { content: res, original: doc };
    }

    return res;
}

function getMarkdownTopic(path: string) {
    if (!fs.existsSync(`../docs/${path}`)) {
        error(404, "Page not found");
    }

    const articles = fs.readdirSync(`../docs/${path}`);

    const res: MenuArticle[] = [];

    for (const article of articles) {
        if (!article.endsWith(".md")) {
            continue;
        }

        const meta = getMarkdownPageMeta(path, article.slice(0, -3));

        res.push({ id: article.slice(0, -3), meta: meta });
    }

    return res;
}

function getMarkdownPageMeta(
    path: string,
    article: string
) {
    const parsed = parseMarkdown(
        fs.readFileSync(`../docs/${path}/${article}.md`, "utf-8"),
        `${path}/${article}`
    );

    let metaRaw = `title: "${article}"`;

    if (parsed.children[0].type == "yaml") {
        metaRaw = parsed.children[0].value;
    }

    const meta = <ArticleMeta>yaml.load(metaRaw);
    meta.type = "markdown";
    return meta;
}

function getMarkdownPageContent(
    path: string,
    article: string
) {
    if (!fs.existsSync(`../docs/${path}/${article}.md`)) {
        error(404, "Page not found");
    }

    return parseMarkdown(
        fs.readFileSync(
            `../docs/${path}/${article}.md`,
            "utf-8"
        ),
        `${path}/${article}`
    );
}

export const generatorMarkdown: PageGenerator = {
    init : () => {},
    getPageContent: getMarkdownPageContent,
    getPageMeta: getMarkdownPageMeta,
    getTopic: getMarkdownTopic,
    getSubtopics: (p) => { return getMenu(p); },
};
