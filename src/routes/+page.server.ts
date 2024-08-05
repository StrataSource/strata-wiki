import { getCategories } from "$lib/content.server";
import type { PageServerLoad } from "./$types";

export const load = (async ({ url, params }) => {
    return {
        menu: getCategories(),
    };
}) satisfies PageServerLoad;
