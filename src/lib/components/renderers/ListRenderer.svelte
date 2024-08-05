<script lang="ts">
    import type { List } from "mdast";
    import StringRenderer from "./StringRenderer.svelte";
    import RootRenderer from "./RootRenderer.svelte";

    export let dat: List;
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
