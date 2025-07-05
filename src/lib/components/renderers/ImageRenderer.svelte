<script lang="ts">
    import type { Image } from "mdast";
    import YouTube from "../embeds/YouTube.svelte";
    import { currentTopic } from "$lib/stores";

    interface Props {
        dat: Image;
    }

    let { dat }: Props = $props();
    let type: "image" | "aside" | "youtube" = $state("image");

    let contentURL = $state(dat.url);

    if (dat.url.startsWith("aside")) {
        type = "aside";
        contentURL = dat.url.slice(6);
    }

    const ytRegex =
        /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(shorts\/)|(watch\?))\??v?=?([^#&?]*).*/;

    const ytMatched = dat.url.match(ytRegex);

    if (ytMatched) {
        type = "youtube";
        contentURL = ytMatched[8];
    }

</script>

{#if type == "youtube"}
    <YouTube video={ytMatched ? contentURL : "error"}></YouTube>
{:else if type == "aside"}
    <aside>
        <a
            href="/_/raw/{$currentTopic}/{contentURL}"
            target="_blank"
        >
            <img
                src="/_/img/lo/{$currentTopic}/{contentURL}"
                alt={dat.alt}
                title={dat.alt}
            />
        </a>
    </aside>
{:else}
    <div class="center">
        <a
            href="/_/raw/{$currentTopic}/{contentURL}"
            target="_blank"
        >
            <img
                src="/_/img/md/{$currentTopic}/{contentURL}"
                alt={dat.alt}
                title={dat.alt}
            />
        </a>
    </div>
{/if}

<style lang="scss">
    div.center {
        display: flex;
        justify-content: center;
		margin: 1.0em 0;
    }

    a {
		display: contents;
    }

    img {
        border-radius: 0.25rem;
		max-height: 20rem;
        max-width: 80%;
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
