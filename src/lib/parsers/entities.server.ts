import fs from "fs";
import { error } from "@sveltejs/kit";
import { parseMarkdown } from "./markdown.server";
import { getGames } from "$lib/content.server";

interface Entity {
    type: string;
    classname: string;
    desc: string;
    spawnFlags: EntitySpawnFlags[];
    keyvalues: EntityKeyValues[];
    inputs: EntityConnection[];
    outputs: EntityConnection[];
}
interface EntitySpawnFlags {
    num: number;
    desc: string;
    default: boolean;
    origin: string;
}
interface EntityKeyValues {
    name: string;
    type: string;
    default: string;
    desc: string;
    origin: string;
}
interface EntityConnection {
    name: string;
    type: string;
    desc: string;
    origin: string;
}

const index: {
    [p: string]: {
        [id: string]: { entity: Entity; support: string[] };
    };
} = {};
const isIndexed: string[] = [];

function indexEntities(p: string) {
    if (isIndexed.includes(p)) {
        return;
    }
    console.log("Indexing Entities for", p, "This might take a while...");

    index[p] = {};

    for (const game of Object.keys(getGames())) {
        if (!fs.existsSync(`../docs/${p}/entities_${game}.json`)) {
            console.warn(game, "doesn't have an entities file in", p);
            continue;
        }

        const entities: Entity[] = JSON.parse(
            fs.readFileSync(`../docs/${p}/entities_${game}.json`, "utf-8")
        );

        for (const entity of entities) {
            if (index[p][entity.classname]) {
                index[p][entity.classname].support.push(game.toUpperCase());
            } else {
                index[p][entity.classname] = {
                    entity: entity,
                    support: [game.toUpperCase()],
                };
            }
        }
    }

    isIndexed.push(p);
}

export function parseEntity(p: string, name: string) {
    indexEntities(p);

    if (!index[p][name]) {
        throw error(404);
    }

    const entity = index[p][name].entity;

    let temp = "";

    temp += `# \`${entity.type}\` ${entity.classname}\n\n`;

    if (entity.desc != "") {
        temp += `${entity.desc}\n\n`;
    }

    if (fs.existsSync(`../docs/${p}/${name}.md`)) {
        temp += fs.readFileSync(`../docs/${p}/${name}.md`, "utf-8") + "\n\n";
    }

    if (entity.keyvalues.length > 0) {
        temp += "## KeyValues\n\n";

        for (const kv of entity.keyvalues) {
            temp +=
                `### ${kv.name} \`<${
                    kv.type.includes("\n") ? "enum" : kv.type
                }>` +
                //If default, show it
                `${kv.default ? " = " + kv.default : ""}\`\n\n` +
                //If enum, add type
                (kv.type.includes("\n")
                    ? "```\n" + `${kv.type}\n\n` + "```\n"
                    : "") +
                //If origin, show it
                (kv.origin == "" ? "" : `Origin: \`${kv.origin}\`\n\n`) +
                //Description
                `${kv.desc}\n\n`;
        }
    }

    if (entity.inputs.length > 0) {
        temp += "## Inputs\n\n";

        for (const i of entity.inputs) {
            temp +=
                `### ${i.name} \`<${i.type}>\` \n\n` +
                //If origin, show it
                (i.origin == "" ? "" : `Origin: \`${i.origin}\`\n\n`) +
                //Description
                `${i.desc}\n\n`;
        }
    }

    if (entity.outputs.length > 0) {
        temp += "## Outputs\n\n";

        for (const o of entity.outputs) {
            temp +=
                `### ${o.name} <\`${o.type}\`>\n\n` +
                //If origin, show it
                (o.origin == "" ? "" : `Origin: \`${o.origin}\`\n\n`) +
                //Description
                `${o.desc}\n\n`;
        }
    }

    if (entity.spawnFlags.length > 0) {
        temp += "## SpawnFlags\n\n";

        for (const sf of entity.spawnFlags) {
            temp +=
                `### \`${sf.num}\` ${sf.desc}\n\n` +
                //If origin, show it
                (sf.origin == "" ? "" : `Origin: \`${sf.origin}\`\n\n`) +
                //Default
                `Default: \`${sf.default}\`\n\n`;
        }
    }

    return parseMarkdown(temp, `${p}/${name}`);
}

export function getEntityTopic(p: string) {
    indexEntities(p);

    const res: MenuArticle[] = [];

    for (const entity of Object.values(index[p])) {
        res.push({
            id: entity.entity.classname,
            meta: { title: entity.entity.classname, features: entity.support },
        });
    }

    return res;
}

export function getEntityPageMeta(p: string, name: string) {
    indexEntities(p);

    const meta: ArticleMeta = {
        id: name,
        title: name,
        features: index[p][name].support,
    };

    return meta;
}
