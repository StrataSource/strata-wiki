<script lang="ts">
    import type { RootContent } from "mdast";
    import HeaderRenderer from "./HeaderRenderer.svelte";
    import StringRenderer from "./StringRenderer.svelte";
    import ListRenderer from "./ListRenderer.svelte";
    import CodeRenderer from "./CodeRenderer.svelte";
    import NoticeRenderer from "./NoticeRenderer.svelte";

    export let dat: RootContent;
</script>

<div>
    {#if dat.type == "heading"}
        <HeaderRenderer {dat}></HeaderRenderer>
    {:else if dat.type == "paragraph"}
        <StringRenderer dat={dat.children}></StringRenderer>
    {:else if dat.type == "list"}
        <ListRenderer {dat}></ListRenderer>
    {:else if dat.type == "code"}
        <CodeRenderer {dat}></CodeRenderer>
    {:else if dat.type == "blockquote"}
        <NoticeRenderer {dat}></NoticeRenderer>
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
