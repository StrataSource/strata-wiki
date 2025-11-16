import fs from "fs";
import { error } from "@sveltejs/kit";
import { parseMarkdown } from "./markdown.server";
import { reportLint } from "$lib/linter.server";
import { urlifyString } from "$lib/util";

type ASScope = 
    | "server"
    | "client";

interface ASNamed {
    namespace: string|undefined;
    name: string;
    scope?: ASScope[];
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
    scope?: ASScope[];
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


const baseTypeNames: string[] = [
	"void",
	"bool",
	"int8",
	"int16",
	"int",
	"int64",
	"uint8",
	"uint16",
	"uint",
	"uint64",
	"float",
	"double"
];

function getASName(o: ASNamed)
{
    return (o.namespace ? o.namespace + "::" : "") + o.name;
}

function getASArticleScope(o: {scope?: ASScope[];}): ArticleScope|undefined
{
    if(!o.scope) {
        return undefined;
    }

    const server = o.scope.includes("server");
    const client = o.scope.includes("client");
    
    return server && client ? "shared" : ( server ? "server" : (client ? "client" : undefined))
}

function compareScope(a: {scope?: ASScope[];}, b: {scope?: ASScope[];})
{
    // cheesy!
    return getASArticleScope(a) === getASArticleScope(b);
}

let angelscriptDump: ASDump = { namespace: [], enum: [], property: [], function: [], type: [] };

function isValidTypeName(type: string) {
    if(baseTypeNames.includes(type)) {
        return false;
    }
    if (angelscriptDump.type.find((o) => type === getASName(o))) {
        return true
    }
    return false;
}

function mergeProperties(scope: ASScope, oTable: ASProperty[], fTable: ASProperty[])
{
    for (const o of oTable) {
        const f = fTable.find(e => e.name === o.name && e.is_const == o.is_const && e.type === o.type);
        if(f) {
            f.scope?.push(scope);
        } else {
            o.scope = [scope];
            fTable.push(o);
        }
    }
}

function mergeFunctions(scope: ASScope, oTable: ASFunction[], fTable: ASFunction[])
{
    for (const o of oTable) {
        // TODO: Combine mismatches!
        const oName = getASName(o);
        const f = fTable.find(e => getASName(e) === oName && e.declaration === o.declaration && e.documentation === o.documentation);
        if(f) {
            f.scope?.push(scope);
        } else {
            o.scope = [scope];
            fTable.push(o);
        }
    }
}

function mergeDump(scope: ASScope, dump: ASDump)
{
    // Namespaces
    for (const o of dump.namespace) {
        if(!angelscriptDump.namespace.includes(o)) {
            angelscriptDump.namespace.push(o);
        }
    }

    // Enums
    for (const o of dump.enum) {
        // TODO: Combine mismatches!
        const oName = getASName(o);
        const f = angelscriptDump.enum.find(e => getASName(e) === oName);
        if(f) {
            f.scope?.push(scope);
            if(Object.keys(f.value).length != Object.keys(o.value).length) {
                error(500, "Enum length mismatch! Likely different values! Implement comparison!")
            }
        } else {
            o.scope = [scope];
            angelscriptDump.enum.push(o);
        }
    }

    // Global Functions
    mergeFunctions(scope, dump.function, angelscriptDump.function);

    // Types
    for (const ot of dump.type) {
        // TODO: Combine mismatches!
        const otName = getASName(ot);
        let ft: ASType|undefined = angelscriptDump.type.find(e => getASName(e) === otName);
        if(!ft) {
            ft = {
                namespace: ot.namespace,
                name: ot.name,
                scope: [scope],
                base_type: ot.base_type,
                template_parameter: ot.template_parameter,
                property: [],
                method: [],
            };
            angelscriptDump.type.push(ft);
        } else {
            ft.scope?.push(scope);
        }
        
        // TODO: Combine mismatches!
        if((ot.base_type ? getASName(ot.base_type) : undefined) != (ft.base_type ? getASName(ft.base_type) : undefined) || ot.template_parameter?.length != ft.template_parameter?.length) {
            console.log(ot);
            console.log(ft);
            error(500, "Type mismatch! Likely different values! Implement comparison!\n" + otName)
        }

        // Type methods
        if(ot.method) {
            if(!ft.method) {
                ft.method = [];
            }

            mergeFunctions(scope, ot.method, ft.method);
        }

        // Type properties
        if(ot.property) {
            if(!ft.property) {
                ft.property = [];
            }

            mergeProperties(scope, ot.property, ft.property);
        }
    }

    // Properties
    mergeProperties(scope, dump.property, angelscriptDump.property);
}

// Compare ASNamed objects, for use with sort()
function compareNamed(a: ASNamed, b: ASNamed): number {
    return getASName(a).toLowerCase().localeCompare(getASName(b).toLowerCase());
}

function parseJSON() {
    let server: ASDump = JSON.parse(
        fs.readFileSync(`../dumps/angelscript_server_p2ce.json`, "utf-8")
    );
    let client: ASDump = JSON.parse(
        fs.readFileSync(`../dumps/angelscript_client_p2ce.json`, "utf-8")
    );
    
    mergeDump("server", server);
    mergeDump("client", client);

    // Sort everything
    angelscriptDump.enum.sort((a, b) => compareNamed(a, b));
    angelscriptDump.function.sort((a, b) => compareNamed(a, b));
    angelscriptDump.property.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    angelscriptDump.type.sort((a, b) => compareNamed(a, b));
    angelscriptDump.namespace.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

function getScopeString(o: ASNamed): string {

    const scope = getASArticleScope(o);

    if(scope === "shared") {
        return "Server & Client";
    } else if(scope === "server") {
        return "Server Only";
    } else if(scope === "client") {
        return "Client Only";
    }

    return "Unknown";
}

function getASTypeLink(p:string, type: string): string {
    if (isValidTypeName(type)) {
        type = `[${type}](/${p}/type/${urlifyString(type)})`;
    }
    return type;
}

function renderEnumPages(name: string, p: string): string[] {
    const out: string[] = [];

    const asEnum: ASEnum|undefined = angelscriptDump.enum.find((o) => urlifyString(getASName(o)) === name);
    if(!asEnum) {
        error(404, "Page not found");
        return out;
    }

    out.push(`# Enum: ${getASName(asEnum)}`);

    out.push(getScopeString(asEnum));

    out.push("## Values");
    out.push("| Name | Value |");
    out.push("|---|---|");

    for(const [iname, ivalue] of Object.entries(asEnum.value)) {
        out.push(`| ${iname} | ${ivalue} |`);
    }

    return out;
}

function renderFunctionPages(name: string, p: string, functions: ASFunction[]): string[] {
    const out: string[] = [];

    const asFuncs: ASFunction[] = functions.filter((o) => urlifyString(getASName(o)) === name);
    if(asFuncs.length == 0) {
        error(404, "Page not found");
        return out;
    }

    out.push(`# Function: ${getASName(asFuncs[0])}`);

    for( const asFunc of asFuncs )
    {
        out.push(getScopeString(asFunc));
        
        if (asFunc.documentation) {
            out.push(asFunc.documentation);
        }

        out.push("```angelscript");
        out.push(asFunc.declaration);
        out.push("```");
    }

    return out;
}

function renderPropertyPageInternal(p:string, properties: ASProperty[], header: string) {
    const out: string[] = [];

    out.push(header);
    out.push("| Type | Name |");
    out.push("|---|---|");

    for(const asProp of properties)
    {
        let type = getASTypeLink(p, asProp.type);
        if (asProp.is_const) {
            type = "const " + type;
        }

        out.push(`| ${type} | ${asProp.name} |`);
    }

    return out;
}

function renderPropertyPage(p: string, properties: ASProperty[], subtext?: boolean): string[] {
    const out: string[] = [];

    const header = (subtext ? "##" : "#") + " Properties";

    const server: ASProperty[] = properties.filter(o => getASArticleScope(o) === "server");
    const client: ASProperty[] = properties.filter(o => getASArticleScope(o) === "client");
    const shared: ASProperty[] = properties.filter(o => getASArticleScope(o) === "shared");

    if(shared.length > 0) {
        out.push(...renderPropertyPageInternal(p, shared, header + " - Shared"));
    }

    if(server.length > 0) {
        out.push(...renderPropertyPageInternal(p, server, header + " - Server"));
    }

    if(client.length > 0) {
        out.push(...renderPropertyPageInternal(p, client, header + " - Client"));
    }

    return out;
}

function renderMethods(parent: ASNamed, methods: ASFunction[])
{
    const out: string[] = [];
    for(const asMethod of methods) {

        const scopeSuffix = compareScope(parent, asMethod) ? "" : ` (${getScopeString(asMethod)})`;
    
        out.push(`### ${asMethod.name}${scopeSuffix}`);
        
        if (asMethod.documentation) {
            out.push(asMethod.documentation);
        }
        out.push("```angelscript");
        out.push(asMethod.declaration);
        out.push("```");
    }

    return out;
}

function renderTypePages(name: string, p: string): string[] {
    const out: string[] = [];

    const asType: ASType|undefined = angelscriptDump.type.find((o) => urlifyString(getASName(o)) === name);
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

    if (asType.base_type) {
        let name = getASTypeLink(p, getASName(asType.base_type));
        out.push(`Extends: ${name}\n`);
    }

    out.push(getScopeString(asType));

    if (asType.property) {
        out.push(...renderPropertyPage(p, asType.property, true))
    }

    /* From testing with VPlane & cplane_t, this seems to come out looking sort of weird?
    // Tack on anything from our base classes
    let base = asType.base_type;
    while(base) {
        const baseUrlName = urlifyString(getASName(base));
        const asBaseType: ASType|undefined = angelscriptDump.type.find((o) => urlifyString(getASName(o)) === baseUrlName);
        if(!asBaseType) {
            break;
        }

        if(asBaseType.property && asBaseType.property.length > 0) {
            let name = getASTypeLink(p, getASName(asBaseType));
            out.push(`### Inherited From ${name}`);
            out.push(...renderPropertyPage(p, asBaseType.property));
        }

        base = asBaseType.base_type;
    }
    */

    let hasPrintedMethodsHeader = false;

    if (asType.method && asType.method.length > 0) {
        hasPrintedMethodsHeader = true;
        out.push("## Methods");
        out.push(...renderMethods(asType, asType.method));
    }

    // Tack on anything from our base classes
    let base = asType.base_type;
    while(base) {
        const baseUrlName = urlifyString(getASName(base));
        const asBaseType: ASType|undefined = angelscriptDump.type.find((o) => urlifyString(getASName(o)) === baseUrlName);
        if(!asBaseType) {
            break;
        }

        if(asBaseType.method && asBaseType.method.length > 0) {
            if(!hasPrintedMethodsHeader) {
                hasPrintedMethodsHeader = true;
                out.push("## Methods");
            }

            let name = getASTypeLink(p, getASName(asBaseType));
            out.push(`### Inherited From ${name}`);
            out.push(...renderMethods(asBaseType, asBaseType.method));
        }
        
        base = asBaseType.base_type;
    }

    return out;
}

export function parseAngelScript(p: string, name: string) {
    const out: string[] = [];

    if (name.startsWith("enum/")) {
        out.push(...renderEnumPages(name.slice("enum/".length), p));
    }
    else if (name.startsWith("function/")) {
        out.push(...renderFunctionPages(name.slice("function/".length), p, angelscriptDump.function));
    }
    else if (name.startsWith("type/")) {
        out.push(...renderTypePages(name.slice("type/".length), p));
    }
    else if (name === "property") {
        out.push(...renderPropertyPage(p, angelscriptDump.property));
    }

    return parseMarkdown(out.join("\n"), `${p}/${name}`);
}

function getASPageMeta(name: string, scope?: ArticleScope): ArticleMeta {
    return {
        title: name,
        type: "angelscript",
        disablePageActions: true,
        features: [], // ["USE_SCRIPTSYSTEM"],
        scope: scope,
    };
}

function getASNamedPageMeta(o: ASNamed): ArticleMeta {
    return getASPageMeta(getASName(o), getASArticleScope(o));
}


function getAngelScriptIndex(p: string): PageGeneratorIndex {
    const index: PageGeneratorIndex = {topics: [], articles: []};

    const enumTopic: MenuTopic = {
        type: "angelscript",
        id: `${p}/enum`,
        title: "Enums",
        weight: -1,
        articles: [],
        subtopics: [],
    };
    for (const o of angelscriptDump.enum) {
        enumTopic.articles.push({
            id: urlifyString(getASName(o)),
            meta: getASNamedPageMeta(o),
        });
    }
    index.topics.push(enumTopic);
    
    const funcTopic: MenuTopic = {
        type: "angelscript",
        id: `${p}/function`,
        title: "Functions",
        weight: -1,
        articles: [],
        subtopics: [],
    };
    for (const o of angelscriptDump.function) {
        
        // Gross... Need to not emit overloads
        const f = funcTopic.articles.find((a) => a.id === urlifyString(getASName(o)));
        if (f) {
            if(f.meta.scope != getASNamedPageMeta(o).scope) {
                error(500, "Function overload scope mismatch! Implement me!\n" + o.name);
            }
            continue;
        }

        funcTopic.articles.push({
            id: urlifyString(getASName(o)),
            meta: getASNamedPageMeta(o),
        });
    }
    index.topics.push(funcTopic);

    const typeTopic: MenuTopic = {
        type: "angelscript",
        id: `${p}/type`,
        title: "Types",
        weight: -1,
        articles: [],
        subtopics: [],
    };
    for (const o of angelscriptDump.type) {
        typeTopic.articles.push({
            id: urlifyString(getASName(o)),
            meta: getASNamedPageMeta(o),
        });
    }
    index.topics.push(typeTopic);

    index.articles.push({
        id: "property",
        meta: {
            type: "angelscript",
            title: "Properties",
            features: [], //["USE_SCRIPTSYSTEM"],
            disablePageActions: true,
            weight: -1,
        },
    });

    return index;
}

export const generatorAngelScript: PageGenerator = {
    init: parseJSON,
    getPageContent: parseAngelScript,
    getIndex: getAngelScriptIndex,
};
