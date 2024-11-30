import type { RequestHandler } from "./$types";
import fs from "fs";
import { flushLint, reportLint } from "$lib/linter.server";

export const prerender = true;

export const GET: RequestHandler = async ({ params }) => {
    if (!fs.existsSync(`../games/${params.game}/icon.svg`)) {
        reportLint(
            "caution",
            `icon_missing_${params.game}`,
            `${params.game} is missing an icon!`,
            `_/icon/${params.game}.svg`
        );
        flushLint();
        return new Response(fs.readFileSync(`./src/lib/assets/fallback.svg`));
    }

    return new Response(fs.readFileSync(`../games/${params.game}/icon.svg`));
};
