import {
    isPathTopic,
    getCategories,
    getMenu,
    getMenuTopic,
    getContent, 
    getPageMeta,
} from "$lib/content.server";
import type { EntryGenerator, PageServerLoad } from "./$types";

export const entries: EntryGenerator = () => {
    const categories = getCategories();

    const out: { category: string; topic: string }[] = [];

    for (const category of categories) {
        if (!category.id) {
            continue;
        }
        const menu = getMenu(category.id);

        out.push(
            ...menu.map((v) => ({ category: category.id || "", topic: v.id }))
        );
    }

    return out;
};

export const load = (async ({ params }) => {
    const path = `${params.category}/${params.article}`;
    if (isPathTopic(path)) {
        return {
            isTopic: true,
            ...getMenuTopic(path)
        }
    } else {
        return {
            isTopic: false,
            doc: getContent(path),
            articleMeta: getPageMeta(path),
        }
    }
}) satisfies PageServerLoad;
