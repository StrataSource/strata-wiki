import { persisted } from "svelte-persisted-store";
import { writable, type Writable } from "svelte/store";

export const currentGame = persisted("game", "");
export const consent = persisted("consent", { youtube: false });

export const gameMeta: Writable<GameMetaCollection> = writable({});

export const openMenu = writable(false);

export const currentArticle: Writable<ArticleMeta | undefined> = writable();
