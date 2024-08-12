<script lang="ts">
    import type { Link as LinkType } from "mdast";
    import StringRenderer from "./StringRenderer.svelte";
    import Link from "../Link.svelte";
    import Btn from "../Btn.svelte";
    import Icon from "../Icon.svelte";
    import { mdiDownload } from "@mdi/js";
    import { page } from "$app/stores";

    export let dat: LinkType;
</script>

{#if dat.url.startsWith("button:")}
    <span>
        {#if dat.url.startsWith("button:download:")}
            <Btn
                href="/_/raw/{$page.params.category}/{$page.params
                    .topic}/{dat.url.slice(16)}"
                title={dat.title ? dat.title : undefined}
                download
            >
                <Icon d={mdiDownload} inline></Icon>
                <StringRenderer dat={dat.children}></StringRenderer>
            </Btn>
        {:else}
            <Btn
                href={dat.url.slice(7)}
                title={dat.title ? dat.title : undefined}
            >
                <StringRenderer dat={dat.children}></StringRenderer>
            </Btn>
        {/if}
    </span>
{:else}
    <Link href={dat.url} title={dat.title}
        ><StringRenderer dat={dat.children}></StringRenderer></Link
    >
{/if}

<style>
    span {
        display: inline-block;
        margin: 0.5rem 0;
    }
</style>
