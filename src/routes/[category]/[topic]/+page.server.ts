import {
    getCategories,
    getContentMeta,
    getMenu,
    getMenuTopic,
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
    return {
        meta: getContentMeta(`${params.category}/${params.topic || ""}`).meta,
        menu: getMenuTopic(`${params.category}/${params.topic || ""}`),
    };
}) satisfies PageServerLoad;
