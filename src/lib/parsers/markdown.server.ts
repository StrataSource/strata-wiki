import type { Root } from "mdast";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";

import fs from "fs";
import yaml from "js-yaml";
import { error } from "@sveltejs/kit";
import { dev } from "$app/environment";

import { getMenuTopic, sortByWeight } from "$lib/content.server";

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

function getMarkdownIndex(path: string): PageGeneratorIndex {
    
    if (!fs.existsSync(`../docs/${path}`)) {
        error(404, "Page not found");
    }

    const index: PageGeneratorIndex = {topics: [], articles: []};

    const files = fs.readdirSync(`../docs/${path}`);

    for (const file of files) {
        const stat = fs.lstatSync(`../docs/${path}/${file}`);
        
        if (!stat.isDirectory()) {
            // Got an article
            if (file.endsWith(".md")) {
                const meta = getMarkdownPageMeta(path, file.slice(0, -3));

                index.articles.push({ id: file.slice(0, -3), meta: meta });
            }
        }
        else
        {
            // Got a topic
            const menuTopic = getMenuTopic(`${path}/${file}`);

            // Hide any discovered sections that have no actual articles within them
            if (menuTopic.menu.articles.length == 0 && menuTopic.meta.wasDiscovered) {
                continue;
            }

            index.topics.push(menuTopic.menu);
        }
    }

    return index;
}

export const generatorMarkdown: PageGenerator = {
    init : () => {},
    getPageContent: getMarkdownPageContent,
    getIndex: getMarkdownIndex,
};
