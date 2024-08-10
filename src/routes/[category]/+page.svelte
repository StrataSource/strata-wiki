<script lang="ts">
    import { page } from "$app/stores";
    import Link from "$lib/components/Link.svelte";
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

<h1>{data.meta.title}</h1>

{#each data.menu as topic}
    <div>
        <Link href="/{$page.params.category}/{topic.id}">{topic.title}</Link>
    </div>
{/each}
