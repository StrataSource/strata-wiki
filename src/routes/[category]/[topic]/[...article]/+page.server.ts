import type { PageServerLoad } from "./$types";
import { getContent, getPageMeta, getContentMeta } from "$lib/content.server";

export const load = (async ({ params }) => {
    const contentmeta = await getContentMeta(params.category, params.topic);
    const doc = await getContent(contentmeta, params.category, params.topic, params.article);
    const meta = await getPageMeta(contentmeta, params.category, params.topic, params.article);

    return {
        doc: doc,
        meta: meta,
    };
}) satisfies PageServerLoad;
