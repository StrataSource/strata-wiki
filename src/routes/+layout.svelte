<script lang="ts">
    import { gameMeta } from "$lib/stores";
    import "@fontsource/lexend-deca";
    import type { LayoutData } from "./$types";
    import Topbar from "./Topbar.svelte";
    import Sidebar from "./Sidebar.svelte";
    import Footer from "./Footer.svelte";

    export let data: LayoutData;

    $gameMeta = data.games;
</script>

<Topbar></Topbar>

<Sidebar menu={data.menu}></Sidebar>

<div>
    <main>
        <slot></slot>
    </main>

    <Footer></Footer>
</div>

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

    div {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: calc(100vh - 4.1rem);
    }
</style>
