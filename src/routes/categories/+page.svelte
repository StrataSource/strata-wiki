<script lang="ts">
    import Link from "$lib/components/Link.svelte";
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

{#each data.categories as category}
    <div>
        <Link href="/{category.id}">{category.title}</Link>
    </div>
{/each}
