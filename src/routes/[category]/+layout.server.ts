import { getMenu } from "$lib/content.server";
import { parseMarkdown } from "$lib/parsers/markdown.server";
import type { LayoutServerLoad } from "./$types";
import fs from "fs";

export const load = (async ({ url, params }) => {
    return {
        menu: getMenu(params.category),
    };
}) satisfies LayoutServerLoad;
