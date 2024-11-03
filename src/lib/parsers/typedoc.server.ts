import fs from "fs";
import type { Root } from "mdast";
import { parseMarkdown } from "./markdown.server";

import { ProjectParser, type NamespaceParser } from "typedoc-json-parser";
import { reportLint } from "$lib/linter.server";
import { urlifyString } from "$lib/util";

// TSdoc "path" that means it's supported everywhere
const sharedName = "shared";

const cache: { [p: string]: ProjectParser } = {};
const namespaceCache: { [p: string]: { [fn: string]: NamespaceParser } } = {};

function getProject(p: string) {
    if (cache[p]) {
        return cache[p];
    }

    const dataRaw: ProjectParser.Json = JSON.parse(
        fs.readFileSync(`../docs/${p}/typedoc.json`, "utf-8")
    );
    cache[p] = new ProjectParser({ data: dataRaw, dependencies: {} });

    return cache[p];
}

function getNamespaces(p: string) {
    getProject(p);
    if (!namespaceCache[p]) {
        namespaceCache[p] = {};
    }

    function parseNamespace(namespace: NamespaceParser, prefix: string = "") {
        namespaceCache[p][prefix + namespace.name] = namespace;

        console.log(namespace.name, prefix);

        for (const ns of namespace.namespaces) {
            parseNamespace(ns, `${prefix}${namespace.name}.`);
        }
    }
    for (const namespace of cache[p].namespaces) {
        parseNamespace(namespace);
    }

    return namespaceCache[p];
}

export function parseTypedoc(p: string, name: string): Root {
    const project = getProject(p);

    const namespaces = getNamespaces(p);

    const namespace = namespaces[name];

    function cleanType(input: string) {
        return input
            .replaceAll(`${project.name}.`, "")
            .replaceAll("typescript.", "");
    }

    const out: string[] = [];

    out.push(
        `> [!NOTE]\n` +
            `Typedoc browsing is in early access and will probably change in the future. If you got feedback, ping max in it.`
    );

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

            if (
                signature.comment.blockTags.filter(
                    (v) => v.name == "deprecated"
                ).length > 0 ||
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
                    }: ${cleanType(param.type.toString())}`
                );
            }

            out.push(
                "```ts\n" +
                    `${name}.${fn.name}(${params.join(
                        ", "
                    )}): ${signature.returnType
                        .toString()
                        .replaceAll(`${project.name}.`, "")}` +
                    "\n```"
            );

            out.push(
                signature.comment.description || "*No description provided.*"
            );

            if (!signature.comment.description) {
                reportLint(
                    "note",
                    "typedoc_noDesc_" + signature.name,
                    `${signature.name} does not have a description!`,
                    `${p}/${name}#${urlifyString(signature.name)}`
                );
            }

            if (signature.comment.example.length > 0) {
                out.push(
                    `#### Example${
                        signature.comment.example.length == 1 ? "" : "s"
                    }`
                );

                for (const example of signature.comment.example) {
                    out.push(example.text);
                }
            }

            if (signature.parameters.length > 0) {
                out.push(
                    `#### Parameter${
                        signature.parameters.length == 1 ? "" : "s"
                    }`
                );

                const temp: string[] = [
                    "| Name | Type | Description |",
                    "|---|---|---|",
                ];

                for (const param of signature.parameters) {
                    temp.push(
                        `| \`${param.rest ? "..." : ""}${
                            param.name
                        }\` | \`${cleanType(
                            param.type.toString().replaceAll("|", "\\|")
                        )}\` ${param.optional ? "(optional)" : ""} | ${
                            param.comment.description ||
                            "*No description provided.*"
                        } |`
                    );
                }

                out.push(temp.join("\n"));
            }

            if (signature.comment.see.length > 0) {
                out.push("#### See also");

                for (const see of signature.comment.see) {
                    out.push(see.text);
                }
            }
        }
    }

    return parseMarkdown(out.join("\n\n"), `${p}/${name}`);
}

export function getTypedocTopic(p: string): MenuArticle[] {
    const out: MenuArticle[] = [];

    const namespaces = getNamespaces(p);

    for (const [id, namespace] of Object.entries(namespaces)) {
        out.push({
            id: id,
            meta: {
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

export function getTypedocPageMeta(p: string, name: string): ArticleMeta {
    const namespaces = getNamespaces(p);

    const namespace = namespaces[name];

    return {
        title: namespace.name,
        features:
            namespace.source?.path == sharedName || !namespace.source?.path
                ? []
                : [namespace.source.path.toUpperCase()],
    };
}
