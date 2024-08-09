import { parseMarkdown } from "$lib/parsers/markdown.server";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import fs from "fs";
import { getContent, getPageMeta } from "$lib/content.server";

export const load = (async ({ params }) => {
    return {
        doc: getContent(params.category, params.topic, params.article),
        meta: getPageMeta(params.category, params.topic, params.article),
    };
}) satisfies PageServerLoad;
