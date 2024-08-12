<script lang="ts">
    import type { Link as LinkType } from "mdast";
    import StringRenderer from "./StringRenderer.svelte";
    import Link from "../Link.svelte";
    import Btn from "../Btn.svelte";

    export let dat: LinkType;
</script>

{#if dat.url.startsWith("button:")}
    <Btn href={dat.url.slice(7)} title={dat.title ? dat.title : undefined}
        ><StringRenderer dat={dat.children}></StringRenderer></Btn
    >
{:else}
    <Link href={dat.url} title={dat.title}
        ><StringRenderer dat={dat.children}></StringRenderer></Link
    >
{/if}
