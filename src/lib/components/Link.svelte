<script lang="ts">
    interface Props {
        href: string;
        title?: string | null | undefined;
        target?: "_blank" | undefined;
        children?: import('svelte').Snippet;
    }

    let {
        href,
        title = undefined,
        target = undefined,
        children
    }: Props = $props();
</script>

<a {href} {title} {target}>
    {@render children?.()}
</a>

<style lang="scss">
    a {
        color: var(--strata);
        text-decoration: none;

        transition: 250ms;

        &:hover,
        &:focus {
            color: var(--strataBright);
        }
    }
</style>
