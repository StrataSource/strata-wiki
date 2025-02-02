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
    getTypedocSubtopics,
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
    path: string,
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

    console.log(path)

    //Check if meta.json exists, if not complain and fall back to using ID as the title
    if (fs.existsSync(`../docs/${path}/meta.json`)) {
        const metaRaw = fs.readFileSync(
            `../docs/${path}/meta.json`,
            "utf-8"
        );

        meta = JSON.parse(metaRaw);
    } else {
        reportLint(
            "caution",
            `meta_missing_${path}`,
            `${path} is missing a meta.json!`,
            `${path}`
        );

        meta = {
            title: path,
        };
    }

    //Check if topic type is material
    if (fs.existsSync(`../docs/${path}/materials.json`)) {
        return { type: "material", meta: meta };
    }

    //Check if topic type is typedoc
    if (fs.existsSync(`../docs/${path}/typedoc.json`)) {
        return { type: "typedoc", meta: meta };
    }

    //Check if topic type is vscript
    if (fs.existsSync(`../docs/${path}/vscript.json`)) {
        return { type: "vscript", meta: meta };
    }

    //Check if topic type is vscript
    if (
        fs.existsSync(`../docs/${path}/sound_operators.json`)
    ) {
        return { type: "sound_operators", meta: meta };
    }

    //Check if topic type is entity by looping over every game and looking for that file.
    const games = getGames();

    for (const game of Object.keys(games)) {
        if (
            fs.existsSync(
                `../docs/${path}/entities_${game}.json`
            )
        ) {
            return { type: "entity", meta: meta };
        }
        if (
            fs.existsSync(
                `../docs/${path}/commands_${game}.json`
            )
        ) {
            return { type: "command", meta: meta };
        }
    }

    return { type: "markdown", meta: meta };
}

export function getContent(path: string, article: string) {
    if (dev) {
        console.log(`\n--- ${path}/${article} ---\n`);
    }
    console.log(article);

    const slug: string[] = path.split('/');
    // First is top level category, we can remove that
    //slug.shift();
    // Now are topics. We need to step down and see if any provide our current path
    

    let c: Root;

    switch (getContentMeta(slug[0] + '/' + slug[1]).type) {
        case "markdown":
            if (!fs.existsSync(`../docs/${path}/${article}.md`)) {
                error(404, "Page not found");
            }

            c = parseMarkdown(
                fs.readFileSync(
                    `../docs/${path}/${article}.md`,
                    "utf-8"
                ),
                `${path}/${article}`
            );
            break;

        case "material":
            c = parseMaterial(path, article);
            break;

        case "entity":
            c = parseEntity(path, article);
            break;

        case "typedoc":
            c = parseTypedoc(path, article);
            break;

        case "vscript":
            c = parseVscript(path, article);
            break;

        case "sound_operators":
            c = parseSoundOperators(path, article);
            break;

        case "command":
            c = parseCommand(path, article);
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

export function getMenu(path: string) {
    if (!fs.existsSync(`../docs/${path}`)) {
        error(404);
    }

    const topics = fs.readdirSync(`../docs/${path}`);

    const menu: MenuTopic[] = [];

    for (const topic of topics) {
        const stat = fs.lstatSync(`../docs/${path}/${topic}`);
        if (!stat.isDirectory()) {
            continue;
        }

        menu.push(getMenuTopic(`${path}/${topic}`));
    }

    return menu.sort(sortByWeight);
}

export function getMenuTopic(path: string) {
    
    const slug: string[] = path.split('/');

    const meta = getContentMeta(slug[0] + '/' + slug[1]);

    const entry: MenuTopic = {
        id: path,
        title: meta.meta.title,
        weight: typeof meta.meta.weight == "number" ? meta.meta.weight : null,
        articles: [],
        subtopics: [],
    };
    
    entry.subtopics = getMenu(path);

    switch (meta.type) {
        case "markdown":
            entry.articles = getMarkdownTopic(path);
            break;

        case "material":
            entry.articles = getMaterialTopic(path);
            break;

        case "entity":
            entry.articles = getEntityTopic(path);
            break;

        case "typedoc":
            entry.articles = getTypedocTopic(path);
            entry.subtopics = getTypedocSubtopics(path);
            break;

        case "vscript":
            entry.articles = getVscriptTopic(path);
            break;

        case "sound_operators":
            entry.articles = getSoundOperatorsTopic(path);
            break;

        case "command":
            entry.articles = getCommandTopic(path);
            break;

        default:
            break;
    }

    entry.articles = entry.articles.sort((a, b) =>
        sortByWeight(a.meta, b.meta)
    );


    console.log(entry);

    return entry;
}
export function getPageMeta(path: string, article: string) {
    
    const slug: string[] = path.split('/');
    path = slug[0] + '/' + slug[1];
    slug.shift();
    slug.shift();
    slug.push(article);
    article = slug.join('/');

    console.log("Get meta " + path);

    const meta = getContentMeta(path);

    switch (meta.type) {
        case "markdown":
            return getMarkdownPageMeta(path, article);
            break;

        case "material":
            return getMaterialPageMeta(path, article);
            break;

        case "entity":
            return getEntityPageMeta(path, article);
            break;

        case "typedoc":
            return getTypedocPageMeta(path, article);
            break;

        case "vscript":
            return getVscriptPageMeta(path, article);
            break;

        case "sound_operators":
            return getSoundOperatorsPageMeta(path, article);
            break;

        case "command":
            return getCommandPageMeta(path, article);
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

        menu.push({ id: category, ...getContentMeta(category).meta });
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
