import { persisted } from "svelte-persisted-store";
import { writable, type Writable } from "svelte/store";

export let currentGame = persisted("game", "");
export let consent = persisted("consent", { youtube: false });

export let gameMeta: Writable<GameMetaCollection> = writable({});

export const openMenu = writable(false);