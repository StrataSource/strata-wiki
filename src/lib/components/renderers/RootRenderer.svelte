<script lang="ts">
    import type { RootContent } from "mdast";
    import HeaderRenderer from "./HeaderRenderer.svelte";
    import StringRenderer from "./StringRenderer.svelte";
    import ListRenderer from "./ListRenderer.svelte";
    import CodeRenderer from "./CodeRenderer.svelte";
    import NoticeRenderer from "./NoticeRenderer.svelte";
    import TableRenderer from "./TableRenderer.svelte";

    export let dat: RootContent;

    export let i: number | undefined = undefined;
</script>

<div class="root" class:first={i === 0}>
    {#if dat.type == "heading"}
        <HeaderRenderer {dat}></HeaderRenderer>
    {:else if dat.type == "paragraph"}
        <p><StringRenderer dat={dat.children}></StringRenderer></p>
    {:else if dat.type == "list"}
        <ListRenderer {dat}></ListRenderer>
    {:else if dat.type == "code"}
        <CodeRenderer {dat}></CodeRenderer>
    {:else if dat.type == "blockquote"}
        <NoticeRenderer {dat}></NoticeRenderer>
    {:else if dat.type == "table"}
        <TableRenderer {dat}></TableRenderer>
    {:else if dat.type == "break"}
        <br />
    {:else if dat.type == "thematicBreak"}
        <hr />
    {:else if dat.type == "yaml"}
        <!--Not displayed-->
    {:else}
        <strong>ERROR!</strong> Unknown content type <code>{dat.type}</code>
    {/if}
</div>

<style>
    :global(.root:first-child *),
    :global(.first.root *) {
        margin-top: 0;
    }
    :global(.root:last-child *) {
        margin-bottom: 0;
    }
</style>
