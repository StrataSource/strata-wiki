<script lang="ts">
    import Link from "../Link.svelte";
    import StringRenderer from "./StringRenderer.svelte";
    import type { PhrasingContent } from "mdast";

    export let dat: PhrasingContent[];

    const simpleElements: {
        [tag: string]: string;
    } = {
        emphasis: "i",
        strong: "strong",
        inlineCode: "code",
        delete: "strike",
    };
</script>

{#each dat as e}
    {#if e.type == "text"}
        {e.value}
    {:else if e.type == "break"}
        <br />
    {:else if e.type == "image"}
        <img src={e.url} alt={e.alt} />
    {:else if e.type == "inlineCode"}
        <code>{e.value}</code>
    {:else if e.type == "link"}
        <Link href={e.url} title={e.title}
            ><StringRenderer dat={e.children}></StringRenderer></Link
        >
    {:else if e.type == "footnoteReference" || e.type == "html" || e.type == "imageReference" || e.type == "linkReference"}
        <!--Not implemented: {e.type}-->
    {:else if e.type in simpleElements}
        <svelte:element this={simpleElements[e.type]}
            ><StringRenderer dat={e.children}></StringRenderer></svelte:element
        >
    {:else}
        <strong>ERROR!</strong>
        Unknown text type <code>{e.type}</code>
    {/if}
{/each}
