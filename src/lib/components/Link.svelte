<script lang="ts">
    export let href: string;
    export let title: string | null | undefined = undefined;
    export let target: "_blank" | undefined = undefined
</script>

<a {href} {title} {target}>
    <slot></slot>
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
