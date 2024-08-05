<script lang="ts">
    import type { Code } from "mdast";

    import hljs from "highlight.js";
    import "highlight.js/styles/felipec.min.css";
    import Icon from "../Icon.svelte";
    import { mdiCheck, mdiContentCopy } from "@mdi/js";

    export let dat: Code;

    let copySuccess = 0;

    function copy() {
        navigator.clipboard.writeText(dat.value);

        copySuccess++;

        setTimeout(() => {
            copySuccess--;
        }, 1000);
    }
</script>

<div class="wrapper">
    <div class="actions">
        <button on:click={copy} title="Copy code">
            {#if copySuccess > 0}
                <Icon d={mdiCheck}></Icon>
            {:else}
                <Icon d={mdiContentCopy}></Icon>
            {/if}
        </button>
    </div>
    <div class="code">
        {@html hljs.highlight(dat.value, { language: dat.lang || "text" })
            .value}
    </div>
</div>

<style lang="scss">
    .wrapper {
        background-color: #222;
        border-radius: 0.25rem;
        margin: 0.25rem 0;

        position: relative;
    }

    .code {
        padding: 1rem;
        overflow-x: auto;
        white-space: pre;
    }

    .actions {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        opacity: 0;

        transition: 250ms;

        & button {
            background-color: transparent;
            border: none;
            outline: none;
            color: currentColor;
            cursor: pointer;
        }
    }

    .wrapper:hover,
    .wrapper:focus {
        & .actions {
            opacity: 1;
        }
    }
</style>
