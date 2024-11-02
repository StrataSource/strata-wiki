/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Defines the available reflection kinds.
 * @category Reflections
 */
export const enum ReflectionKind {
    Project = 0x1,
    Module = 0x2,
    Namespace = 0x4,
    Enum = 0x8,
    EnumMember = 0x10,
    Variable = 0x20,
    Function = 0x40,
    Class = 0x80,
    Interface = 0x100,
    Constructor = 0x200,
    Property = 0x400,
    Method = 0x800,
    CallSignature = 0x1000,
    IndexSignature = 0x2000,
    ConstructorSignature = 0x4000,
    Parameter = 0x8000,
    TypeLiteral = 0x10000,
    TypeParameter = 0x20000,
    Accessor = 0x40000,
    GetSignature = 0x80000,
    SetSignature = 0x100000,
    TypeAlias = 0x200000,
    Reference = 0x400000,
    /**
     * Generic non-ts content to be included in the generated docs as its own page.
     */
    Document = 0x800000,
}

export function generateCache(obj: any, target: any): void {
    for (const child of obj.children) {
        target[child.id] = child;
        if (child.children) generateCache(child, target);
    }
}

export function parseDeclaration(obj: any): string {
    switch (obj.kind) {
        case ReflectionKind.Method:
        case ReflectionKind.CallSignature:
        case ReflectionKind.Function: {
            return `${obj.name}()`;
        }
        case ReflectionKind.Property:
        case ReflectionKind.TypeLiteral:
        case ReflectionKind.Variable: {
            return `${obj.name}`;
        }
    }
    return [];
}

export function parseNamespace(obj: any, isRoot=false, idRecordTarget: any): MenuArticle[] {
    const isModule = (obj.kind & ReflectionKind.Module || isRoot);
    const title = obj.name;
    let weight: number|undefined = undefined;

    if (obj.kind & ReflectionKind.Namespace) {
        weight = 100;
    }


    idRecordTarget[title] = obj.id;
    const out: MenuArticle[] = isModule ? [] : [
        {
            id: title,
            meta: { title, weight, extraData: obj.id }
        }
    ];

    for (const child of obj.children) {
        if (child.kind & ReflectionKind.Module || child.kind & ReflectionKind.Namespace) {
            const children = parseNamespace(child, false, idRecordTarget);
            if (!isModule) children.forEach(x => { x.meta.title = title+'.'+x.meta.title })
            out.push(...children);
        }
    }
    
    return out;
}
