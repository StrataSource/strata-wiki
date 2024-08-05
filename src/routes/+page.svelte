<script lang="ts">
    import { page } from "$app/stores";
    import Link from "$lib/components/Link.svelte";
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

<h1>Strata Wiki</h1>

{#each data.menu as category}
    <div>
        <Link href="/{category.id}">{category.title}</Link>
    </div>
{/each}
