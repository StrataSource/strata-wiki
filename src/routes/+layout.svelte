<script lang="ts">
    import { gameMeta } from "$lib/stores";
    import "@fontsource/lexend-deca";
    import type { LayoutData } from "./$types";

    export let data: LayoutData;

    $gameMeta = data.games;
</script>

<slot></slot>

<style>
    :global(body) {
        background: #111;
        color: #fff;
        font-family: "Lexend Deca";

        margin: 0;

        --caution: #ed1166;
        --warning: #eeb43b;
        --success: #00ba52;
        --info: #7537ff;

        --strata: #f0413c;
        --strataBright: #ef8686;
        --strataDark: #a32b2b;
    }
</style>
