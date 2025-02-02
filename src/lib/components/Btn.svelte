<script lang="ts">
    import { createEventDispatcher } from "svelte";

    interface Props {
        href?: string;
        title?: string | undefined;
        download?: boolean;
        target?: "_blank" | undefined;
        children?: import('svelte').Snippet;
    }

    let {
        href = "",
        title = undefined,
        download = false,
        target = undefined,
        children
    }: Props = $props();

    const dispatch = createEventDispatcher();
</script>

{#if href == ""}
    <button {title} onclick={(e) => dispatch("click", e)}>
        {@render children?.()}
    </button>
{:else}
    <a
        {href}
        {title}
        {target}
        download={download ? href.split("/").at(-1) : undefined}
        onclick={(e) => dispatch("click", e)}
    >
        {@render children?.()}
    </a>
{/if}

<style lang="scss">
    a,
    button {
        display: inline-block;

        text-decoration: none;
        padding: 0.5rem 1rem;

        background-color: var(--strata);
        color: white;

        border: none;
        font-size: 1em;
        outline: none;
        cursor: pointer;

        font-family: inherit;

        border-radius: 0.25rem;

        transition: 250ms;

        &:hover,
        &:focus {
            background-color: var(--strataBright);
        }
    }
</style>
