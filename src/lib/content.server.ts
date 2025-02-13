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
import type { Root } from "mdast";
import { flushLint, reportLint } from "./linter.server";
import {
    getTypedocPageMeta,
    getTypedocTopic,
    parseTypedoc,
} from "./parsers/typedoc.server";
import {
    getVscriptPageMeta,
    getVscriptTopic,
    parseVscript,
} from "./parsers/vscript.server";
import {
    getSoundOperatorsPageMeta,
    getSoundOperatorsTopic,
    parseSoundOperators,
} from "./parsers/sounds_operators.server";
import {
    getCommandPageMeta,
    getCommandTopic,
    parseCommand,
} from "./parsers/command.server.js";
import { dev } from "$app/environment";

export function getContentMeta(
    category: string,
    topic: string
): {
    type:
        | "markdown"
        | "material"
        | "entity"
        | "typedoc"
        | "vscript"
        | "sound_operators"
        | "command";
    meta: ArticleMeta;
} {
    let meta: ArticleMeta;

    //Check if meta.json exists, if not complain and fall back to using ID as the title
    if (fs.existsSync(`../docs/${category}/${topic || ""}/meta.json`)) {
        const metaRaw = fs.readFileSync(
            `../docs/${category}/${topic || ""}/meta.json`,
            "utf-8"
        );

        meta = JSON.parse(metaRaw);
    } else {
        reportLint(
            "caution",
            `meta_missing_${category}/${topic || ""}`,
            `${category}${topic ? "/" + topic : ""} is missing a meta.json!`,
            `${category}/${topic || ""}`
        );

        meta = {
            title: topic,
        };
    }

    //Check if topic type is material
    if (fs.existsSync(`../docs/${category}/${topic || ""}/materials.json`)) {
        return { type: "material", meta: meta };
    }

    //Check if topic type is typedoc
    if (fs.existsSync(`../docs/${category}/${topic || ""}/typedoc.json`)) {
        return { type: "typedoc", meta: meta };
    }

    //Check if topic type is vscript
    if (fs.existsSync(`../docs/${category}/${topic || ""}/vscript.json`)) {
        return { type: "vscript", meta: meta };
    }

    //Check if topic type is vscript
    if (
        fs.existsSync(`../docs/${category}/${topic || ""}/sound_operators.json`)
    ) {
        return { type: "sound_operators", meta: meta };
    }

    //Check if topic type is entity by looping over every game and looking for that file.
    const games = getGames();

    for (const game of Object.keys(games)) {
        if (
            fs.existsSync(
                `../docs/${category}/${topic || ""}/entities_${game}.json`
            )
        ) {
            return { type: "entity", meta: meta };
        }
        if (
            fs.existsSync(
                `../docs/${category}/${topic || ""}/commands_${game}.json`
            )
        ) {
            return { type: "command", meta: meta };
        }
    }

    return { type: "markdown", meta: meta };
}

export function getContent(category: string, topic: string, page: string) {
    if (dev) {
        console.log(`\n--- ${category}/${topic}/${page} ---\n`);
    }

    let c: Root;

    switch (getContentMeta(category, topic).type) {
        case "markdown":
            if (!fs.existsSync(`../docs/${category}/${topic}/${page}.md`)) {
                error(404, "Page not found");
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

        case "typedoc":
            c = parseTypedoc(`${category}/${topic}`, page);
            break;

        case "vscript":
            c = parseVscript(`${category}/${topic}`, page);
            break;

        case "sound_operators":
            c = parseSoundOperators(`${category}/${topic}`, page);
            break;

        case "command":
            c = parseCommand(`${category}/${topic}`, page);
            break;

        default:
            error(500, "Invalid content type");
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

const menuCache: { [id: string]: MenuCategory[] } = {};

export function getMenu(category: string) {
    if (menuCache[category]) {
        return menuCache[category];
    }

    if (!fs.existsSync(`../docs/${category}`)) {
        error(404);
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

    return (menuCache[category] = menu.sort(sortByWeight));
}

const topicCache: { [id: string]: MenuCategory } = {};

export function getMenuTopic(category: string, topic: string) {
    const meta = getContentMeta(category, topic);

    if (topicCache[category + ";" + topic]) {
        return topicCache[category + ";" + topic];
    }

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

        case "typedoc":
            entry.articles = getTypedocTopic(`${category}/${topic}`);
            break;

        case "vscript":
            entry.articles = getVscriptTopic(`${category}/${topic}`);
            break;

        case "sound_operators":
            entry.articles = getSoundOperatorsTopic(`${category}/${topic}`);
            break;

        case "command":
            entry.articles = getCommandTopic(`${category}/${topic}`);
            break;

        default:
            break;
    }

    entry.articles = entry.articles.sort((a, b) =>
        sortByWeight(a.meta, b.meta)
    );

    if (meta.meta.reverseOrder) {
        entry.articles.reverse();
    }

    topicCache[category + ";" + topic] = entry;

    return entry;
}
export function getPageMeta(category: string, topic: string, article: string) {
    const meta = getContentMeta(category, topic);

    switch (meta.type) {
        case "markdown":
            return getMarkdownPageMeta(category, topic, article);
            break;

        case "material":
            return getMaterialPageMeta(`${category}/${topic}`, article);
            break;

        case "entity":
            return getEntityPageMeta(`${category}/${topic}`, article);
            break;

        case "typedoc":
            return getTypedocPageMeta(`${category}/${topic}`, article);
            break;

        case "vscript":
            return getVscriptPageMeta(`${category}/${topic}`, article);
            break;

        case "sound_operators":
            return getSoundOperatorsPageMeta(`${category}/${topic}`, article);
            break;

        case "command":
            return getCommandPageMeta(`${category}/${topic}`, article);
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
