import type { PageServerLoad } from "./$types";
import { getContentMeta, getMenuTopic, getContent, getPageMeta } from "$lib/content.server";

export const load = (async ({ params }) => {
    console.log("REEEEE3");
    console.log(params);

    const parts: string[] = params.topic.split('/');

    if(parts.length == 1) {
        return {
            meta: getContentMeta(`${params.category}/${params.topic}`).meta,
            menu: getMenuTopic(`${params.category}/${params.topic}`),
        };
    }

    // lol
    let article = parts.pop();
    if(!article) article = "";

    const path: string = parts.join('/');
    return {
        doc: getContent(`${params.category}/${path}`, article),
        meta: getPageMeta(`${params.category}/${path}`, article),
    };
}) satisfies PageServerLoad;
