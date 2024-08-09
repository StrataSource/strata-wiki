<script lang="ts">
    import DeprecationNotice from "$lib/components/notices/DeprecationNotice.svelte";
    import ExperimentalNotice from "$lib/components/notices/ExperimentalNotice.svelte";
    import NoSupportNotice from "$lib/components/notices/NoSupportNotice.svelte";
    import SupportUnknownNotice from "$lib/components/notices/SupportUnknownNotice.svelte";
    import RootRenderer from "$lib/components/renderers/RootRenderer.svelte";
    import { currentGame } from "$lib/stores";
    import { getGamesWithSupport } from "$lib/supportChecker";
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

{#if data.meta?.deprecated}
    <DeprecationNotice></DeprecationNotice>
{/if}
{#if data.meta?.experimental}
    <ExperimentalNotice></ExperimentalNotice>
{/if}
{#key data.meta?.features}
    {#if (data.meta?.features?.length || 0) > 0}
        {#if $currentGame == ""}
            <SupportUnknownNotice features={data.meta?.features || []}
            ></SupportUnknownNotice>
        {:else if !getGamesWithSupport(data.meta?.features || []).games.includes($currentGame)}
            <NoSupportNotice></NoSupportNotice>
        {/if}
    {/if}
{/key}

{#each data.doc.children as obj}
    <RootRenderer dat={obj}></RootRenderer>
{/each}
