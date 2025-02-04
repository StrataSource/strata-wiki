import { getContentMeta, getMenu } from "$lib/content.server";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params }) => {
    const contentmeta = await getContentMeta(params.category, "");
    const menu = await getMenu(params.category);
    
    return {
        meta: contentmeta.meta,
        menu: menu,
    };
}) satisfies PageServerLoad;
