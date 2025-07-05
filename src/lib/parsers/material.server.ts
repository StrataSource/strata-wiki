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

let cache: Material[] = []

function parseJSON() {
    const raw = fs.readFileSync(`../dumps/materials.json`, "utf-8");

    cache = JSON.parse(raw);
}

function parseMaterial(p: string, name: string) {

    for (const mat of cache) {
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
                `> ${param.name.toLowerCase()} <${param.type}>${
                    param.default
                        ? " = " +
                          (["texture", "material", "string"].includes(
                              param.type
                          )
                              ? `"${param.default}"`
                              : param.default)
                        : ""
                }\n` +
                "> ```\n" +
                `> \n` +
                `> ${param.desc}\n\n`;
        }

        return parseMarkdown(temp, `${p}/${name}`);
    }

    error(404, "Page not found");
}

function getMaterialIndex(p: string): PageGeneratorIndex {

    const index: PageGeneratorIndex = {topics: [], articles: []};

    for (const mat of cache) {
        index.articles.push({
            id: mat.name,
            meta: {
                title: mat.name,
                type: "material",
                disablePageActions: !fs.existsSync(`../docs/${p}/${mat.name}.md`),
            }
        });
    }

    return index;
}

export const generatorMaterial: PageGenerator = {
    init: parseJSON,
    getPageContent: parseMaterial,
    getIndex: getMaterialIndex,
};
