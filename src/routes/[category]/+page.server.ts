import { getContentMeta, getMenu } from "$lib/content.server";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params }) => {
    return {
        meta: getContentMeta(params.category, "").meta,
        menu: getMenu(params.category),
    };
}) satisfies PageServerLoad;
