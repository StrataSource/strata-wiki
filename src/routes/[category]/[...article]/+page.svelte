
<script lang="ts">
    import { page } from "$app/stores";
    import { afterNavigate, beforeNavigate } from "$app/navigation";
    import Link from "$lib/components/Link.svelte";
    import Metadata from "$lib/components/Metadata.svelte";
    import DeprecationNotice from "$lib/components/notices/DeprecationNotice.svelte";
    import ExperimentalNotice from "$lib/components/notices/ExperimentalNotice.svelte";
    import NoSupportNotice from "$lib/components/notices/NoSupportNotice.svelte";
    import SupportUnknownNotice from "$lib/components/notices/SupportUnknownNotice.svelte";
    import RootRenderer from "$lib/components/renderers/RootRenderer.svelte";
    import { currentArticle, currentGame } from "$lib/stores";
    import { getGamesWithSupport } from "$lib/supportChecker";
    import { onMount } from "svelte";
    import type { PageData } from "./$types";
    import UnknownSupportNotice from "$lib/components/notices/UnknownSupportNotice.svelte";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();

    if (!data.isTopic) {
        afterNavigate(() => {
            $currentArticle = data.articleMeta;
        });
    }
</script>

{#if data.isTopic}
    <Metadata title={data.meta.title}></Metadata>

    <h1>{data.meta.title}</h1>

    {#each data.menu.articles as article}
        <div>
            <Link href="/{$page.params.category}/{$page.params.article}/{article.id}">{article.meta.title}</Link>
        </div>
    {/each}

{:else}

    <Metadata title={data.articleMeta?.title || ""}></Metadata>

    <div class="notices">
        {#if data.articleMeta?.deprecated}
            <DeprecationNotice></DeprecationNotice>
        {/if}
        {#if data.articleMeta?.experimental}
            <ExperimentalNotice></ExperimentalNotice>
        {/if}
        {#key data.articleMeta?.features}
            {#if (data.articleMeta?.features?.length || 0) > 0}
                <div
                    data-pagefind-meta="support:{getGamesWithSupport(
                        data.articleMeta?.features || []
                    ).all
                        ? 'all'
                        : getGamesWithSupport(data.articleMeta?.features || []).games.join(
                            ','
                        )}"
                    data-pagefind-ignore
                >
                    {#if $currentGame == ""}
                        <SupportUnknownNotice features={data.articleMeta?.features || []}
                        ></SupportUnknownNotice>
                    {:else if getGamesWithSupport(data.articleMeta?.features || []).unknownGames.includes($currentGame)}
                        <UnknownSupportNotice></UnknownSupportNotice>
                    {:else if !getGamesWithSupport(data.articleMeta?.features || []).games.includes($currentGame)}
                        <NoSupportNotice></NoSupportNotice>
                    {/if}
                </div>
            {/if}
        {/key}
    </div>

    {#key data}
        {#each data.doc.children as obj}
            <RootRenderer dat={obj}></RootRenderer>
        {/each}
    {/key}

    <style>
        .notices {
            margin-top: 2rem;
        }
    </style>
{/if}
