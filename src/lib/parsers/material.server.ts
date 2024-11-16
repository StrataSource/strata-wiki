import fs from "fs";
import { error } from "@sveltejs/kit";
import { parseMarkdown } from "./markdown.server";

interface Material {
    name: string;
    fallbacks: string[];
    params: MaterialParam[];
}
interface MaterialParam {
    name: string;
    desc: string;
    type: string;
    default: string;
}

const cache: { [id: string]: { content: Material[]; original: string } } = {};

function parseJSON(p: string) {
    const raw = fs.readFileSync(`../docs/${p}/materials.json`, "utf-8");

    if (p && cache[p] && cache[p].original === raw) {
        return cache[p].content;
    }

    console.log("Cache miss, regenerating...", p);

    const parsed: Material[] = JSON.parse(raw);

    cache[p] = { content: parsed, original: raw };

    return parsed;
}

export function parseMaterial(p: string, name: string) {
    const all = parseJSON(p);

    for (const mat of all) {
        if (mat.name != name) {
            continue;
        }

        let temp = `# ${mat.name}\n\n`;

        if (mat.fallbacks.length > 0) {
            temp += `Aliases: \`${mat.fallbacks.join("`, `")}\`\n\n`;
        }

        if (fs.existsSync(`../docs/${p}/${name}.md`)) {
            temp +=
                fs.readFileSync(`../docs/${p}/${name}.md`, "utf-8") + "\n\n";
        }

        temp += `## Parameters\n\n`;

        for (const param of mat.params) {
            temp +=
                "> ```c\n" +
                `> ${param.name} <${param.type}>${
                    param.default ? " = " + param.default : ""
                }\n` +
                "> ```\n" +
                `> \n` +
                `> ${param.desc}\n\n`;
        }

        return parseMarkdown(temp, `${p}/${name}`);
    }

    throw error(404);
}

export function getMaterialTopic(p: string) {
    const res: MenuArticle[] = [];

    const all = parseJSON(p);

    for (const mat of all) {
        res.push({ id: mat.name, meta: { title: mat.name } });
    }

    return res;
}

export function getMaterialPageMeta(name: string): ArticleMeta {
    return { id: name, title: name };
}
