import { get } from "svelte/store";
import { gameMeta } from "./stores";

let cache: {
    [features: string]: {
        games: string[];
        all: boolean;
        unknownGames: string[];
    };
} = {};

export function getGamesWithSupport(features: string[]) {
    const cacheName = features.join(",");

    if (cache[cacheName]) {
        return cache[cacheName];
    }

    let supportedGames: string[] = [];

    const meta = get(gameMeta);

    let supportedCount = 0;

    for (const [id, game] of Object.entries(meta)) {
        let isSupported = true;

        if (features.includes("UNKNOWN_" + id.toUpperCase())) {
            supportedCount++;
            continue;
        }

        for (const feature of features) {
            if (!game.features.includes(feature)) {
                isSupported = false;
                break;
            }
        }
        if (isSupported || features.includes(id.toUpperCase())) {
            supportedCount++;
            supportedGames.push(id);
        }
    }

    cache[cacheName] = {
        games: supportedGames,
        all: Object.keys(meta).length == supportedCount,
        unknownGames: features
            .filter((v) => v.startsWith("UNKNOWN_"))
            .map((v) => v.slice(8).toLowerCase()),
    };

    return cache[cacheName];
}
