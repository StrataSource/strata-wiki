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

const cache: { [id: string]: { [className: string]: Operator } } = {};

function parseJSON(p: string) {
    if (p && cache[p]) {
        return cache[p];
    }

    cache[p] = JSON.parse(
        fs.readFileSync(`../docs/${p}/sound_operators.json`, "utf-8")
    );

    return cache[p];
}

export function parseSoundOperators(p: string, name: string) {
    const all = parseJSON(p);

    const operator = all[name];

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

export function getSoundOperatorsTopic(p: string) {
    const res: MenuArticle[] = [];

    const all = parseJSON(p);

    for (const c of Object.keys(all)) {
        res.push({
            id: c,
            meta: {
                title: c,
            },
        });
    }

    return res;
}

export function getSoundOperatorsPageMeta(
    p: string,
    name: string
): ArticleMeta {
    return {
        id: name,
        title: name,
        disablePageActions: true,
    };
}
