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
} from "./parsers/command.server";
import {
    generatorAngelScript,
} from "./parsers/angelscript.server";
import { dev } from "$app/environment";

const pageGenerators : { [id: string /*GeneratorType*/ ] : PageGenerator } = {
    "markdown" : generatorMarkdown,
    "material" : generatorMaterial,
    "entity" : generatorEntity,
    "typedoc" : generatorTypedoc,
    "vscript" : generatorVScript,
    "sound_operators" : generatorSoundOperators,
    "command" : generatorCommand,
    "angelscript" : generatorAngelScript,
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
        console.log("Generators ready!");
    }
}

export function getTopicMeta(
    path: string,
): TopicMeta
{
    // getTopicMeta is called by everything, so as a bit of a hack, we'll stuff this here. I'm not sure how to do initialization properly for static mode
    initGenerators();

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
            meta.id = curPath;

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

    const meta: TopicMeta = {
        type: "markdown",
        id: path,
        title: path,
    };

    return meta;
}


export function isPathTopic(path: string): boolean {
    // Paths that are topics hold their own meta.json
    return fs.existsSync(`../docs/${path}/meta.json`);
}


export function getContent(path: string) {

    const meta = getTopicMeta(path);
    const article = path.slice(meta.id.length + 1);

    if (dev) {
        console.log(`\n--- ${path} (topic: "${meta.id}", article: "${article}") ---\n`);
    }

    let c: Root;
    if(Object.hasOwn(pageGenerators, meta.type)) {
        c = pageGenerators[meta.type].getPageContent(meta.id, article);
    } else {
        error(500, "Invalid content type");
    }

    flushLint();

    return c;
}

export function sortByWeight(
    a: { weight?: number | null; title: string; },
    b: { weight?: number | null; title: string; }
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

export function getMenu(path: string): MenuTopic {
    return getMenuTopic(path).menu;
}

const topicCache: { [id: string]: MenuTopic } = {};


export function getMenuTopic(path: string): {menu: MenuTopic, meta: TopicMeta} {
    const meta = getTopicMeta(path);

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
        const index: PageGeneratorIndex = pageGenerators[meta.type].getIndex(path);
        entry.articles = index.articles;
        entry.subtopics = index.topics;
    }

    entry.articles = entry.articles.sort((a, b) =>
        sortByWeight(a.meta, b.meta)
    );

    entry.subtopics = entry.subtopics.sort((a, b) =>
        sortByWeight(a, b)
    );

    if (meta.reverseOrder) {
        entry.articles.reverse();
    }

    topicCache[path] = entry;

    return {menu: entry, meta: meta};
}

export function getPageMeta(path: string) {
    const meta = getTopicMeta(path);
    const article = path.slice(meta.id.length + 1);

    if(Object.hasOwn(pageGenerators, meta.type)) {
        return pageGenerators[meta.type].getPageMeta(meta.id, article);
    }
}

export function getCategories() : TopicMeta[] {
    const categories = fs.readdirSync(`../docs`);

    const menu: TopicMeta[] = [];

    for (const category of categories) {
        const stat = fs.lstatSync(`../docs/${category}`);
        if (!stat.isDirectory() || !isPathTopic(category)) {
            continue;
        }

        menu.push(getTopicMeta(category));
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
