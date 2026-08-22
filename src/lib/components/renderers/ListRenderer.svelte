<script lang="ts">
    import type { List } from "mdast";
    import RootRenderer from "./RootRenderer.svelte";

    interface Props {
        dat: List;
    }

    let { dat }: Props = $props();
</script>

<svelte:element this={dat.ordered ? "ol" : "ul"}>
    {#each dat.children as child (child.position)}
        <li>
            {#each child.children as c (c.position)}
                <RootRenderer dat={c}></RootRenderer>
            {/each}
        </li>
    {/each}
</svelte:element>

<style lang="scss">
    ol,
    ul {
        margin-top: 0;

        & :global(p){
            margin: 0;
        }
    }

</style>
