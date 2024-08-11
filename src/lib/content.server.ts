import fs from "fs";
import {
    getMarkdownPageMeta,
    getMarkdownTopic,
    parseMarkdown,
} from "./parsers/markdown.server";
import { error } from "@sveltejs/kit";
import {
    getMaterialPageMeta,
    getMaterialTopic,
    parseMaterial,
} from "./parsers/material.server";

export function getContentMeta(category: string, topic: string) {
    if (!fs.existsSync(`../docs/${category}/${topic || ""}/meta.json`)) {
        const meta: ArticleMeta = {
            title: topic,
        };

        return { type: "markdown", meta: meta };
    }

    const metaRaw = fs.readFileSync(
        `../docs/${category}/${topic || ""}/meta.json`,
        "utf-8"
    );

    const meta: ArticleMeta = JSON.parse(metaRaw);

    let type: "markdown" | "material" = "markdown";

    if (fs.existsSync(`../docs/${category}/${topic || ""}/materials.json`)) {
        type = "material";
    }

    return { type: type, meta: meta };
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

        case "material":
            return parseMaterial(`${category}/${topic}`, page);
            break;

        default:
            throw error(500, "Invalid content type");
            break;
    }
}

function sortByWeight(
    a: { weight?: number | null; title: string },
    b: { weight?: number | null; title: string }
) {
    if (a.weight === b.weight) {
        return a.title.localeCompare(b.title);
    } else if (typeof a.weight != "number" && typeof b.weight == "number") {
        return 1;
    } else if (typeof a.weight == "number" && typeof b.weight != "number") {
        return -1;
    } else {
        return (a.weight || 0) - (b.weight || 0);
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

    return menu.sort(sortByWeight);
}

export function getMenuTopic(category: string, topic: string) {
    const meta = getContentMeta(category, topic);

    const entry: MenuCategory = {
        id: topic,
        title: meta.meta.title,
        weight: meta.meta.weight || null,
        articles: [],
    };

    switch (meta.type) {
        case "markdown":
            entry.articles = getMarkdownTopic(category, topic);
            break;

        case "material":
            entry.articles = getMaterialTopic(`${category}/${topic}`);
            break;

        default:
            break;
    }

    entry.articles = entry.articles.sort((a, b) =>
        sortByWeight(a.meta, b.meta)
    );

    return entry;
}
export function getPageMeta(category: string, topic: string, article: string) {
    const meta = getContentMeta(category, topic);

    switch (meta.type) {
        case "markdown":
            return getMarkdownPageMeta(category, topic, article);
            break;

        case "material":
            return getMaterialPageMeta(article);
            break;

        default:
            break;
    }
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

export function getGames() {
    const gamesList = fs.readdirSync(`../games`);

    const games: GameMetaCollection = {};

    for (const game of gamesList) {
        games[game] = JSON.parse(
            fs.readFileSync(`../games/${game}/meta.json`, "utf-8")
        );
    }

    return games;
}
