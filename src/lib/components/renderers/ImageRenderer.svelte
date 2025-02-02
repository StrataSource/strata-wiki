<script lang="ts">
    import type { Image } from "mdast";
    import { page } from "$app/stores";
    import YouTube from "../embeds/YouTube.svelte";

    interface Props {
        dat: Image;
    }

    let { dat }: Props = $props();
    let type: "image" | "aside" | "youtube" = $state("image");

    if (dat.url.startsWith("aside")) {
        type = "aside";
    }

    const ytRegex =
        /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(shorts\/)|(watch\?))\??v?=?([^#&?]*).*/;

    const ytMatched = dat.url.match(ytRegex);

    if (ytMatched) {
        type = "youtube";
    }
</script>

{#if type == "youtube"}
    <YouTube video={ytMatched ? ytMatched[8] : "error"}></YouTube>
{:else if type == "aside"}
    <aside>
        <a
            href="/_/raw/{$page.params.category}/{$page.params
                .topic}/{dat.url.slice(6)}"
            target="_blank"
        >
            <img
                src="/_/img/lo/{$page.params.category}/{$page.params
                    .topic}/{dat.url.slice(6)}"
                alt={dat.alt}
                title={dat.alt}
            />
        </a>
    </aside>
{:else}
    <a
        href="/_/raw/{$page.params.category}/{$page.params.topic}/{dat.url}"
        target="_blank"
    >
        <img
            src="/_/img/md/{$page.params.category}/{$page.params
                .topic}/{dat.url}"
            alt={dat.alt}
            title={dat.alt}
        />
    </a>
{/if}

<style lang="scss">
    img {
        max-height: 20rem;
        max-width: 100%;

        object-fit: contain;

        display: block;
    }

    a {
        display: inline-block;
        width: fit-content;
        max-width: 100%;
    }

    aside {
        float: right;
        padding-left: 0.5rem;

        & a {
            margin-bottom: 0;
        }

        & img {
            height: 11rem;
            max-width: 100%;
        }

        @media (max-width: 60rem) {
            float: none;
            text-align: center;

            & a {
                margin-bottom: 1rem;
            }
        }
    }
</style>
