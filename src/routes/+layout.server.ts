import { getGames, getMenu } from "$lib/content.server";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ params }) => {
    let menu: MenuCategory[] | undefined = undefined;

    try {
        if (params.category) {
            menu = JSON.parse(JSON.stringify(getMenu(params.category)));

            if (!menu) {
                return;
            }

            for (const topic of menu) {
                topic.articles = topic.articles.slice(0, 100);
            }
        }
    } catch {
        /* empty */
    }

    return {
        games: getGames(),
        menu: menu,
    };
}) satisfies LayoutServerLoad;
