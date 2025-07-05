import fs from "fs";
import { error } from "@sveltejs/kit";
import { parseMarkdown } from "./markdown.server";
import { reportLint } from "$lib/linter.server";

interface Method {
    method: string;
    signature: string;
    doc: string;
}

interface Class {
    class: string;
    extends: string;
    methods: Method[];
}

interface Dump {
    globals: Method[];
    classes: Class[];
}

let cache: { [className: string]: Class } = {};

function parseJSON() {
    const raw: Dump = JSON.parse(
        fs.readFileSync(`../dumps/vscript.json`, "utf-8")
    );

    cache = {};

    cache.Globals = {
        class: "Globals",
        extends: "",
        methods: raw.globals,
    };

    for (const c of raw.classes) {
        cache[c.class] = c;
    }
}

export function parseVScript(p: string, name: string) {
    const out: string[] = [];

    const scriptClass = cache[name];

    if (!scriptClass) {
        error(404, "Page not found");
    }

    out.push(`# ${scriptClass.class}`);

    let extension = scriptClass.class;

    while (extension != "") {
        const c = cache[extension];

        if (!c) {
            reportLint(
                "warning",
                `vscript_missingExtension_${extension}`,
                `Vscript Class "${scriptClass.class}" is missing extension "${extension}"!`,
                `${p}/${name}`
            );
            break;
        }

        if (c.methods.length > 0 && c.class != scriptClass.class) {
            out.push(`## Inherited from [${c.class}](./${c.class})`);
        }
        for (const method of c.methods) {
            out.push(`### ${method.method.replace(extension + "::", "")}`);
            out.push(method.doc || "*No description provided*");
            out.push(["```c", method.signature, "```"].join("\n"));
        }

        extension = c.extends;
    }

    return parseMarkdown(out.join("\n\n"), `${p}/${name}`);
}

export function getVScriptIndex(p: string): PageGeneratorIndex {
    const index: PageGeneratorIndex = {topics: [], articles: []};

    for (const c of Object.keys(cache)) {
        index.articles.push({
            id: c,
            meta: {
                title: c,
                type: "vscript",
                weight: c == "Globals" ? 0 : undefined,
                features: ["USE_VSCRIPT"],
            },
        });
    }

    return index;
}

export function getVScriptPageMeta(p: string, name: string): ArticleMeta {
    return {
        title: name,
        type: "vscript",
        disablePageActions: true,
        features: ["USE_VSCRIPT"],
    };
}


export const generatorVScript: PageGenerator = {
    init: parseJSON,
    getPageContent: parseVScript,
    getPageMeta: getVScriptPageMeta,
    getIndex: getVScriptIndex,
};
