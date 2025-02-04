import { getGames, getMenu, getContentMeta } from "$lib/content.server";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ params }) => {
    const games = await getGames();
    return {
        games: games,
    };
}) satisfies LayoutServerLoad;
