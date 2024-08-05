import { parseMarkdown } from "$lib/parsers/markdown.server";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import fs from "fs";
import { getContent } from "$lib/content.server";

export const load = (async ({ params }) => {
    const doc = getContent(params.category, params.topic, params.article);

    return {
        doc: doc,
    };
}) satisfies PageServerLoad;
