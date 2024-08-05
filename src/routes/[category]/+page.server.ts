import { getContentMeta, getMenu } from "$lib/content.server";
import type { PageServerLoad } from "./$types";

export const load = (async ({ url, params }) => {
    return {
        meta: getContentMeta(params.category, "").meta,
        menu: getMenu(params.category),
    };
}) satisfies PageServerLoad;
