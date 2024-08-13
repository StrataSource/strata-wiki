<script lang="ts">
</script>

<div class="wrapper">
    <article data-pagefind-body>
        <slot></slot>
    </article>
</div>

<style lang="scss">
    article {
        width: calc(100% - 25rem);
        padding: 0 2rem;
        padding-right: 5rem;

        margin-left: 18rem;

        vertical-align: middle;

        transition: 250ms;

        @media (max-width: 60rem) {
            width: calc(100% - 2rem);
            padding: 0 1rem;
            margin-left: 0;
        }
    }
</style>
