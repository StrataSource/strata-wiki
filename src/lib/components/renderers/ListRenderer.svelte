<script lang="ts">
    import type { List } from "mdast";
    import StringRenderer from "./StringRenderer.svelte";
    import RootRenderer from "./RootRenderer.svelte";

    interface Props {
        dat: List;
    }

    let { dat }: Props = $props();
</script>

<svelte:element this={dat.ordered ? "ol" : "ul"}>
    {#each dat.children as child}
        <li>
            {#each child.children as c}
                <RootRenderer dat={c}></RootRenderer>
            {/each}
        </li>
    {/each}
</svelte:element>

<style>
    ol,
    ul {
        margin-top: 0;
    }
</style>
