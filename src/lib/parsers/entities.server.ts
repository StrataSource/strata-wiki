import fs from "fs";
import { error } from "@sveltejs/kit";
import { parseMarkdown } from "./markdown.server";
import { getGames } from "$lib/content.server";
import { reportLint } from "$lib/linter.server";
import { urlifyString } from "$lib/util";

const baseType = "BASE";

interface Entity {
    type: string;
    classname: string;
    desc: string;
    bases?: string[];
    keyvalues?: EntityKeyValues[];
    inputs?: EntityConnection[];
    outputs?: EntityConnection[];
}
interface EntityKeyValues {
    name: string;
    type: string;
    default: string;
    desc: string;
    origin: string;
    choices?: {
        [choice: string]: string;
    };
    flags?: {
        [flag: string]: {
            default: boolean;
            num: number;
        };
    };
}
interface EntityConnection {
    name: string;
    type: string;
    desc: string;
    origin: string;
}

let index: {
    [id: string]: { entity: Entity; support: string[] };
} = {};

function indexEntities() {

    index = {};

    for (const game of Object.keys(getGames())) {
        const jsonPath = `../dumps/entities_${game}.json`;

        if (!fs.existsSync(jsonPath)) {
            reportLint(
                "caution",
                "entity_noDump_" + game,
                `${game} does not an entity dump`,
                ""
            );
            continue;
        }

        const entities: Entity[] = JSON.parse(
            fs.readFileSync(jsonPath, "utf-8")
        );

        for (const entity of entities) {
            if (index[entity.classname]) {
                index[entity.classname].support.push(game.toUpperCase());
            } else {
                index[entity.classname] = {
                    entity: entity,
                    support: [game.toUpperCase()],
                };
            }
        }
    }
}

function parseEntity(p: string, name: string) {

    if (!index[name]) {
        error(404, "Page not found");
    }

    const entity = index[name].entity;

    let temp = "";

    if (entity.type == baseType) {
        temp +=
            `> [!CAUTION]\n` +
            `> \`${entity.classname}\` is an internal entity and should not be used on its own.\n\n`;
    }

    temp += `# \`${entity.type}\` ${entity.classname}\n\n`;

    if (entity.desc != "") {
        temp += `${entity.desc}\n\n`;
    }

    if (fs.existsSync(`../docs/${p}/${name}.md`)) {
        temp += fs.readFileSync(`../docs/${p}/${name}.md`, "utf-8") + "\n\n";
    }

    const keyvalues: EntityKeyValues[] = [];
    const inputs: EntityConnection[] = [];
    const outputs: EntityConnection[] = [];

    function parseEntityBase(en: Entity) {
        if (en.keyvalues) {
            for (const kv of en.keyvalues) {
                if (keyvalues.filter((v) => v.name == kv.name).length < 1) {
                    kv.origin = en.classname;
                    keyvalues.push(kv);
                }
            }
        }

        if (en.inputs) {
            for (const i of en.inputs) {
                if (inputs.filter((v) => v.name == i.name).length < 1) {
                    i.origin = en.classname;
                    inputs.push(i);
                }
            }
        }

        if (en.outputs) {
            for (const o of en.outputs) {
                if (outputs.filter((v) => v.name == o.name).length < 1) {
                    o.origin = en.classname;
                    outputs.push(o);
                }
            }
        }

        if (en.bases) {
            for (const base of en.bases) {
                const e = index[base].entity;

                parseEntityBase(e);
            }
        }
    }
    parseEntityBase(entity);

    if (keyvalues.length > 0) {
        temp += "## KeyValues\n\n";

        let lastOrigin = entity.classname;

        for (const kv of keyvalues) {
            //Discard seperator lines starting with at least 3 dashes

            if (kv.name.startsWith("---")) {
                continue;
            }

            if (lastOrigin != kv.origin) {
                temp += `### Inherited from [${kv.origin}](./${kv.origin})\n\n`;
                lastOrigin = kv.origin;
            }

            temp +=
                `> #### ${kv.name} \`<${
                    kv.type.includes("\n") ? "enum" : kv.type
                }>` +
                //If default, show it
                `${kv.default ? " = " + kv.default : ""}\`\n> \n` +
                //If enum, add type
                (kv.type.includes("\n")
                    ? "```\n" + `${kv.type}\n\n` + "```\n"
                    : "") +
                //Description
                `> ${kv.desc || "*No description provided.*"}\n`;

            if (kv.choices) {
                temp += `> \n`;
                temp += `> **Possible Values:**\n`;
                temp += `> \n`;
                temp += `> | Name | Value |\n`;
                temp += `> |---|---:|\n`;
                for (const [id, value] of Object.entries(kv.choices)) {
                    temp += `> | ${id} | ${value} |\n`;
                }
            }

            if (kv.flags) {
                temp += `> \n`;
                temp += `> **Possible Flags:**\n`;
                temp += `> \n`;
                temp += `> | Name | Value | Default |\n`;
                temp += `> |---|---:|:---:|\n`;
                for (const [id, value] of Object.entries(kv.flags)) {
                    temp += `> | ${id} | ${value.num} | ${
                        value.default ? "✅" : "❌"
                    } |\n`;
                }
            }

            temp += "\n";

            if (!kv.desc) {
                reportLint(
                    "note",
                    "entity_noDesc_kv_" + kv.name,
                    `KeyValue "${kv.name}" does not have a description`,
                    `${p}/${entity.classname}#${urlifyString(kv.name)}`
                );
            }
        }
    }

    if (inputs.length > 0) {
        temp += "## Inputs\n\n";

        let lastOrigin = entity.classname;

        for (const i of inputs) {
            if (lastOrigin != i.origin) {
                temp += `### Inherited from [${i.origin}](./${i.origin})\n\n`;
                lastOrigin = i.origin;
            }

            temp +=
                `> #### ${i.name} \`<${i.type}>\` \n> \n` +
                //Description
                `> ${i.desc || "*No description provided.*"}\n\n`;

            if (!i.desc) {
                reportLint(
                    "note",
                    "entity_noDesc_i_" + i.name,
                    `Input "${i.name}" does not have a description`,
                    `${p}/${entity.classname}#${urlifyString(i.name)}`
                );
            }
        }
    }

    if (outputs.length > 0) {
        temp += "## Outputs\n\n";

        let lastOrigin = entity.classname;

        for (const o of outputs) {
            if (lastOrigin != o.origin) {
                temp += `### Inherited from [${o.origin}](./${o.origin})\n\n`;
                lastOrigin = o.origin;
            }

            temp +=
                `> #### ${o.name} \`<${o.type}>\`\n> \n` +
                //Description
                `> ${o.desc || "*No description provided.*"}\n\n`;

            if (!o.desc) {
                reportLint(
                    "note",
                    "entity_noDesc_o_" + o.name,
                    `Output "${o.name}" does not have a description`,
                    `${p}/${entity.classname}#${urlifyString(o.name)}`
                );
            }
        }
    }

    return parseMarkdown(temp, `${p}/${name}`);
}

function getEntityTopic(p: string) {

    const res: MenuArticle[] = [];

    for (const entity of Object.values(index)) {
        if (entity.entity.type == baseType) {
            continue;
        }
        res.push({
            id: entity.entity.classname,
            meta: {
                type: "entity",
                title: entity.entity.classname,
                features: entity.support
            },
        });
    }

    return res;
}

function getEntityPageMeta(p: string, name: string) {

    const meta: ArticleMeta = {
        type: "entity",
        title: name,
        features: index[name].support,
        disablePageActions: !fs.existsSync(`../docs/${p}/${name}.md`),
    };

    return meta;
}

export const generatorEntity: PageGenerator = {
    init: indexEntities,
    getPageContent: parseEntity,
    getPageMeta: getEntityPageMeta,
    getTopic: getEntityTopic,
    getSubtopics: (p: string) => { return []; },
};
