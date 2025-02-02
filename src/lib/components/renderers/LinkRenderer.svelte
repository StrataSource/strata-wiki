<script lang="ts">
    import type { Link as LinkType } from "mdast";
    import StringRenderer from "./StringRenderer.svelte";
    import Link from "../Link.svelte";
    import Btn from "../Btn.svelte";
    import Icon from "../Icon.svelte";
    import { mdiDownload, mdiOpenInNew } from "@mdi/js";
    import { page } from "$app/stores";

    interface Props {
        dat: LinkType;
    }

    let { dat }: Props = $props();

    let external = dat.url.includes("://");
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
                target={external ? "_blank" : undefined}
            >
                <StringRenderer dat={dat.children}></StringRenderer>
                {#if external}
                    <Icon d={mdiOpenInNew} inline></Icon>
                {/if}
            </Btn>
        {/if}
    </span>
{:else}
    <Link
        href={dat.url}
        title={dat.title}
        target={external ? "_blank" : undefined}
    >
        <StringRenderer dat={dat.children}></StringRenderer>
        {#if external}
            <Icon d={mdiOpenInNew} inline></Icon>
        {/if}
    </Link>
{/if}

<style>
    span {
        display: inline-block;
        margin: 0.5rem 0;
    }
</style>
