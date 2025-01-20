import type { Root } from "mdast";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";

import fs from "fs";
import yaml from "js-yaml";
import { error } from "@sveltejs/kit";
import { dev } from "$app/environment";

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

export function getMarkdownTopic(category: string, topic: string) {
    if (!fs.existsSync(`../docs/${category}/${topic}`)) {
        error(404, "Page not found");
    }

    const articles = fs.readdirSync(`../docs/${category}/${topic}`);

    const res: MenuArticle[] = [];

    for (const article of articles) {
        if (!article.endsWith(".md")) {
            continue;
        }

        const meta = getMarkdownPageMeta(category, topic, article.slice(0, -3));

        res.push({ id: article.slice(0, -3), meta: meta });
    }

    return res;
}

export function getMarkdownPageMeta(
    category: string,
    topic: string,
    article: string
) {
    const parsed = parseMarkdown(
        fs.readFileSync(`../docs/${category}/${topic}/${article}.md`, "utf-8"),
        `${category}/${topic}/${article}`
    );

    let metaRaw = "title: " + article;

    if (parsed.children[0].type == "yaml") {
        metaRaw = parsed.children[0].value;
    }

    const meta = <ArticleMeta>yaml.load(metaRaw);

    return meta;
}
