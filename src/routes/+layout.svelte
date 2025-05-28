<script lang="ts">
    import { gameMeta } from "$lib/stores";
    import "@fontsource/inter";
    import "@fontsource/lexend-deca";
    import type { LayoutData } from "./$types";
    import Topbar from "./Topbar.svelte";
    import Sidebar from "./Sidebar.svelte";
    import Footer from "./Footer.svelte";

    import faviconSvg from "$lib/assets/favicon.svg";
    import faviconPng from "$lib/assets/favicon.png";

    interface Props {
        data: LayoutData;
        children?: import('svelte').Snippet;
    }

    let { data, children }: Props = $props();

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
        {@render children?.()}
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
        color: #bbb;
        font-family: "Inter", "Helvetica Neue", system-ui, sans-serif;

        margin: 0;

        --caution: #ed1166;
        --warning: #eeb43b;
        --success: #00ba52;
        --info: #7537ff;

        --strata: #f0413c;
        --strataBright: #ef8686;
        --strataDark: #a32b2b;
    }

	:global(div.notice, code) {
		color: #ccc;
	}

	:global(h1, h2, h3, h4, h5, h6, div.code) {
		color: #eee;
	}

	:global(h1, h2, h3, h4, h5, h6) {
		font-family: "Lexend Deca", "Helvetica Neue", system-ui, sans-serif;
	}

	:global(a h1, a h2, a h3, a h4, a h5, a h6, a code, a div.code) {
		color: inherit;
	}

    div {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: calc(100vh - 4.1rem);
    }
</style>
