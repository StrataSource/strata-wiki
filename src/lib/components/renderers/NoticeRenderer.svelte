<script lang="ts">
    import type { Blockquote, Code } from "mdast";
    import RootRenderer from "./RootRenderer.svelte";
    import Notice from "../Notice.svelte";

    export let dat: Blockquote;

    //Clone object to prevent confusing hydration and cache
    const d = structuredClone(dat);

    const types: NoticeType[] = [
        "normal",
        "note",
        "warning",
        "caution",
        "bug",
        "tip",
    ];
    let type: NoticeType = "normal";

    function getType() {
        const firstChild = d.children[0];
        if (
            firstChild.type == "paragraph" &&
            firstChild.children[0].type == "text"
        ) {
            const matched = firstChild.children[0].value.match(
                "^\\[\\!([A-Z0-9]+)\\]"
            );

            if (!matched || !matched[1]) {
                return;
            }

            const typeRaw = matched[1].toLowerCase();

            for (const t of types) {
                if (typeRaw === t) {
                    type = t;
                    //Remove tag from being displayed
                    firstChild.children[0].value =
                        firstChild.children[0].value.substring(
                            `[!${t}]`.length
                        );
                    break;
                }
            }
        }
    }

    getType();
</script>

<Notice {type}>
    {#each d.children as child, i}
        <RootRenderer dat={child} {i}></RootRenderer>
    {/each}
</Notice>
