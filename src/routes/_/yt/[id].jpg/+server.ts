import type { RequestHandler } from "./$types";

import fetch from "node-fetch";

// Needs to be auto, as youtube links are only used on the test page right now
export const prerender = 'auto';

export const GET: RequestHandler = async ({ params }) => {
    const req = await fetch(
        `https://i3.ytimg.com/vi/${params.id}/maxresdefault.jpg`
    );

    return new Response(await req.blob());
};
