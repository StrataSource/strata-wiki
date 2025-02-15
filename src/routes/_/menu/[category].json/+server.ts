import { getMenu } from "$lib/content.server.js";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async ({ params }) => {
    const menu = getMenu(params.category);
    return json(menu);
};
