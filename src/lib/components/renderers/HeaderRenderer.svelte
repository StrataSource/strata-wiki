<script lang="ts">
    import type { Heading, PhrasingContent } from "mdast";
    import StringRenderer from "./StringRenderer.svelte";
    import Icon from "../Icon.svelte";
    import { mdiCheck, mdiPencil, mdiPound } from "@mdi/js";
    import { page } from "$app/stores";

    export let dat: Heading;

    let id = "";

    function generateID(children: PhrasingContent[]) {
        for (const child of children) {
            switch (child.type) {
                case "text":
                    id += encodeURI(
                        child.value.toLowerCase().replaceAll(" ", "-")
                    );
                    break;
                case "delete":
                case "strong":
                case "emphasis":
                case "link":
                    generateID(child.children);
                    break;
                default:
                    break;
            }
        }
    }

    generateID(dat.children);

    let copySuccessful = 0;

    function copyHash() {
        navigator.clipboard.writeText(
            `${$page.url.origin}${$page.url.pathname}#${id}`
        );
        copySuccessful++;

        setTimeout(() => {
            copySuccessful--;
        }, 1000);
    }
</script>

<svelte:element this={"h" + dat.depth} {id} class="h">
    <StringRenderer dat={dat.children}></StringRenderer>
    <button title="Copy position" on:click={copyHash}>
        {#if copySuccessful > 0}
            <Icon d={mdiCheck} inline></Icon>
        {:else}
            <Icon d={mdiPound} inline></Icon>
        {/if}
    </button>
</svelte:element>

<style lang="scss">
    a,
    button {
        display: inline-block;

        padding: 0;
        border: 0;
        background: none;
        color: inherit;
        cursor: pointer;

        font-size: 1em;

        opacity: 0;

        transition: 250ms;

        text-decoration: none;

        &:hover {
            opacity: 1 !important;
        }
    }

    .h:hover {
        button {
            opacity: 0.5;
        }
    }

    h1 {
        margin-top: 0;
        font-size: 2rem;
    }
</style>
