<script lang="ts">
    export let href: string;
    export let title: string | null | undefined = undefined;
</script>

<a {href} {title}>
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
