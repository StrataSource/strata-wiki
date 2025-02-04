import { promises as fs } from "fs";
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

export async function fileExists(path: string): Promise<boolean> {
    try {
        await fs.access(path, fs.constants.R_OK);
    } catch {
        return false;
    }
    return true;
}

export async function getContentMeta(
    category: string,
    topic: string
): Promise<ContentMeta> {
    let meta: ArticleMeta;

    //Check if meta.json exists, if not complain and fall back to using ID as the title
    if (await fileExists(`../docs/${category}/${topic || ""}/meta.json`)) {
        const metaRaw = await fs.readFile(
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
    if (await fileExists(`../docs/${category}/${topic || ""}/materials.json`)) {
        return { type: "material", meta: meta };
    }

    //Check if topic type is typedoc
    if (await fileExists(`../docs/${category}/${topic || ""}/typedoc.json`)) {
        return { type: "typedoc", meta: meta };
    }

    //Check if topic type is vscript
    if (await fileExists(`../docs/${category}/${topic || ""}/vscript.json`)) {
        return { type: "vscript", meta: meta };
    }

    //Check if topic type is vscript
    if (await fileExists(`../docs/${category}/${topic || ""}/sound_operators.json`)) {
        return { type: "sound_operators", meta: meta };
    }

    //Check if topic type is entity by looping over every game and looking for that file.
    const games = await getGames();

    for (const game of Object.keys(games)) {
        if (await fileExists(`../docs/${category}/${topic || ""}/entities_${game}.json`)) {
            return { type: "entity", meta: meta };
        }
        if (await fileExists(`../docs/${category}/${topic || ""}/commands_${game}.json`)) {
            return { type: "command", meta: meta };
        }
    }

    return { type: "markdown", meta: meta };
}

export async function getContent(meta: ContentMeta, category: string, topic: string, page: string) {
    if (dev) {
        console.log(`\n--- ${category}/${topic}/${page} ---\n`);
    }

    let c: Root;

    switch (meta.type) {
        case "markdown":
            if (!(await fileExists(`../docs/${category}/${topic}/${page}.md`))) {
                error(404, "Page not found");
            }

            c = parseMarkdown(
                await fs.readFile(
                    `../docs/${category}/${topic}/${page}.md`,
                    { encoding: 'utf8' }
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
            c = await parseCommand(`${category}/${topic}`, page);
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

export async function getMenu(category: string) {
    if (!(await fileExists(`../docs/${category}`))) {
        error(404);
    }

    const topics = await fs.readdir(`../docs/${category}`);

    const menu: MenuCategory[] = [];

    for (const topic of topics) {
        const stat = await fs.lstat(`../docs/${category}/${topic}`);
        if (!stat.isDirectory()) {
            continue;
        }

        const contentmeta = await getContentMeta(category, topic);
        const menutopic = await getMenuTopic(contentmeta, category, topic);
        menu.push(menutopic);
    }

    return menu.sort(sortByWeight);
}

export async function getMenuTopic(meta: ContentMeta, category: string, topic: string) {
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
            entry.articles = await getCommandTopic(`${category}/${topic}`);
            break;

        default:
            break;
    }

    entry.articles = entry.articles.sort((a, b) =>
        sortByWeight(a.meta, b.meta)
    );

    return entry;
}

export async function getPageMeta(meta: ContentMeta, category: string, topic: string, article: string) {

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
            return await getCommandPageMeta(`${category}/${topic}`, article);
            break;

        default:
            break;
    }
}

export async function getCategories() {
    const categories = await fs.readdir(`../docs`);

    const menu: ArticleMeta[] = [];

    for (const category of categories) {
        const stat = await fs.lstat(`../docs/${category}`);
        if (!stat.isDirectory()) {
            continue;
        }

        menu.push({ id: category, ...(await getContentMeta(category, "")).meta });
    }
    
    return menu;
}

export async function getGames() {
    const gamesList = await fs.readdir(`../games`);

    const games: GameMetaCollection = {};

    for (const game of gamesList) {
        games[game] = JSON.parse(
            await fs.readFile(`../games/${game}/meta.json`, "utf-8")
        );
    }

    return games;
}
