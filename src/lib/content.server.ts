import fs from "fs";
import {
    generatorMarkdown
} from "./parsers/markdown.server";
import { error } from "@sveltejs/kit";
import {
    generatorMaterial
} from "./parsers/material.server";
import {
    generatorEntity
} from "./parsers/entities.server";
import type { Root } from "mdast";
import { flushLint, reportLint } from "./linter.server";
import {
    generatorTypedoc
} from "./parsers/typedoc.server";
import {
    generatorVScript
} from "./parsers/vscript.server";
import {
    generatorSoundOperators
} from "./parsers/sounds_operators.server";
import {
    generatorCommand,
} from "./parsers/command.server.js";
import { dev } from "$app/environment";

const pageGenerators : { [id: string /*GeneratorType*/ ] : PageGenerator } = {
    "markdown" : generatorMarkdown,
    "material" : generatorMaterial,
    "entity" : generatorEntity,
    "typedoc" : generatorTypedoc,
    "vscript" : generatorVScript,
    "sound_operators" : generatorSoundOperators,
    "command" : generatorCommand,
};


let hasInitializedBefore = false;
export function initGenerators() {
    if(!hasInitializedBefore) {
        console.log("Setting up generators!");

        for (const name of Object.keys(pageGenerators)) {
            console.log(`Indexing ${name}`);
            pageGenerators[name].init();
        }

        hasInitializedBefore = true;
    }
    console.log("Generators ready!");
}

export function getContentMeta(
    path: string,
): ArticleMeta
{
    const slug: string[] = path.split('/');

    // Step through the path backwards and determine if this a real slug or a virtual one provided by some generator
    for (let i = slug.length; i >= 0; i--) {
        const curPath = slug.slice(0, i).join('/');

        //Check if meta.json exists, if not complain and fall back to using ID as the title
        if (fs.existsSync(`../docs/${curPath}/meta.json`)) {
            const metaRaw = fs.readFileSync(
                `../docs/${curPath}/meta.json`,
                "utf-8"
            );

            const meta = JSON.parse(metaRaw);

            // Always default to markdown if not present
            if (!Object.hasOwn(meta, "type")) {
                meta.type = "markdown";
            }
            
            // Sanity helper. Set the name if it didn't resolve its own meta
            if (i != slug.length) {
                meta.title = path;
                meta.wasDiscovered = true;
            }

            return meta;
        }
    }

    // Never found a meta file! We'll assume it was type markdown
    reportLint(
        "caution",
        `meta_missing_${path}`,
        `${path} is missing a meta.json!`,
        `${path}`
    );

    const meta: ArticleMeta = {
        title: path,
        type: "markdown"
    };

    return meta;
}

export function getContent(path: string, article: string) {
    if (dev) {
        console.log(`\n--- ${path}/${article} ---\n`);
    }

    let c: Root;

    const type = getContentMeta(path).type;
    if(Object.hasOwn(pageGenerators, type)) {
        c = pageGenerators[type].getPageContent(path, article);
    } else {
        error(500, "Invalid content type");
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

const menuCache: { [id: string]: MenuTopic[] } = {};

export function getMenu(path: string): MenuTopic[] {
    if (menuCache[path]) {
        return menuCache[path];
    }

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

        const menuTopic = getMenuTopic(`${path}/${topic}`);

        // Hide any discovered sections that have no actual articles within them
        if (menuTopic.menu.articles.length == 0 && menuTopic.meta.wasDiscovered) {
            continue;
        }

        menu.push(menuTopic.menu);
    }

    return (menuCache[path] = menu.sort(sortByWeight));
}

const topicCache: { [id: string]: MenuTopic } = {};


export function getMenuTopic(path: string): {menu: MenuTopic, meta: ArticleMeta} {
    const meta = getContentMeta(path);

    if (topicCache[path]) {
        return {menu: topicCache[path], meta: meta};
    }

    const entry: MenuTopic = {
        id: path,
        title: meta.title,
        weight: typeof meta.weight == "number" ? meta.weight : null,
        articles: [],
        subtopics: [],
    };
    
    if(Object.hasOwn(pageGenerators, meta.type)) {
        entry.articles = pageGenerators[meta.type].getTopic(path);
        entry.subtopics = pageGenerators[meta.type].getSubtopics(path);
    }

    entry.articles = entry.articles.sort((a, b) =>
        sortByWeight(a.meta, b.meta)
    );

    if (meta.reverseOrder) {
        entry.articles.reverse();
    }

    topicCache[path] = entry;

    return {menu: entry, meta: meta};
}

export function getPageMeta(path: string, article: string) {
    const meta = getContentMeta(path);

    if(Object.hasOwn(pageGenerators, meta.type)) {
        return pageGenerators[meta.type].getPageMeta(path, article);
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

        menu.push({ id: category, ...getContentMeta(category) });
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
