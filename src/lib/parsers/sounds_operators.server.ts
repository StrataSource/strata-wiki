import fs from "fs";
import { error } from "@sveltejs/kit";
import { parseMarkdown } from "./markdown.server";

interface Operator {
    inputs: Property[];
    keyvalues: Property[];
    outputs: Property[];
}

interface Property {
    name: string;
    type: string;
}

let cache: { [className: string]: Operator } = {};

function parseJSON() {
    cache = JSON.parse(
        fs.readFileSync(`../dumps/sound_operators.json`, "utf-8")
    );
}

function parseSoundOperators(p: string, name: string) {
    const operator = cache[name];

    if (!operator) {
        error(404, "Page not found");
    }

    const out: string[] = [];

    out.push(`# ${name}`);

    if (operator.inputs.length > 0) {
        out.push(`## Inputs`);

        const temp = [];

        temp.push("| Type | Name |", "|---|---|");

        for (const input of operator.inputs) {
            temp.push(`| ${input.type} | \`${input.name}\` |`);
        }

        out.push(temp.join("\n"));
    }

    if (operator.outputs.length > 0) {
        out.push(`## Outputs`);

        const temp = [];

        temp.push("| Type | Name |", "|---|---|");

        for (const output of operator.outputs) {
            temp.push(`| ${output.type} | \`${output.name}\` |`);
        }

        out.push(temp.join("\n"));
    }

    return parseMarkdown(out.join("\n\n"), `${p}/${name}`);
}

function getSoundOperatorsIndex(p: string): PageGeneratorIndex {
    const index: PageGeneratorIndex = {topics: [], articles: []};

    for (const c of Object.keys(cache)) {
        index.articles.push({
            id: c,
            meta: {
                title: c,
                type: "sound_operators",
            },
        });
    }

    return index;
}

function getSoundOperatorsPageMeta(
    p: string,
    name: string
): ArticleMeta {
    return {
        title: name,
        type: "sound_operators",
        disablePageActions: true,
    };
}


export const generatorSoundOperators: PageGenerator = {
    init: parseJSON,
    getPageContent: parseSoundOperators,
    getPageMeta: getSoundOperatorsPageMeta,
    getIndex: getSoundOperatorsIndex,
};
