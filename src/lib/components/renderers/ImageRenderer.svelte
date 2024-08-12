<script lang="ts">
    import type { Image } from "mdast";
    import { page } from "$app/stores";
    import YouTube from "../embeds/YouTube.svelte";

    export let dat: Image;
    let type: "image" | "youtube" = "image";

    const ytRegex =
        /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(shorts\/)|(watch\?))\??v?=?([^#&?]*).*/;

    const ytMatched = dat.url.match(ytRegex);

    if (ytMatched) {
        type = "youtube";
    }
</script>

{#if type == "youtube"}
    <YouTube video={ytMatched ? ytMatched[8] : "error"}></YouTube>
{:else}
    <a
        href="/_/raw/{$page.params.category}/{$page.params.topic}/{dat.url}"
        target="_blank"
    >
        <img
            src="/_/img/lo/{$page.params.category}/{$page.params
                .topic}/{dat.url}"
            alt={dat.alt}
            title={dat.alt}
        />
    </a>
{/if}

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
