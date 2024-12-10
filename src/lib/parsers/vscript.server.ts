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

const cache: { [id: string]: { [className: string]: Class } } = {};

function parseJSON(p: string) {
    if (p && cache[p]) {
        return cache[p];
    }

    const raw: Dump = JSON.parse(
        fs.readFileSync(`../docs/${p}/vscript.json`, "utf-8")
    );

    cache[p] = {};

    cache[p].Globals = {
        class: "Globals",
        extends: "",
        methods: raw.globals,
    };

    for (const c of raw.classes) {
        cache[p][c.class] = c;
    }

    return cache[p];
}

export function parseVscript(p: string, name: string) {
    const all = parseJSON(p);

    const out: string[] = [];

    const scriptClass = all[name];

    if (!scriptClass) {
        error(404, "Page not found");
    }

    out.push(`# ${scriptClass.class}`);

    let extension = scriptClass.class;

    while (extension != "") {
        const c = all[extension];

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

export function getVscriptTopic(p: string) {
    const res: MenuArticle[] = [];

    const all = parseJSON(p);

    for (const c of Object.keys(all)) {
        res.push({
            id: c,
            meta: {
                title: c,
                weight: c == "Globals" ? 0 : undefined,
                features: ["VSCRIPT"],
            },
        });
    }

    return res;
}

export function getVscriptPageMeta(p: string, name: string): ArticleMeta {
    return {
        id: name,
        title: name,
        disablePageActions: true,
        features: ["VSCRIPT"],
    };
}
