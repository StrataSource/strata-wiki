import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import fs from "fs";

export const prerender = true;

export const GET: RequestHandler = async ({ params }) => {
    if (!fs.existsSync(`../docs/${params.p}`)) {
        error(404, "Page not found");
    }
    const original = fs.readFileSync(`../docs/${params.p}`);

    return new Response(original);
};
