import { getGames, getMenu, getContentMeta } from "$lib/content.server";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ params }) => {
    const games = await getGames();
    const menu = params.category ? await getMenu(params.category) : undefined;
    return {
        games: games,
        menu: menu,
    };
}) satisfies LayoutServerLoad;
