<script lang="ts">
    import type { Image } from "mdast";
    import StringRenderer from "./StringRenderer.svelte";
    import RootRenderer from "./RootRenderer.svelte";
    import { page } from "$app/stores";

    export let dat: Image;
</script>

<a
    href="/_/img/raw/{$page.params.category}/{$page.params.topic}/{dat.url}"
    target="_blank"
>
    <img
        src="/_/img/low/{$page.params.category}/{$page.params.topic}/{dat.url}"
        alt={dat.alt}
        title={dat.alt}
    />
</a>

<style>
    img {
        height: 20rem;
        max-width: 100%;
        display: block;
    }

    a {
        display: inline-block;
        width: fit-content;
        margin-bottom: 1rem;
        max-width: 100%;
    }
</style>
