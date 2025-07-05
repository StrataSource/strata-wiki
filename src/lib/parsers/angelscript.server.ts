import fs from "fs";
import { error } from "@sveltejs/kit";
import { parseMarkdown } from "./markdown.server";
import { reportLint } from "$lib/linter.server";
import { urlifyString } from "$lib/util";

interface ASNamed {
    namespace: string|undefined;
    name: string;
}

interface ASEnum extends ASNamed {
    value : { [name: string]: number };
}

interface ASFunction extends ASNamed {
    declaration: string;
    documentation: string|undefined;
}

interface ASProperty {
    type: string;
    name: string;
    is_const: boolean;
}

interface ASTemplateParameter {
    type: string;
    name: string;
}

interface ASType extends ASNamed {
    template_parameter: ASTemplateParameter[]|undefined;
    base_type: ASNamed|undefined;
    property: ASProperty[]|undefined;
    method: ASFunction[]|undefined;
}

interface ASDump {
    namespace: string[];
    enum: ASEnum[];
    property: ASProperty[];
    function: ASFunction[];
    type: ASType[];
}


function getASName(o: ASNamed)
{
    return (o.namespace ? o.namespace + "::" : "") + o.name;
}

let angelscriptAllDumps: { [scope: string]: ASDump } = {};
let angelscriptDump: ASDump = { namespace: [], enum: [], property: [], function: [], type: [] };

function isValidTypeName(type: string) {
    if (angelscriptDump.type.find((o) => type == getASName(o))) {
        return true
    }
    return false;
}

function parseJSON() {
    let server: ASDump = JSON.parse(
        fs.readFileSync(`../dumps/angelscript_server_p2ce.json`, "utf-8")
    );
    let client: ASDump = JSON.parse(
        fs.readFileSync(`../dumps/angelscript_client_p2ce.json`, "utf-8")
    );
    
    angelscriptAllDumps["server"] = server;
    angelscriptAllDumps["client"] = client;

    angelscriptDump = angelscriptAllDumps["server"];
}


function renderEnumPages(name: string, p: string): string[] {
    const out: string[] = [];

    const asEnum: ASEnum|undefined = angelscriptDump.enum.find((o) => urlifyString(getASName(o)) == name);
    if(!asEnum) {
        error(404, "Page not found");
        return out;
    }

    out.push(`# Enum: ${getASName(asEnum)}`);

    out.push("## Values");
    out.push("| Name | Value |");
    out.push("|---|---|");

    for(const [iname, ivalue] of Object.entries(asEnum.value)) {
        out.push(`| ${iname} | ${ivalue} |`);
    }

    return out;
}

function renderFunctionPages(name: string, p: string): string[] {
    const out: string[] = [];

    const asFuncs: ASFunction[] = angelscriptDump.function.filter((o) => urlifyString(getASName(o)) == name);
    if(asFuncs.length == 0) {
        error(404, "Page not found");
        return out;
    }

    out.push(`# Function: ${getASName(asFuncs[0])}`);

    for( const asFunc of asFuncs )
    {
        if (asFunc.documentation) {
            out.push(asFunc.documentation);
        }
        out.push("```angelscript");
        out.push(asFunc.declaration);
        out.push("```");
    }

    return out;
}


function renderPropertyPage(name: string, p: string): string[] {
    const out: string[] = [];

    out.push("# Properties");
    out.push("| Type | Name |");
    out.push("|---|---|");

    for( const asProp of angelscriptDump.property )
    {
        let type = asProp.type
        if (isValidTypeName(type)) {
            type = `[${asProp.type}](/${p}/type/${urlifyString(asProp.type)})`;
        }
        if (asProp.is_const) {
            type = "const " + type;
        }

        out.push(`| ${type} | ${asProp.name} |`);
    }

    return out;
}

function renderTypePages(name: string, p: string): string[] {
    const out: string[] = [];

    const asType: ASType|undefined = angelscriptDump.type.find((o) => urlifyString(getASName(o)) == name);
    if(!asType) {
        error(404, "Page not found");
        return out;
    }

    if (asType.template_parameter) {
        let params = "";
        for (let i = 0; i < asType.template_parameter.length; i++) {
            params += asType.template_parameter[i].type + " " + asType.template_parameter[i].name;
            if ( i + 1 < asType.template_parameter.length) {
                params += ", ";
            }
        }
        out.push(`# Type: ${getASName(asType)}<${params}>`);
    }
    else {
        out.push(`# Type: ${getASName(asType)}`);
    }

    if ( asType.base_type ) {
        const name = getASName(asType.base_type);
        out.push(`Extends: [${name}](/${p}/type/${urlifyString(name)})`);
    }

    if ( asType.property ) {
        out.push("## Properties");
        out.push("| Type | Name |");
        out.push("|---|---|");

        for( const asProp of asType.property )
        {
            let type = asProp.type
            if (isValidTypeName(type)) {
                type = `[${asProp.type}](/${p}/type/${urlifyString(asProp.type)})`;
            }
            if (asProp.is_const) {
                type = "const " + type;
            }

            out.push(`| ${type} | ${asProp.name} |`);
        }
    }

    if ( asType.method ) {
        out.push("## Methods");
        
        for(const asMethod of asType.method) {
            out.push(`### ${asMethod.name}`);
            if (asMethod.documentation) {
                out.push(asMethod.documentation);
            }
            out.push("```angelscript");
            out.push(asMethod.declaration);
            out.push("```");
        }
    }

    return out;
}

export function parseAngelScript(p: string, name: string) {
    const out: string[] = [];

    if (name.startsWith("enum/")) {
        out.push(...renderEnumPages(name.slice("enum/".length), p));
    }
    else if (name.startsWith("function/")) {
        out.push(...renderFunctionPages(name.slice("function/".length), p));
    }
    else if (name.startsWith("type/")) {
        out.push(...renderTypePages(name.slice("type/".length), p));
    }
    else if (name == "property") {
        out.push(...renderPropertyPage(name, p));
    }

    return parseMarkdown(out.join("\n"), `${p}/${name}`);
}

export function getAngelScriptPageMeta(p: string, name: string): ArticleMeta {
    return {
        title: name,
        type: "angelscript",
        disablePageActions: true,
        features: ["USE_SCRIPTSYSTEM"],
    };
}


function getAngelScriptIndex(p: string): PageGeneratorIndex {
    const index: PageGeneratorIndex = {topics: [], articles: []};

    const enumTopic: MenuTopic = {
        id: `${p}/enum`,
        title: "Enums",
        weight: -1,
        articles: [],
        subtopics: [],
    };
    for (const o of angelscriptDump.enum) {
        enumTopic.articles.push({
            id: urlifyString(getASName(o)),
            meta: {
                type: "angelscript",
                title: getASName(o),
                features: []
            },
        });
    }
    index.topics.push(enumTopic);
    
    const funcTopic: MenuTopic = {
        id: `${p}/function`,
        title: "Functions",
        weight: -1,
        articles: [],
        subtopics: [],
    };
    for (const o of angelscriptDump.function) {
        
        // Gross... Need to not emit overloads
        if (funcTopic.articles.find((a) => a.id == urlifyString(getASName(o)))) {
            continue;
        }

        funcTopic.articles.push({
            id: urlifyString(getASName(o)),
            meta: {
                type: "angelscript",
                title: getASName(o),
                features: []
            },
        });
    }
    index.topics.push(funcTopic);

    const typeTopic: MenuTopic = {
        id: `${p}/type`,
        title: "Types",
        weight: -1,
        articles: [],
        subtopics: [],
    };
    for (const o of angelscriptDump.type) {
        typeTopic.articles.push({
            id: urlifyString(getASName(o)),
            meta: {
                type: "angelscript",
                title: getASName(o),
                features: []
            },
        });
    }
    index.topics.push(typeTopic);

    index.articles.push({
        id: "property",
        meta: {
            type: "angelscript",
            title: "Properties",
            features: [],
            weight: -1,
        },
    });

    return index;
}

export const generatorAngelScript: PageGenerator = {
    init: parseJSON,
    getPageContent: parseAngelScript,
    getPageMeta: getAngelScriptPageMeta,
    getIndex: getAngelScriptIndex,
};
