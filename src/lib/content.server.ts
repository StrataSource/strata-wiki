import fs from "fs";
import { getMarkdownTopic, parseMarkdown } from "./parsers/markdown.server";
import { error } from "@sveltejs/kit";

export function getContentMeta(category: string, topic: string) {
    if (!fs.existsSync(`../docs/${category}/${topic || ""}/meta.json`)) {
        return {
            type: "markdown",
            meta: {
                title: topic,
            },
        };
    }

    const metaRaw = fs.readFileSync(
        `../docs/${category}/${topic || ""}/meta.json`,
        "utf-8"
    );

    const meta: ArticleMeta = JSON.parse(metaRaw);

    //TODO Different source types
    return { type: "markdown", meta: meta };
}

export function getContent(category: string, topic: string, page: string) {
    switch (getContentMeta(category, topic).type) {
        case "markdown":
            if (!fs.existsSync(`../docs/${category}/${topic}/${page}.md`)) {
                throw error(404);
            }

            return parseMarkdown(
                fs.readFileSync(
                    `../docs/${category}/${topic}/${page}.md`,
                    "utf-8"
                ),
                `${category}/${topic}/${page}`
            );
            break;

        default:
            throw error(500, "Invalid content type");
            break;
    }
}

export function getMenu(category: string) {
    if (!fs.existsSync(`../docs/${category}`)) {
        throw error(404);
    }

    const topics = fs.readdirSync(`../docs/${category}`);

    const menu: MenuCategory[] = [];

    for (const topic of topics) {
        const stat = fs.lstatSync(`../docs/${category}/${topic}`);
        if (!stat.isDirectory()) {
            continue;
        }

        menu.push(getMenuTopic(category, topic));
    }

    return menu;
}

export function getMenuTopic(category: string, topic: string) {
    const meta = getContentMeta(category, topic);

    const entry: MenuCategory = {
        id: topic,
        title: meta.meta.title,
        articles: [],
    };

    switch (meta.type) {
        case "markdown":
            entry.articles = getMarkdownTopic(category, topic);
            break;

        default:
            break;
    }

    return entry;
}

export function getCategories() {
    const categories = fs.readdirSync(`../docs`);

    const menu: ArticleMeta[] = [];

    for (const category of categories) {
        const stat = fs.lstatSync(`../docs/${category}`);
        if (!stat.isDirectory()) {
            continue;
        }

        menu.push({ id: category, ...getContentMeta(category, "").meta });
    }

    return menu;
}
