import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import fs from "fs";

export const prerender = true;

export const GET: RequestHandler = async ({ params }) => {
    if (!fs.existsSync(`../docs/${params.p}`)) {
        throw error(404);
    }
    const original = fs.readFileSync(`../docs/${params.p}`);

    return new Response(original);
};
