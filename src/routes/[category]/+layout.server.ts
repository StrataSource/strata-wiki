import { getMenu } from "$lib/content.server";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ url, params }) => {
    return {
        menu: getMenu(params.category),
    };
}) satisfies LayoutServerLoad;
