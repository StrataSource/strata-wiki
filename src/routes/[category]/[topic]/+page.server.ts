import { getContentMeta, getMenuTopic } from "$lib/content.server";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params }) => {
    const contentmeta = await getContentMeta(params.category, params.topic);
    const menu = await getMenuTopic(contentmeta, params.category, params.topic);

    return {
        meta: contentmeta.meta,
        menu: menu,
    };
}) satisfies PageServerLoad;
