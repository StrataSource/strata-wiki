<script lang="ts">
    import { afterNavigate, beforeNavigate } from "$app/navigation";
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

    afterNavigate(() => {
        $currentArticle = data.meta;
    });
</script>

<Metadata title={data.meta?.title || ""}></Metadata>

<div class="notices">
    {#if data.meta?.deprecated}
        <DeprecationNotice></DeprecationNotice>
    {/if}
    {#if data.meta?.experimental}
        <ExperimentalNotice></ExperimentalNotice>
    {/if}
    {#key data.meta?.features}
        {#if (data.meta?.features?.length || 0) > 0}
            <div
                data-pagefind-meta="support:{getGamesWithSupport(
                    data.meta?.features || []
                ).all
                    ? 'all'
                    : getGamesWithSupport(data.meta?.features || []).games.join(
                          ','
                      )}"
                data-pagefind-ignore
            >
                {#if $currentGame == ""}
                    <SupportUnknownNotice features={data.meta?.features || []}
                    ></SupportUnknownNotice>
                {:else if getGamesWithSupport(data.meta?.features || []).unknownGames.includes($currentGame)}
                    <UnknownSupportNotice></UnknownSupportNotice>
                {:else if !getGamesWithSupport(data.meta?.features || []).games.includes($currentGame)}
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
