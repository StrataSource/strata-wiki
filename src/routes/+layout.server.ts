import { getGames, getMenu } from "$lib/content.server";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ params }) => {
    return {
        games: getGames(),
        menu: params.category ? getMenu(params.category) : undefined,
    };
}) satisfies LayoutServerLoad;
