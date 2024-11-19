<script lang="ts">
    import { page } from "$app/stores";
    import Container from "$lib/components/Container.svelte";
    import Link from "$lib/components/Link.svelte";
</script>

<footer class:sidebar={$page.params.category}>
    &copy;2023-{new Date().getFullYear()}
    <Link href="https://stratasource.org" target="_blank">Strata Source</Link> Contributors
    - <Link href="https://github.com/StrataSource/Wiki/blob/main/LICENSE.md"
        >Content License</Link
    >
</footer>

<style lang="scss">
    footer {
        background-color: #222;
        width: calc(100% - 4rem);
        margin-top: 2rem;
        padding: 1rem 2rem;

        @media (max-width: 60rem) {
            width: calc(100% - 2rem) !important;
            margin-left: 0 !important;
            padding: 1rem;
        }
    }

    .sidebar {
        width: calc(100% - 22rem);
        margin-left: 18rem;
    }
</style>
