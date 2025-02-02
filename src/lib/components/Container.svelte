<script lang="ts">
    let { children }: {children?: import('svelte').Snippet} = $props();
</script>

<div>
    {@render children?.()}
</div>

<style>
    div {
        max-width: 70rem;
        margin: auto;

        padding: 0 1rem;
    }
</style>
