<script lang="ts">
    import { mdiSelectionEllipse } from "@mdi/js";
    import Notice from "../Notice.svelte";
    import { getGamesWithSupport } from "$lib/supportChecker";
    import { gameMeta } from "$lib/stores";

    export let features: string[];

    let support = getGamesWithSupport(features);

    let games = support.games;

    let gamesString = "";

    for (let index = 0; index < games.length; index++) {
        const game = games[index];

        if (index == games.length - 1 && games.length > 1) {
            gamesString += " and ";
        } else if (index != 0) {
            gamesString += ", ";
        }

        gamesString += $gameMeta[game].name;
    }
</script>

{#if !support.all}
    <Notice type="warning" icon={mdiSelectionEllipse} title="Limited support">
        This feature is only present in {gamesString}.
    </Notice>
{/if}
