import { getCategories, getMenu } from "$lib/content.server.js";
import { json } from "@sveltejs/kit";
import type { EntryGenerator, RequestHandler } from "./$types";

export const prerender = true;

export const entries: EntryGenerator = () => {
    const categories = getCategories();

    return categories.map((c) => {
        return { category: c.id || "" };
    });
};

export const GET: RequestHandler = async ({ params }) => {
    const menu = getMenu(params.category);
    return json(menu);
};
