import type { RequestHandler } from "./$types";

import fetch from "node-fetch";

export const prerender = true;

export const GET: RequestHandler = async ({ params }) => {
    const req = await fetch(
        `https://i3.ytimg.com/vi/${params.id}/maxresdefault.jpg`
    );

    return new Response(await req.blob());
};
