import fs from "fs";
import type { Root } from "mdast";
import { parseMarkdown } from "./markdown.server";

import {
    type InterfaceParser,
    type InterfacePropertyParser,
    type ParameterParser,
    ProjectParser,
    type SignatureParser,
    type TypeAliasParser,
    TypeParser,
    type VariableParser,
    type NamespaceParser,
} from "typedoc-json-parser";
import { reportLint } from "$lib/linter.server";
import { urlifyString } from "$lib/util";
import { error } from "@sveltejs/kit";

// TSdoc "path" that means it's supported everywhere
const sharedName = "shared";

const cache: { [p: string]: ProjectParser } = {};
const namespaceCache: { [p: string]: { [fn: string]: NamespaceParser } } = {};
const typeCache: { [p: string]: { [fn: string]: TypeAliasParser } } = {};
const interfaceCache: { [p: string]: { [fn: string]: InterfaceParser } } = {};

function initTypedoc() {
    // Little hack, as I don't want to rip out the support for multiple typedoc files and also don't want to properly split out pano from this yet
    const p = "panorama/reference"
    
    const dataRaw: ProjectParser.Json = JSON.parse(
        fs.readFileSync(`../dumps/typedoc.json`, "utf-8")
    );
    cache[p] = new ProjectParser({ data: dataRaw, dependencies: {} });
}

function getProject(p: string) {
    return cache[p];
}

function getNamespaces(p: string) {
    getProject(p);
    if (!namespaceCache[p]) {
        namespaceCache[p] = {};
    }

    function parseNamespace(namespace: NamespaceParser, prefix: string = "") {
        namespaceCache[p][prefix + namespace.name] = namespace;

        for (const ns of namespace.namespaces) {
            parseNamespace(ns, `${prefix}${namespace.name}.`);
        }
    }
    for (const namespace of cache[p].namespaces) {
        parseNamespace(namespace);
    }

    return namespaceCache[p];
}

function getTypes(p: string) {
    const project = getProject(p);

    if (typeCache[p]) {
        return typeCache[p];
    }

    typeCache[p] = {};

    for (const type of project.typeAliases) {
        typeCache[p][type.name] = type;
    }

    return typeCache[p];
}

function getInterfaces(p: string) {
    const project = getProject(p);

    if (interfaceCache[p]) {
        return interfaceCache[p];
    }

    interfaceCache[p] = {};

    for (const interf of project.interfaces) {
        interfaceCache[p][interf.name] = interf;
    }

    return interfaceCache[p];
}

function parseTypedoc(p: string, name: string): Root {
    const out: string[] = [];

    if (name.startsWith("interface/")) {
        out.push(...renderInterfacePage(name.slice(10), p));
    } else if (name == "types") {
        out.push(...renderTypeOverviewPage(p));
    } else if (name == "interface") {
        out.push(...renderInterfaceOverviewPage(p));
    } else {
        out.push(...renderMainPage(p, name));
    }

    return parseMarkdown(out.join("\n\n"), `${p}/${name}`);
}

function cleanType(input: string, p: string) {
    const project = getProject(p);
    return input
        .replaceAll(`${project.name}.`, "")
        .replaceAll("typescript.", "");
}

function generateTable(
    vars: (Partial<
        ParameterParser | InterfacePropertyParser | VariableParser
    > & { rest?: boolean; optional?: boolean })[],
    p: string
) {
    const types = getTypes(p);
    const interfaces = getInterfaces(p);

    const temp: string[] = [];

    temp.push("| Name | Type | Description |");
    temp.push("|---|---|---|");

    for (const param of vars) {
        if (!param.type) {
            continue;
        }

        let type = cleanType(param.type?.toString().replaceAll("|", "\\|"), p);

        switch (param.type.kind) {
            case TypeParser.Kind.Intrinsic:
                break;

            case TypeParser.Kind.Reference:
                if (types[type]) {
                    type = `[${type}](/${p}/types#${urlifyString(type)})`;
                } else if (interfaces[type]) {
                    type = `[${type}](/${p}/interface/${type})`;
                } else {
                    type = `\`${type}\``;
                }
                break;

            default:
                type = `\`${type}\``;
                break;
        }

        temp.push(
            `| \`${param.rest ? "..." : ""}${param.name}\` | ${type} ${
                param.optional ? "(optional)" : ""
            } | ${param.comment?.description || "*No description provided.*"} |`
        );
    }

    return temp;
}

function generateSignature(
    name: string,
    signature: SignatureParser,
    p: string
) {
    const out: string[] = [];

    const project = getProject(p);

    if (
        signature.comment.blockTags.filter((v) => v.name == "deprecated")
            .length > 0 ||
        signature.comment.deprecated
    ) {
        out.push(
            `> [!CAUTION]\n` +
                `> DEPRECATED: ` +
                (signature.comment.blockTags.filter(
                    (v) => v.name == "deprecated"
                )[0]?.text || "Avoid using this function.")
        );
    }

    const params: string[] = [];

    for (const param of signature.parameters) {
        params.push(
            `${param.rest ? "..." : ""}${param.name}${
                param.optional ? "?" : ""
            }: ${cleanType(param.type.toString(), p)}`
        );
    }

    out.push(
        "```ts\n" +
            `${name}.${signature.name}(${params.join(
                ", "
            )}): ${signature.returnType
                .toString()
                .replaceAll(`${project.name}.`, "")}` +
            "\n```"
    );

    out.push(signature.comment.description || "*No description provided.*");

    if (!signature.comment.description) {
        reportLint(
            "note",
            "typedoc_noDesc_" + signature.name,
            `${signature.name} does not have a description!`,
            `${p}/${name}#${urlifyString(signature.name)}`
        );
    }

    if (signature.comment.example.length > 0) {
        const temp: string[] = [];

        temp.push(
            `> #### Example${signature.comment.example.length == 1 ? "" : "s"}`
        );

        for (const example of signature.comment.example) {
            temp.push(...example.text.split("\n"));
        }

        out.push(temp.join("\n > "));
    }

    if (signature.parameters.length > 0) {
        const temp = generateTable(signature.parameters, p);

        temp.unshift(
            `> #### Parameter${signature.parameters.length == 1 ? "" : "s"}`
        );

        out.push(temp.join("\n> "));
    }

    if (signature.comment.see.length > 0) {
        const temp: string[] = [];

        temp.push("> #### See also");

        for (const see of signature.comment.see) {
            temp.push("- " + see.text);
        }

        out.push(temp.join("\n >"));
    }

    return out;
}

function renderInterfacePage(name: string, p: string): string[] {
    const out: string[] = [];

    const interfaces = getInterfaces(p);

    const interf = interfaces[name];

    if (!interf) {
        error(404, "Page not found");
    }

    out.push(`# Interface: ${interf.name}`);

    if (interf.source?.url) {
        out.push(`[View Source](${interf.source.url})`);
    }

    out.push(interf.comment.description || "*No description provided*");

    if (interf.properties.length > 0) {
        out.push("## Properties");
        out.push(generateTable(interf.properties, p).join("\n"));
    }

    if (interf.methods.length > 0) {
        out.push("## Functions");

        for (const method of interf.methods) {
            out.push(`### ${method.name}`);
            for (const signature of method.signatures) {
                out.push(...generateSignature(interf.name, signature, p));
            }
        }
    }

    return out;
}

function renderInterfaceOverviewPage(p: string): string[] {
    const out: string[] = [];

    const project = getProject(p);

    out.push("# Interface Overview");

    for (const interf of project.interfaces) {
        out.push(`## ${interf.name}`);

        const temp: string[] = [];

        if (interf.properties.length > 0) {
            temp.push(
                `[${interf.properties.length} ${
                    interf.properties.length == 1 ? "property" : "properties"
                }](./interface/${interf.name}#properties)`
            );
        }

        if (interf.methods.length > 0) {
            temp.push(
                `[${interf.methods.length} function${
                    interf.methods.length == 1 ? "" : "s"
                }](./interface/${interf.name}#functions)`
            );
        }

        temp.push(`[Read more](./interface/${interf.name})`);

        out.push(temp.join(" - "));

        out.push(interf.comment.description || "*No description provided.*");
    }

    return out;
}

function renderTypeOverviewPage(p: string): string[] {
    const out: string[] = [];

    const project = getProject(p);
    const types = getTypes(p);
    const interfaces = getInterfaces(p);

    out.push("# Type Overview");

    for (const type of project.typeAliases) {
        out.push(`## ${type.name}`);

        out.push(type.comment.description || "*No description provided.*");

        out.push(
            [
                "```ts",
                type.name + " = " + cleanType(type.type.toString(), p),
                "```",
            ].join("\n")
        );

        // This is cursed, but it works stupidly well so I'm not changing it
        const typeSegmentsRaw = [
            ...new Set(
                cleanType(type.type.toString(), p)
                    .replace(/[^\w\s]/gi, " ")
                    .split(" ")
            ),
        ];

        const typeSegments: { name: string; link: string }[] = [];

        for (const segment of typeSegmentsRaw) {
            if (segment == type.name) {
                continue;
            }
            if (types[segment]) {
                typeSegments.push({
                    name: segment,
                    link: `#${urlifyString(segment)}`,
                });
            }
            if (interfaces[segment]) {
                typeSegments.push({
                    name: segment,
                    link: `/${p}/interface/${segment}`,
                });
            }
        }

        if (typeSegments.length > 0) {
            out.push(
                "See also: " +
                    typeSegments
                        .map((v) => `[${v.name}](${v.link})`)
                        .join(" - ")
            );
        }
    }

    return out;
}

function renderMainPage(p: string, name: string): string[] {
    const project = getProject(p);

    const namespaces = getNamespaces(p);

    const namespace = namespaces[name];

    if (!namespace) {
        error(404, "Page not found");
    }

    const out: string[] = [];

    out.push(`# ${name}`);

    if (namespace.source?.url) {
        out.push(`[View Source](${namespace.source.url})`);
    }

    if (namespace.comment.description) {
        out.push(namespace.comment.description);
    }

    if (namespace.functions.length > 0) {
        out.push("## Functions");

        for (const fn of namespace.functions) {
            const signature = fn.signatures[0];

            out.push(`### ${signature.name}`);

            out.push(...generateSignature(name, signature, p));
        }
    }

    if (namespace.variables.length > 0) {
        out.push("## Variables");

        const temp = generateTable(namespace.variables, p);

        out.push(temp.join("\n"));
    }

    return out;
}

export function getTypedocTopic(p: string): MenuArticle[] {
    const out: MenuArticle[] = [];

    out.push({
        id: "types",
        meta:
        {
            type: "typedoc",
            title: "Types",
            weight: -100
        }
    });
    
    const namespaces = getNamespaces(p);
    for (const [id, namespace] of Object.entries(namespaces)) {
        out.push({
            id: id,
            meta: {
                type: "typedoc",
                title: id,
                features:
                    namespace.source?.path == sharedName ||
                    !namespace.source?.path
                        ? []
                        : [namespace.source.path.toUpperCase()],
            },
        });
    }

    return out;
}

function getTypedocSubtopics(p: string): MenuTopic[] {
    const out: MenuTopic[] = [];

    const interfaces = getInterfaces(p);
    const interfaceTopic: MenuTopic = {
        id: `${p}/interface`,
        title: "Interfaces",
        weight: -1,
        articles: [],
        subtopics: [],
    };
    for (const [id, namespace] of Object.entries(interfaces)) {
        interfaceTopic.articles.push({
            id: id,
            meta: {
                type: "typedoc",
                title: id,
                features:
                namespace.source?.path == sharedName ||
                !namespace.source?.path
                ? []
                : [namespace.source.path.toUpperCase()],
            },
        });
    }
    out.push(interfaceTopic);


    return out;
}

function getTypedocPageMeta(p: string, name: string): ArticleMeta {
    //Handling for type and interface page

    if (name.startsWith("interface/")) {
        return {
            type: "typedoc",
            title: "Interface: " + name.slice(10),
            disablePageActions: true,
        };
    } else if (name == "types") {
        return {
            type: "typedoc",
            title: "Type Overview",
            disablePageActions: true
        };
    } else if (name == "interface") {
        return {
            type: "typedoc",
            title: "Interface Overview",
            disablePageActions: true,
        };
    }

    const namespaces = getNamespaces(p);

    const namespace = namespaces[name];

    return {
        type: "typedoc",
        title: namespace.name,
        features:
            namespace.source?.path == sharedName || !namespace.source?.path
                ? []
                : [namespace.source.path.toUpperCase()],
        disablePageActions: true,
    };
}


export const generatorTypedoc: PageGenerator = {
    init: initTypedoc,
    getPageContent: parseTypedoc,
    getPageMeta: getTypedocPageMeta,
    getTopic: getTypedocTopic,
    getSubtopics: getTypedocSubtopics,
};
