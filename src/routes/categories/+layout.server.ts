import { getCategories } from "$lib/content.server";
import type { LayoutServerLoad } from "./$types";

export const load = (async () => {
    return {
        categories: getCategories(),
    };
}) satisfies LayoutServerLoad;
