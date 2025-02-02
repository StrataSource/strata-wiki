import { getContentMeta, getMenuTopic } from "$lib/content.server";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params }) => {
    return {
        meta: getContentMeta(`${params.category}/${params.topic || ""}`).meta,
        menu: getMenuTopic(`${params.category}/${params.topic || ""}`),
    };
}) satisfies PageServerLoad;
