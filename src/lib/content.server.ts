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
import {
    getEntityPageMeta,
    getEntityTopic,
    parseEntity,
} from "./parsers/entities.server";
import {
    getPanoramaPageMeta,
    getPanoramaTopic,
    parsePanorama,
} from "./parsers/panorama.server";

import type { Root } from "mdast";
import { flushLint, reportLint } from "./linter.server";

export function getContentMeta(category: string, topic: string) {

    // No meta.json? This is markdown.
    
    if (!fs.existsSync(`../docs/${category}/${topic || ""}/meta.json`)) {
        reportLint("warning", "warn_meta_legacy_topic", `Topic ${category}/${topic || ""} is missing a meta.json!`, `/${category}/${topic || ""}/`);
        const meta: ArticleMeta = { title: topic };
        return { type: "markdown", meta: meta };
    }

    // Check for material-type page

    const metaRaw = fs.readFileSync(`../docs/${category}/${topic || ""}/meta.json`, "utf-8");
    const meta: ArticleMeta = JSON.parse(metaRaw);
    if (fs.existsSync(`../docs/${category}/${topic || ""}/materials.json`)) {
        return { type: "material", meta: meta };
    }
    
    // Check for entity page

    const games = getGames();
    for (const game of Object.keys(games)) {
        if (fs.existsSync(`../docs/${category}/${topic || ""}/entities_${game}.json`)) {
            return { type: "entity", meta: meta };
        }
    }

    // Check for Panorama page

    if (fs.existsSync(`../docs/${category}/${topic}/panorama.json`)) {
        return { type: "panorama", meta: meta };
    }

    // What is this page???

    // throw Error(`Page ${category}/${topic} is missing a meta.json!`);
    return { type: "markdown", meta: meta };
}

export function getContent(category: string, topic: string, page: string) {
    console.log(`\n--- ${category}/${topic}/${page} ---\n`);

    let c: Root;

    switch (getContentMeta(category, topic).type) {
        case "markdown":
            if (!fs.existsSync(`../docs/${category}/${topic}/${page}.md`)) {
                throw error(404);
            }

            c = parseMarkdown(
                fs.readFileSync(
                    `../docs/${category}/${topic}/${page}.md`,
                    "utf-8"
                ),
                `${category}/${topic}/${page}`
            );
            break;

        case "material":
            c = parseMaterial(`${category}/${topic}`, page);
            break;

        case "entity":
            c = parseEntity(`${category}/${topic}`, page);
            break;

        case "panorama":
            c = parsePanorama(`${category}/${topic}`, page);
            break;
        
        default:
            throw error(500, "Invalid content type");
            break;
    }

    flushLint();

    return c;
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
        weight: typeof meta.meta.weight == "number" ? meta.meta.weight : null,
        articles: [],
    };

    switch (meta.type) {
        case "markdown":
            entry.articles = getMarkdownTopic(category, topic);
            break;

        case "material":
            entry.articles = getMaterialTopic(`${category}/${topic}`);
            break;

        case "entity":
            entry.articles = getEntityTopic(`${category}/${topic}`);
            break;
        
        case "panorama":
            entry.articles = getPanoramaTopic();
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

        case "material":
            return getMaterialPageMeta(article);

        case "entity":
            return getEntityPageMeta(`${category}/${topic}`, article);

        case "panorama":
            return getPanoramaPageMeta(article);

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
