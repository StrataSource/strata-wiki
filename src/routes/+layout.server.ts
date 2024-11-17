import { getGames, getMenu } from "$lib/content.server";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ params }) => {
    let menu: MenuCategory[] | undefined = undefined;

    try {
        if (params.category) {
            menu = getMenu(params.category);
        }
    } catch {
        /* empty */
    }

    return {
        games: getGames(),
        menu: menu,
    };
}) satisfies LayoutServerLoad;
