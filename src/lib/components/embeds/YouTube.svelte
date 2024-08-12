<script lang="ts">
    import { consent } from "$lib/stores";
    import { mdiPlay } from "@mdi/js";
    import Icon from "../Icon.svelte";
    import Btn from "../Btn.svelte";

    export let video: string;

    let state: "inactive" | "consent" | "active" = "inactive";

    function play() {
        if ($consent.youtube === true) {
            state = "active";
        } else {
            state = "consent";
        }
    }

    function enable() {
        $consent.youtube = true;
        state = "active";
    }
</script>

<!-- Make sure Svelte generates the file because it dislikes the --bg variable, this file gets loaded anyway and doesn't impact performance twice -->
<svelte:head>
    <link rel="preload" href="/_/yt/{video}.jpg" as="image" />
</svelte:head>

<div class="wrapper" style:--bg="url(/_/yt/{video}.jpg)">
    {#if state == "inactive" || (state == "active" && $consent.youtube !== true)}
        <button on:click={play} class="inactive">
            <Icon d={mdiPlay}></Icon>
        </button>
    {:else if state == "consent"}
        <div class="consent">
            <strong>YouTube content</strong>
            <br />
            <div>To show you this content, we need to connect to YouTube.</div>
            <div>You can change this at any time in your privacy settings.</div>
            <br />
            <Btn on:click={enable}>Enable YouTube content</Btn>
        </div>
    {:else if state == "active"}
        <iframe
            src="https://www.youtube.com/embed/{video}?autoplay=1&color=white&rel=0"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
        ></iframe>
    {/if}
</div>

<style>
    .wrapper {
        max-height: 20rem;
        max-width: 100%;
        aspect-ratio: 16 / 9;

        background-size: cover;
        background-image: var(--bg);

        background-color: #333;
    }

    iframe {
        height: 100%;
        width: 100%;
    }

    button {
        color: currentColor;
        border: none;
        background: transparent;

        box-sizing: border-box;

        cursor: pointer;
    }

    .inactive,
    .consent {
        display: flex;
        align-items: center;
        justify-content: center;

        flex-direction: column;
        gap: 0.5rem;

        height: 100%;
        width: 100%;
    }

    .inactive {
        font-size: 10rem;
        filter: drop-shadow(#000 0 0 1rem);
    }

    .consent {
        background-color: #00000090;
    }
</style>
