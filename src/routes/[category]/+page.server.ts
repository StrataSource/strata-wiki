import { getCategories, getContentMeta, getMenu } from "$lib/content.server";
import type { EntryGenerator, PageServerLoad } from "./$types";

export const entries: EntryGenerator = () => {
    const categories = getCategories();

    return categories.map((c) => ({ category: c.id || "" }));
};

export const load = (async ({ params }) => {
    return {
        meta: getContentMeta(params.category).meta,
        menu: getMenu(params.category),
    };
}) satisfies PageServerLoad;
