<script lang="ts">
    import { mdiSelectionEllipse } from "@mdi/js";
    import Notice from "../Notice.svelte";
    import { getGamesWithSupport } from "$lib/supportChecker";
    import { gameMeta } from "$lib/stores";
    import UnknownSupportNotice from "./UnknownSupportNotice.svelte";

    export let features: string[];

    const support = getGamesWithSupport(features);

    let gamesString = "";

    for (let index = 0; index < support.games.length; index++) {
        const game = support.games[index];

        if (index == support.games.length - 1 && support.games.length > 1) {
            gamesString += " and ";
        } else if (index != 0) {
            gamesString += ", ";
        }

        gamesString += $gameMeta[game].name;
    }

    let unknownGamesString = "";

    for (let index = 0; index < support.unknownGames.length; index++) {
        const game = support.unknownGames[index];

        if (
            index == support.unknownGames.length - 1 &&
            support.unknownGames.length > 1
        ) {
            unknownGamesString += " and ";
        } else if (index != 0) {
            unknownGamesString += ", ";
        }

        unknownGamesString += $gameMeta[game].name;
    }
</script>

{#if !support.all}
    <Notice type="warning" icon={mdiSelectionEllipse} title="Limited support">
        This feature is only present in {gamesString}.
        {#if support.unknownGames.length > 0}
            Due to technical limitations, feature support information for {unknownGamesString}
            is unavailable for this section.
        {/if}
    </Notice>
{:else if support.unknownGames.length > 0}
    <UnknownSupportNotice name={unknownGamesString}></UnknownSupportNotice>
{/if}
