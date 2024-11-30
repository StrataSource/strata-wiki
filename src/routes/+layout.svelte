<script lang="ts">
    import { gameMeta } from "$lib/stores";
    import "@fontsource/lexend-deca";
    import type { LayoutData } from "./$types";
    import Topbar from "./Topbar.svelte";
    import Sidebar from "./Sidebar.svelte";
    import Footer from "./Footer.svelte";

    import faviconSvg from "$lib/assets/favicon.svg";
    import faviconPng from "$lib/assets/favicon.png";

    export let data: LayoutData;

    $gameMeta = data.games;
</script>

<svelte:head>
    <link rel="icon" type="image/svg+xml" href={faviconSvg} />
    <link rel="icon" type="image/png" href={faviconPng} />
</svelte:head>

<Topbar></Topbar>

<Sidebar menu={data.menu}></Sidebar>

<div>
    <main>
        <slot></slot>
    </main>

    <Footer></Footer>
</div>

<style>
    :global(html) {
        overscroll-behavior: none;
        scroll-padding-top: 6rem;
    }

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
