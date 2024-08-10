import { getGames } from "$lib/content.server";
import type { LayoutServerLoad } from "./$types";

export const load = (async () => {
    return {
        games: getGames(),
    };
}) satisfies LayoutServerLoad;
