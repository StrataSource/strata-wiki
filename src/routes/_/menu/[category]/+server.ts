import { getCategories, getMenu } from "$lib/content.server";
import { json } from "@sveltejs/kit";
import type { RequestHandler, EntryGenerator } from "./$types";

export const prerender = true;

export const entries: EntryGenerator = async () => {
    const categories = await getCategories();

    return categories.map((c) => {
        return {category: c.id};
    });
};

export const GET: RequestHandler = async ({ params }) => {
    const menu = await getMenu(params.category);
    
    return json(menu);
};
