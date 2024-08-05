<script lang="ts">
    import RootRenderer from "$lib/components/renderers/RootRenderer.svelte";
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

{#each data.doc.children as obj}
    <RootRenderer dat={obj}></RootRenderer>
{/each}
