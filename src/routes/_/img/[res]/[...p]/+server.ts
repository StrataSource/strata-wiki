import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import fs from "fs";

import sharp from "sharp";

export const prerender = true;

export const GET: RequestHandler = async ({ params }) => {
    if (!fs.existsSync(`../docs/${params.p}`)) {
        error(404, "Page not found");
    }
    const original = fs.readFileSync(`../docs/${params.p}`);

    const s = sharp(original);

    let result: Buffer;

    if (params.res == "lo") {
        result = await s.webp({ quality: 50 }).resize(640).toBuffer();
    } else if (params.res == "md") {
        result = await s.webp({ quality: 80 }).resize(1280).toBuffer();
    } else {
        result = await s.webp({ quality: 100 }).toBuffer();
    }

    return new Response(result);
};
