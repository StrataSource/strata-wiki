import { get } from "svelte/store";
import { gameMeta } from "./stores";

let cache: { [features: string]: { games: string[]; all: boolean } } = {};

export function getGamesWithSupport(features: string[]) {
    const cacheName = features.join(",");

    if (cache[cacheName]) {
        return cache[cacheName];
    }

    let supportedGames: string[] = [];

    const meta = get(gameMeta);

    for (const [id, game] of Object.entries(meta)) {
        let isSupported = true;
        for (const feature of features) {
            if (!game.features.includes(feature)) {
                isSupported = false;
                break;
            }
        }
        if (isSupported || features.includes(id.toUpperCase())) {
            supportedGames.push(id);
        }
    }

    cache[cacheName] = {
        games: supportedGames,
        all: Object.keys(meta).length == supportedGames.length,
    };

    return cache[cacheName];
}
