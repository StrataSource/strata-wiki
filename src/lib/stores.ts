import { persisted } from "svelte-persisted-store";
import { writable, type Writable } from "svelte/store";

export let currentGame = persisted("game", "");

export let gameMeta: Writable<GameMetaCollection> = writable({});
