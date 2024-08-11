import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import fs from "fs";

import sharp from "sharp";

export const prerender = true;

export const GET: RequestHandler = async ({ params }) => {
    if (!fs.existsSync(`../docs/${params.p}`)) {
        throw error(404);
    }
    const original = fs.readFileSync(`../docs/${params.p}`);

    const s = sharp(original);

    let result: Buffer;

    if (params.res == "low") {
        result = await s.webp({ quality: 80 }).resize(720).toBuffer();
    } else if (params.res == "raw") {
        result = original;
    } else {
        result = await s.webp({ quality: 100 }).toBuffer();
    }

    return new Response(result);
};
