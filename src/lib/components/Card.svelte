<script lang="ts">
    let { children }: { children?: import("svelte").Snippet } = $props();
</script>

<div>
    {@render children?.()}
</div>

<style>
    div {
        background-color: #222;
        padding: 1rem;
        border-radius: 0.25rem;
    }
</style>
